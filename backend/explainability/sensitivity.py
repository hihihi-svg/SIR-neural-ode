import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Ensure the backend directory is in the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.sir.sir_model import sir_equations
from scipy.integrate import odeint

def run_sensitivity():
    results_dir = "../../results"
    params_path = "../../saved_models/sir_params.npy"
    real_path = os.path.join(results_dir, "real.npy")
    
    if os.path.exists(params_path):
        beta, gamma = np.load(params_path)
    else:
        beta, gamma = 0.062218, 0.0
        
    if os.path.exists(real_path):
        real_data = np.load(real_path)
        days = len(real_data)
    else:
        days = 162
        
    # Vary beta by delta = 10%
    delta = 0.1
    beta_low = beta * (1 - delta)
    beta_high = beta * (1 + delta)
    
    S0, I0, R0 = 0.99, 0.01, 0.0
    t = np.arange(days)
    
    # Run simulations
    sol_nom = odeint(sir_equations, [S0, I0, R0], t, args=(beta, gamma))[:, 1]
    sol_low = odeint(sir_equations, [S0, I0, R0], t, args=(beta_low, gamma))[:, 1]
    sol_high = odeint(sir_equations, [S0, I0, R0], t, args=(beta_high, gamma))[:, 1]
    
    # Save sensitivity table to CSV
    df = pd.DataFrame({
        "day": t,
        "nominal_infections": sol_nom,
        "lower_beta_infections": sol_low,
        "higher_beta_infections": sol_high
    })
    
    exp_dir = os.path.join(results_dir, "explainability")
    os.makedirs(exp_dir, exist_ok=True)
    
    csv_path = os.path.join(exp_dir, "sensitivity.csv")
    df.to_csv(csv_path, index=False)
    print(f"Sensitivity data saved to {csv_path}")
    
    # Plot sensitivity curves
    plt.figure(figsize=(10, 6))
    plt.plot(sol_nom, label=f"Nominal Beta ({beta:.4f})", color="tab:blue", linewidth=2.5)
    plt.plot(sol_low, label=f"Low Beta -10% ({beta_low:.4f})", color="tab:blue", linestyle=":", linewidth=2)
    plt.plot(sol_high, label=f"High Beta +10% ({beta_high:.4f})", color="tab:blue", linestyle="--", linewidth=2)
    
    plt.xlabel("Days")
    plt.ylabel("Infected Population Fraction")
    plt.title("Parameter Sensitivity Analysis (Outbreak Size vs. Transmission Rate)")
    plt.legend()
    plt.grid(True, linestyle=":", alpha=0.6)
    
    save_path = os.path.join(exp_dir, "sensitivity_plot.png")
    plt.savefig(save_path)
    print(f"Sensitivity analysis graph saved to {save_path}")

if __name__ == "__main__":
    run_sensitivity()
