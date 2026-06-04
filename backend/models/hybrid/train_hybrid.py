import os
import sys
import torch
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from torchdiffeq import odeint

# Ensure the backend directory is in the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from hybrid_model import HybridODE

def train():
    # Load dataset
    data_path = "../../../datasets/processed/processed.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Processed dataset not found: {data_path}")
        
    data = pd.read_csv(data_path)
    infected = torch.tensor(
        data["confirmed"].values,
        dtype=torch.float32
    )

    # Load optimized parameters from Step 3
    params_path = "../../../saved_models/sir_params.npy"
    if os.path.exists(params_path):
        beta, gamma = np.load(params_path)
        print(f"Loaded optimized parameters from baseline: Beta={beta:.6f}, Gamma={gamma:.6f}")
    else:
        # Fallback to learned values if parameter file is missing
        beta, gamma = 0.062218, 0.000000
        print(f"sir_params.npy not found, using fallback: Beta={beta:.6f}, Gamma={gamma:.6f}")

    # Initialize model
    model = HybridODE(beta, gamma)
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=0.001
    )

    time = torch.linspace(
        0,
        len(infected)-1,
        len(infected)
    )

    # Initial condition [S0, I0, R0]
    x0 = torch.tensor(
        [0.99, 0.01, 0.0],
        dtype=torch.float32
    )

    print("Starting training of Hybrid Model...")
    for epoch in range(200):
        optimizer.zero_grad()
        
        # Integrate hybrid model forward over time using euler solver
        pred = odeint(
            model,
            x0,
            time,
            method="euler"
        )
        
        # Fit the infected compartment pred[:, 1] to cumulative cases
        loss = ((pred[:, 1] - infected) ** 2).mean()
        
        loss.backward()
        optimizer.step()
        
        if epoch % 20 == 0:
            print(f"Epoch {epoch:03d} | Loss: {loss.item():.6f}")

    print(f"Final training loss: {loss.item():.6f}")

    # Save model weights to root saved_models folder
    model_dir = "../../../saved_models"
    os.makedirs(model_dir, exist_ok=True)
    model_save_path = os.path.join(model_dir, "hybrid.pt")
    torch.save(model.state_dict(), model_save_path)
    print(f"Model saved to {model_save_path}")

    # Save predictions for comparison system
    results_dir = "../../../results"
    os.makedirs(results_dir, exist_ok=True)
    pred_np = pred.detach().cpu().numpy()
    np.save(os.path.join(results_dir, "hybrid_pred.npy"), pred_np[:, 1])
    print("Saved hybrid_pred.npy to results/")

    # Visualize predictions and save comparison plot
    pred_np = pred.detach().cpu().numpy()
    infected_np = infected.numpy()

    plt.figure(figsize=(10, 6))
    plt.plot(infected_np, label="Real (Normalized Confirmed)")
    plt.plot(pred_np[:, 1], label="Hybrid Fit", linestyle="--")
    plt.xlabel("Days")
    plt.ylabel("Infected Population Fraction")
    plt.title("Hybrid SIR + Neural ODE Model Fitting on COVID-19 Data (Italy First Wave)")
    plt.legend()
    
    fig_dir = "../../../results/figures"
    os.makedirs(fig_dir, exist_ok=True)
    fig_save_path = os.path.join(fig_dir, "hybrid_fit.png")
    plt.savefig(fig_save_path)
    print(f"Prediction graph saved to {fig_save_path}")

    # Commented out plt.show() to prevent blocking in non-interactive runs
    # plt.show()

if __name__ == "__main__":
    train()
