import os
import sys
import numpy as np
import matplotlib.pyplot as plt

# Ensure the backend directory is in the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from evaluation.metrics import calculate_metrics

def compare():
    results_dir = "../../results"
    
    # Load saved predictions
    real_path = os.path.join(results_dir, "real.npy")
    sir_path = os.path.join(results_dir, "sir_pred.npy")
    neural_path = os.path.join(results_dir, "neural_pred.npy")
    hybrid_path = os.path.join(results_dir, "hybrid_pred.npy")
    
    if not all(os.path.exists(p) for p in [real_path, sir_path, neural_path, hybrid_path]):
        raise FileNotFoundError("One or more prediction files (.npy) are missing from results directory.")
        
    real = np.load(real_path)
    sir = np.load(sir_path)
    neural = np.load(neural_path)
    hybrid = np.load(hybrid_path)
    
    models = {
        "Classical SIR": sir,
        "Pure Neural ODE": neural,
        "Hybrid SIR + Neural ODE": hybrid
    }
    
    print("\n" + "="*50)
    print(f"{'Model Evaluation Results':^50}")
    print("="*50)
    print(f"{'Model':<25} | {'RMSE':<8} | {'MAE':<8} | {'R2 Score':<8}")
    print("-"*50)
    
    results = {}
    for name, pred in models.items():
        metrics = calculate_metrics(real, pred)
        results[name] = metrics
        print(f"{name:<25} | {metrics['RMSE']:.6f} | {metrics['MAE']:.6f} | {metrics['R2']:.6f}")
    print("="*50 + "\n")
    
    # Plot comparison curves
    plt.figure(figsize=(12, 7))
    plt.plot(real, label="Real COVID-19 (Italy Wave 1)", color="black", linewidth=2.5)
    plt.plot(sir, label=f"Classical SIR (R2: {results['Classical SIR']['R2']:.3f})", color="tab:red", linestyle=":", linewidth=2)
    plt.plot(neural, label=f"Pure Neural ODE (R2: {results['Pure Neural ODE']['R2']:.3f})", color="tab:orange", linestyle="-.", linewidth=2)
    plt.plot(hybrid, label=f"Hybrid Model (R2: {results['Hybrid SIR + Neural ODE']['R2']:.3f})", color="tab:green", linestyle="--", linewidth=2.5)
    
    plt.xlabel("Days")
    plt.ylabel("Infected Population Fraction (Normalized)")
    plt.title("Model Trajectory Comparison on COVID-19 Epidemic Data")
    plt.legend()
    plt.grid(True, linestyle=":", alpha=0.6)
    
    # Save the figure
    fig_dir = os.path.join(results_dir, "figures")
    os.makedirs(fig_dir, exist_ok=True)
    save_path = os.path.join(fig_dir, "model_comparison.png")
    plt.savefig(save_path)
    print(f"Joint comparison graph saved to {save_path}")

    # Commented out plt.show() to prevent blocking in non-interactive runs
    # plt.show()

if __name__ == "__main__":
    compare()
