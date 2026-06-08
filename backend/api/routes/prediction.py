from fastapi import APIRouter
from schemas.request_models import PredictionInput
import os
import numpy as np

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

# Load baseline SIR parameters
try:
    params_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models", "sir_params.npy"))
    if os.path.exists(params_path):
        beta, gamma = np.load(params_path)
        print(f"[Prediction API] Loaded optimized parameters: Beta={beta:.6f}, Gamma={gamma:.6f}")
    else:
        beta, gamma = 0.062218, 0.05
        print(f"[Prediction API] sir_params.npy not found, using fallback: Beta={beta:.6f}, Gamma={gamma:.6f}")
except Exception as e:
    print(f"[Prediction API] Error loading parameters: {e}")
    beta, gamma = 0.062218, 0.05


def euler_sir_predict(beta: float, gamma: float, mobility: float, vaccination: float,
                      days: int, x0: np.ndarray) -> np.ndarray:
    """
    Pure NumPy Euler integration of the extended SIR ODE for predictions.
    Includes mobility scaling of beta and vaccination-driven flow out of S.
    Returns array of shape (days, 3) with [S, I, R] columns.
    """
    dt = 1.0
    eff_beta = beta * mobility
    v = vaccination * 0.005

    states = np.zeros((days, 3))
    states[0] = x0

    for t in range(1, days):
        S, I, R = states[t - 1]

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
def predict(data: PredictionInput):
    # Normalize initial conditions to fractions
    i0 = data.infected / data.population
    s0 = max(0.0, 1.0 - i0)
    r0 = 0.0
    x0 = np.array([s0, i0, r0])

    sol = euler_sir_predict(beta, gamma, data.mobility, data.vaccination, data.days, x0)

    trajectory = []
    for idx in range(data.days):
        trajectory.append({
            "day": idx + 1,
            "susceptible": float(sol[idx, 0]),
            "infected": float(sol[idx, 1]),
            "recovered": float(sol[idx, 2]),
            "cases": float(sol[idx, 1]),  # UI uses 'cases' key for line chart mapping
        })

    return {
        "population": data.population,
        "forecast_days": data.days,
        "status": "prediction complete",
        "trajectory": trajectory,
    }
