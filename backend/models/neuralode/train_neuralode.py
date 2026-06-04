import os
import torch
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from neural_ode import NeuralODEModel

def train():
    # Load dataset (three levels up from backend/models/neuralode/)
    data_path = "../../../datasets/processed/processed.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Processed dataset not found: {data_path}")
        
    data = pd.read_csv(data_path)
    infected = torch.tensor(
        data["confirmed"].values,
        dtype=torch.float32
    )

    model = NeuralODEModel()
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

    print("Starting training of Neural ODE model...")
    for epoch in range(200):
        optimizer.zero_grad()
        
        # Forward pass: integrate from x0 over time
        pred = model(x0, time)
        
        # We fit to the 'confirmed' column, which corresponds to pred[:, 1] (Infected compartment)
        loss = ((pred[:, 1] - infected) ** 2).mean()
        
        loss.backward()
        optimizer.step()
        
        if epoch % 20 == 0:
            print(f"Epoch {epoch:03d} | Loss: {loss.item():.6f}")

    print(f"Final training loss: {loss.item():.6f}")

    # Save model weights to root saved_models folder
    model_dir = "../../../saved_models"
    os.makedirs(model_dir, exist_ok=True)
    model_save_path = os.path.join(model_dir, "neuralode.pt")
    torch.save(model.state_dict(), model_save_path)
    print(f"Model saved to {model_save_path}")

    # Save predictions for comparison system
    results_dir = "../../../results"
    os.makedirs(results_dir, exist_ok=True)
    pred_np = pred.detach().cpu().numpy()
    np.save(os.path.join(results_dir, "neural_pred.npy"), pred_np[:, 1])
    print("Saved neural_pred.npy to results/")

    # Visualize predictions and save graph
    pred_np = pred.detach().cpu().numpy()
    infected_np = infected.numpy()

    plt.figure(figsize=(10, 6))
    plt.plot(infected_np, label="Real (Normalized Confirmed)")
    plt.plot(pred_np[:, 1], label="Neural ODE Fitted", linestyle="--")
    plt.xlabel("Days")
    plt.ylabel("Infected Population Fraction")
    plt.title("Neural ODE Model Fitting on COVID-19 Data (Italy First Wave)")
    plt.legend()
    
    fig_dir = "../../../results/figures"
    os.makedirs(fig_dir, exist_ok=True)
    fig_save_path = os.path.join(fig_dir, "neuralode_fit.png")
    plt.savefig(fig_save_path)
    print(f"Prediction graph saved to {fig_save_path}")

    # Commented out plt.show() to prevent blocking in non-interactive runs
    # plt.show()

if __name__ == "__main__":
    train()
