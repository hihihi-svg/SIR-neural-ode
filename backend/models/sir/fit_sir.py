import os
import pandas as pd
import numpy as np

from scipy.integrate import odeint
from scipy.optimize import minimize

import matplotlib.pyplot as plt

def sir(y, t, beta, gamma):
    S, I, R = y
    dSdt = -beta * S * I
    dIdt = beta * S * I - gamma * I
    dRdt = gamma * I
    return [dSdt, dIdt, dRdt]

def simulate(beta, gamma, days):
    S0 = 0.99
    I0 = 0.01
    R0 = 0
    t = np.arange(days)
    sol = odeint(
        sir,
        [S0, I0, R0],
        t,
        args=(beta, gamma)
    )
    return sol[:, 1]

def loss(params, real_data):
    beta, gamma = params
    pred = simulate(
        beta,
        gamma,
        len(real_data)
    )
    return np.mean(
        (pred - real_data) ** 2
    )

def run_fitting():
    data_path = "../../../datasets/processed/processed.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Processed dataset not found: {data_path}")
        
    data = pd.read_csv(data_path)
    infected = data["confirmed"].values

    result = minimize(
        loss,
        [0.3, 0.1],
        args=(infected,),
        bounds=[(0, 2), (0, 2)]
    )

    beta_opt, gamma_opt = result.x
    print(f"Optimization completed. Success: {result.success}")
    print(f"Beta = {beta_opt:.6f}")
    print(f"Gamma = {gamma_opt:.6f}")
    print(f"Derived R0 = {beta_opt / gamma_opt if gamma_opt > 0 else 0.0:.6f}")

    predicted = simulate(
        beta_opt,
        gamma_opt,
        len(infected)
    )

    plt.figure(figsize=(10, 6))
    plt.plot(infected, label="Real (Normalized Confirmed)")
    plt.plot(predicted, label="SIR Fitted Prediction", linestyle="--")
    plt.xlabel("Days")
    plt.ylabel("Infected Population Fraction")
    plt.title("SIR Model Parameter Fitting on COVID-19 Data (Italy First Wave)")
    plt.legend()
    
    fig_dir = "../../../results/figures"
    os.makedirs(fig_dir, exist_ok=True)
    save_path = os.path.join(fig_dir, "sir_fit_comparison.png")
    plt.savefig(save_path)
    print(f"Comparison graph saved to {save_path}")
    
    model_dir = "../../../saved_models"
    os.makedirs(model_dir, exist_ok=True)
    param_path = os.path.join(model_dir, "sir_params.npy")
    np.save(param_path, [beta_opt, gamma_opt])
    print(f"Optimized parameters saved to {param_path}")

    # Save predictions for comparison system
    results_dir = "../../../results"
    os.makedirs(results_dir, exist_ok=True)
    np.save(os.path.join(results_dir, "real.npy"), infected)
    np.save(os.path.join(results_dir, "sir_pred.npy"), predicted)
    print("Saved real.npy and sir_pred.npy to results/")

    # Commented out plt.show() to prevent blocking in non-interactive runs
    # plt.show()

if __name__ == "__main__":
    run_fitting()
