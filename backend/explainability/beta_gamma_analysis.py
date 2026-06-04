import os
import sys
import numpy as np
import torch
import matplotlib.pyplot as plt

# Ensure the backend directory is in the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.hybrid.hybrid_model import HybridODE

def run_analysis():
    results_dir = "../../results"
    model_path = "../../saved_models/hybrid.pt"
    params_path = "../../saved_models/sir_params.npy"
    real_path = os.path.join(results_dir, "real.npy")
    
    if not all(os.path.exists(p) for p in [model_path, params_path, real_path]):
        print("Required model or params not found. Using fallback parameters.")
        beta, gamma = 0.062218, 0.0
        infected = np.linspace(0.01, 1.0, 162)
    else:
        beta, gamma = np.load(params_path)
        infected = np.load(real_path)

    # Initialize model and load weights
    model = HybridODE(beta, gamma)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path))
        model.eval()
        
    T = len(infected)
    
    # Load the predicted state trajectories
    hybrid_pred_path = os.path.join(results_dir, "hybrid_pred.npy")
    if os.path.exists(hybrid_pred_path):
        I_pred = np.load(hybrid_pred_path)
    else:
        I_pred = infected
        
    S_pred = 1.0 - I_pred
    R_pred = np.zeros_like(I_pred)
    states = np.stack([S_pred, I_pred, R_pred], axis=1)
    
    # Compute the neural correction for each day
    corrections = []
    with torch.no_grad():
        for t_idx in range(T):
            t_val = torch.tensor(float(t_idx))
            state_val = torch.tensor(states[t_idx], dtype=torch.float32)
            # Correction was scaled by 0.01 in the forward pass of hybrid_model
            corr = model.neural(t_val, state_val).numpy() * 0.01
            corrections.append(corr)
            
    corrections = np.array(corrections)
    
    # Plot corrections
    plt.figure(figsize=(10, 6))
    plt.plot(corrections[:, 0], label="Susceptible Correction (f_S)", color="tab:blue", linewidth=2)
    plt.plot(corrections[:, 1], label="Infected Correction (f_I)", color="tab:orange", linewidth=2)
    plt.plot(corrections[:, 2], label="Recovered Correction (f_R)", color="tab:green", linewidth=2)
    
    plt.xlabel("Days")
    plt.ylabel("Correction Rate Value")
    plt.title("Neural Network Correction Functions (f_theta) over Time")
    plt.legend()
    plt.grid(True, linestyle=":", alpha=0.6)
    
    exp_dir = os.path.join(results_dir, "explainability")
    os.makedirs(exp_dir, exist_ok=True)
    save_path = os.path.join(exp_dir, "beta_plot.png")
    plt.savefig(save_path)
    print(f"Explainability corrections graph saved to {save_path}")

if __name__ == "__main__":
    run_analysis()
