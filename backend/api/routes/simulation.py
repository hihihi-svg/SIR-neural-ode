from fastapi import APIRouter
from schemas.request_models import SimulationInput
import os
import numpy as np

router = APIRouter(
    prefix="/simulate",
    tags=["Simulation"]
)

# Load baseline SIR parameters
try:
    params_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models", "sir_params.npy"))
    if os.path.exists(params_path):
        beta, gamma = np.load(params_path)
    else:
        beta, gamma = 0.062218, 0.05
except Exception:
    beta, gamma = 0.062218, 0.05


def euler_sir(beta: float, gamma: float, v: float, mobility: float,
              lockdown_intensity: float, lockdown_day: int,
              days: int, x0: np.ndarray) -> np.ndarray:
    """
    Pure NumPy Euler integration of the SIR ODE system.
    Returns array of shape (days, 3) with [S, I, R] columns.
    """
    dt = 1.0
    states = np.zeros((days, 3))
    states[0] = x0

    for t in range(1, days):
        S, I, R = states[t - 1]

        # Apply lockdown reduction after lockdown_day
        eff_mobility = mobility * (1.0 - lockdown_intensity) if t >= lockdown_day > 0 else mobility
        eff_beta = beta * eff_mobility

        dS = -eff_beta * S * I - v * S
        dI = eff_beta * S * I - gamma * I
        dR = gamma * I + v * S

        states[t] = [
            np.clip(S + dt * dS, 0.0, 1.0),
            np.clip(I + dt * dI, 0.0, 1.0),
            np.clip(R + dt * dR, 0.0, 1.0),
        ]

    return states


@router.post("/")
def simulate(data: SimulationInput):
    days = 160
    x0 = np.array([0.99, 0.01, 0.0])
    v = data.vaccination * 0.005

    # Scenario 1: Baseline (no lockdown)
    baseline = euler_sir(beta, gamma, v, data.mobility, 0.0, 0, days, x0)

    # Scenario 2: With user-defined intervention
    intervention = euler_sir(beta, gamma, v, data.mobility,
                             data.lockdown_intensity, data.lockdown_day, days, x0)

    # Scenario 3: Worst case (full mobility, no vaccination, no lockdown)
    worst = euler_sir(beta, gamma, 0.0, 1.0, 0.0, 0, days, x0)

    trajectories = []
    for idx in range(days):
        trajectories.append({
            "day": idx + 1,
            "baseline": float(baseline[idx, 1]),
            "intervention": float(intervention[idx, 1]),
            "worst_case": float(worst[idx, 1]),
        })

    return {
        "status": "simulation complete",
        "days": days,
        "trajectories": trajectories,
    }
