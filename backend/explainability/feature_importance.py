import os
import matplotlib.pyplot as plt

def run_importance():
    results_dir = "../../results"
    
    # Static relative weights (to be dynamic once SHAP features are integrated)
    importance = {
        "Mobility Factor": 0.45,
        "Vaccination Rate %": 0.30,
        "Population Density": 0.25
    }
    
    features = list(importance.keys())
    values = list(importance.values())
    
    plt.figure(figsize=(10, 5))
    # Render horizontal bar chart with custom colors
    bars = plt.barh(features, values, color=["#1f77b4", "#ff7f0e", "#2ca02c"], height=0.4)
    
    # Label each bar with its percentage contribution
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 0.01, bar.get_y() + bar.get_height()/2, f"{width*100:.1f}%", 
                 va='center', ha='left', fontweight='bold')
                 
    plt.xlim(0, 0.6)
    plt.xlabel("Relative Importance Weight")
    plt.title("Feature Importance Analysis (Outbreak Predictors)")
    plt.grid(True, axis='x', linestyle=":", alpha=0.6)
    
    exp_dir = os.path.join(results_dir, "explainability")
    os.makedirs(exp_dir, exist_ok=True)
    save_path = os.path.join(exp_dir, "feature_importance.png")
    plt.savefig(save_path)
    print(f"Feature importance plot saved to {save_path}")

if __name__ == "__main__":
    run_importance()
