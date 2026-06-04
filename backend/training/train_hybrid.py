import os
import torch
import torch.optim as optim
import torch.nn as nn
import numpy as np
from typing import Tuple, Dict, Any

from backend.api.loader import DataLoader
from backend.models.hybrid import HybridSIRModel
from backend.training.metrics import calculate_metrics

def train_hybrid_model(
    data: np.ndarray,
    N: float = 1000.0,
    epochs: int = 200,
    lr: float = 0.01,
    save_path: str = "saved_models/hybrid_sir.pt"
) -> Tuple[HybridSIRModel, Dict[str, Any]]:
    """
    Main training routine for the Hybrid SIR model.
    data: Observed trajectories, shape (T, 3) where columns represent S, I, R.
    """
    # Convert numpy data to torch tensors
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    observed_tensor = torch.tensor(data, dtype=torch.float32).to(device)
    
    T = observed_tensor.shape[0]
    t = torch.arange(0, T, dtype=torch.float32).to(device)
    y0 = observed_tensor[0]  # Initial state [S0, I0, R0]
    
    # Initialize the hybrid model
    model = HybridSIRModel(hidden_dim=32, N=N, adjoint=False).to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.MSELoss()
    
    # Simple training loop
    history = []
    for epoch in range(1, epochs + 1):
        model.train()
        optimizer.zero_grad()
        
        # Integrate forward over time steps t
        predictions = model(y0, t)  # Shape: (T, 3)
        
        # Calculate loss (MSE trajectory difference)
        loss = loss_fn(predictions, observed_tensor)
        
        # Backpropagate and optimize
        loss.backward()
        optimizer.step()
        
        history.append(loss.item())
        
        if epoch % 50 == 0 or epoch == 1:
            print(f"Epoch {epoch}/{epochs} | Loss: {loss.item():.6f}")
            
    # Evaluate final model predictions
    model.eval()
    with torch.no_grad():
        final_preds = model(y0, t).cpu().numpy()
        
    metrics = calculate_metrics(data, final_preds)
    metrics["loss_history"] = history
    
    # Save the trained model parameters
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save(model.state_dict(), save_path)
    print(f"Model saved successfully to {save_path}")
    
    return model, metrics


if __name__ == "__main__":
    # Smoke test: Train on synthetic data
    print("Running training smoke test with synthetic data...")
    loader = DataLoader()
    synthetic_df = loader.generate_synthetic_sir(days=50, beta=0.3, gamma=0.1, N=1000)
    data_np = synthetic_df[["Susceptible", "Infected", "Recovered"]].values
    
    model, stats = train_hybrid_model(data_np, N=1000.0, epochs=100, lr=0.01)
    print("Training metrics:", {k: v for k, v in stats.items() if k != "loss_history"})
