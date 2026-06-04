from fastapi import APIRouter
from schemas.request_models import PredictionInput
import os
import sys
import torch
import numpy as np
from torchdiffeq import odeint

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

# Append backend directory to sys.path to allow imports from models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from models.hybrid.hybrid_model import HybridODE

# Load baseline parameters
try:
    params_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models", "sir_params.npy"))
    if os.path.exists(params_path):
        beta, gamma = np.load(params_path)
        print(f"[Prediction API] Loaded optimized parameters: Beta={beta:.6f}, Gamma={gamma:.6f}")
    else:
        beta, gamma = 0.062218, 0.0
        print(f"[Prediction API] sir_params.npy not found, using fallback: Beta={beta:.6f}, Gamma={gamma:.6f}")
except Exception as e:
    print(f"[Prediction API] Error loading parameters: {e}")
    beta, gamma = 0.062218, 0.0

# Initialize model and load weights
hybrid_model = None
try:
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models", "hybrid.pt"))
    if os.path.exists(model_path):
        hybrid_model = HybridODE(beta, gamma)
        hybrid_model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        hybrid_model.eval()
        print(f"[Prediction API] Loaded Hybrid model weights from {model_path}")
    else:
        print(f"[Prediction API] hybrid.pt not found. Will run without neural correction.")
except Exception as e:
    print(f"[Prediction API] Error loading Hybrid model: {e}")

class InteractiveHybridODE(torch.nn.Module):
    def __init__(self, beta, gamma, mobility, vaccination, neural_model):
        super().__init__()
        self.beta = beta * mobility
        # Scale vaccination rate: say vaccination rate of 1.0 translates to 0.005 transition rate out of S daily
        self.v = vaccination * 0.005
        self.gamma = gamma
        self.neural = neural_model

    def forward(self, t, state):
        if len(state.shape) == 1:
            S, I, R = state[0], state[1], state[2]
            dS = -self.beta * S * I - self.v * S
            dI = self.beta * S * I - self.gamma * I
            dR = self.gamma * I + self.v * S
            sir = torch.stack([dS, dI, dR])
        else:
            S, I, R = state[:, 0], state[:, 1], state[:, 2]
            dS = -self.beta * S * I - self.v * S
            dI = self.beta * S * I - self.gamma * I
            dR = self.gamma * I + self.v * S
            sir = torch.stack([dS, dI, dR], dim=1)
            
        if self.neural is not None:
            # We scale the correction by 0.01 just like in training
            correction = self.neural(t, state) * 0.01
        else:
            correction = torch.zeros_like(sir)
        return sir + correction

@router.post("/")
def predict(data: PredictionInput):
    # Initial conditions
    i0 = data.infected / data.population
    s0 = 1.0 - i0
    r0 = 0.0
    x0 = torch.tensor([s0, i0, r0], dtype=torch.float32)
    
    t = torch.linspace(0.0, float(data.days - 1), data.days)
    
    # Run integration
    with torch.no_grad():
        ode_func = InteractiveHybridODE(
            beta, 
            gamma, 
            data.mobility, 
            data.vaccination, 
            hybrid_model.neural if hybrid_model else None
        )
        sol = odeint(ode_func, x0, t, method="euler")
        
    trajectory = []
    for idx in range(data.days):
        trajectory.append({
            "day": idx + 1,
            "susceptible": float(sol[idx, 0].item()),
            "infected": float(sol[idx, 1].item()),
            "recovered": float(sol[idx, 2].item()),
            "cases": float(sol[idx, 1].item())  # UI uses 'cases' key for line chart mapping
        })
        
    return {
        "population": data.population,
        "forecast_days": data.days,
        "status": "prediction complete",
        "trajectory": trajectory
    }

