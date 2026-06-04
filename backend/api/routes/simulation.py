from fastapi import APIRouter
from schemas.request_models import SimulationInput
import os
import sys
import torch
import numpy as np
from torchdiffeq import odeint

router = APIRouter(
    prefix="/simulate",
    tags=["Simulation"]
)

# Append backend directory to sys.path to allow imports from models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from models.hybrid.hybrid_model import HybridODE

# Load baseline parameters
try:
    params_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models", "sir_params.npy"))
    if os.path.exists(params_path):
        beta, gamma = np.load(params_path)
    else:
        beta, gamma = 0.062218, 0.0
except Exception:
    beta, gamma = 0.062218, 0.0

# Initialize model and load weights
hybrid_model = None
try:
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models", "hybrid.pt"))
    if os.path.exists(model_path):
        hybrid_model = HybridODE(beta, gamma)
        hybrid_model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        hybrid_model.eval()
except Exception as e:
    print(f"[Simulation API] Error loading Hybrid model: {e}")

class InterventionalODE(torch.nn.Module):
    def __init__(self, beta, gamma, base_mobility, vaccination, lockdown_intensity, lockdown_day, neural_model):
        super().__init__()
        self.beta = beta
        self.gamma = gamma
        self.base_mobility = base_mobility
        self.lockdown_intensity = lockdown_intensity
        self.lockdown_day = lockdown_day
        self.v = vaccination * 0.005
        self.neural = neural_model
        
    def forward(self, t, state):
        current_time = t.item() if hasattr(t, 'item') else float(t)
        # Apply lockdown intensity if current time is past lockdown day
        if current_time >= self.lockdown_day:
            eff_mobility = self.base_mobility * (1.0 - self.lockdown_intensity)
        else:
            eff_mobility = self.base_mobility
            
        eff_beta = self.beta * eff_mobility
        
        if len(state.shape) == 1:
            S, I, R = state[0], state[1], state[2]
            dS = -eff_beta * S * I - self.v * S
            dI = eff_beta * S * I - self.gamma * I
            dR = self.gamma * I + self.v * S
            sir = torch.stack([dS, dI, dR])
        else:
            S, I, R = state[:, 0], state[:, 1], state[:, 2]
            dS = -eff_beta * S * I - self.v * S
            dI = eff_beta * S * I - self.gamma * I
            dR = self.gamma * I + self.v * S
            sir = torch.stack([dS, dI, dR], dim=1)
            
        if self.neural is not None:
            correction = self.neural(t, state) * 0.01
        else:
            correction = torch.zeros_like(sir)
        return sir + correction

@router.post("/")
def simulate(data: SimulationInput):
    days = 160
    t = torch.linspace(0.0, float(days - 1), days)
    
    # Standard initial conditions [S0, I0, R0]
    x0 = torch.tensor([0.99, 0.01, 0.0], dtype=torch.float32)
    
    with torch.no_grad():
        # Scenario 1: Baseline (using nominal mobility and vaccination rate, no lockdown)
        baseline_ode = InterventionalODE(beta, gamma, data.mobility, data.vaccination, 0.0, 0, hybrid_model.neural if hybrid_model else None)
        baseline_sol = odeint(baseline_ode, x0, t, method="euler")
        
        # Scenario 2: Intervention (using policy parameters, lockdown activated)
        intervention_ode = InterventionalODE(beta, gamma, data.mobility, data.vaccination, data.lockdown_intensity, data.lockdown_day, hybrid_model.neural if hybrid_model else None)
        intervention_sol = odeint(intervention_ode, x0, t, method="euler")
        
        # Scenario 3: Worst Case (uncontrolled spread - high mobility, no vaccination)
        worst_ode = InterventionalODE(beta, gamma, 1.0, 0.0, 0.0, 0, hybrid_model.neural if hybrid_model else None)
        worst_sol = odeint(worst_ode, x0, t, method="euler")
        
    trajectories = []
    for idx in range(days):
        trajectories.append({
            "day": idx + 1,
            "baseline": float(baseline_sol[idx, 1].item()),
            "intervention": float(intervention_sol[idx, 1].item()),
            "worst_case": float(worst_sol[idx, 1].item())
        })
        
    return {
        "status": "simulation complete",
        "days": days,
        "trajectories": trajectories
    }

