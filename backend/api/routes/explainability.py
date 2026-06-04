from fastapi import APIRouter
import os
import pandas as pd

router = APIRouter(
    prefix="/explain",
    tags=["Explainability"]
)

@router.get("/")
def explain():
    results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "results"))
    csv_path = os.path.join(results_dir, "explainability", "sensitivity.csv")
    
    sensitivity_data = []
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            # Clip length or return full records (160 rows is small, so orient="records" is fine)
            sensitivity_data = df.to_dict(orient="records")
        except Exception as e:
            print(f"[Explainability API] Error parsing sensitivity CSV: {e}")
            
    return {
        "confidence": "95% Empirical Bounds",
        "risk": "Transmission rate (beta) is highly sensitive to policy interventions.",
        "sensitivity_data": sensitivity_data,
        "plots": {
            "beta_plot": "/results/explainability/beta_plot.png",
            "confidence_plot": "/results/explainability/confidence_plot.png",
            "sensitivity_plot": "/results/explainability/sensitivity_plot.png",
            "feature_importance": "/results/explainability/feature_importance.png"
        }
    }

