from fastapi import APIRouter
import os
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

router = APIRouter(
    prefix="/compare",
    tags=["Comparison"]
)

@router.get("/")
def compare():
    results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "results"))
    
    real_path = os.path.join(results_dir, "real.npy")
    sir_path = os.path.join(results_dir, "sir_pred.npy")
    neural_path = os.path.join(results_dir, "neural_pred.npy")
    hybrid_path = os.path.join(results_dir, "hybrid_pred.npy")
    
    if not all(os.path.exists(p) for p in [real_path, sir_path, neural_path, hybrid_path]):
        return {
            "error": "One or more prediction files (.npy) are missing from results directory. Run training scripts first.",
            "metrics": {},
            "trajectories": []
        }
        
    try:
        real = np.load(real_path)
        sir = np.load(sir_path)
        neural = np.load(neural_path)
        hybrid = np.load(hybrid_path)
        
        # Determine the minimum length to avoid out-of-bounds indexing
        length = min(len(real), len(sir), len(neural), len(hybrid))
        real = real[:length]
        sir = sir[:length]
        neural = neural[:length]
        hybrid = hybrid[:length]
        
        def calculate_metrics(true, pred):
            rmse = np.sqrt(mean_squared_error(true, pred))
            mae = mean_absolute_error(true, pred)
            r2 = r2_score(true, pred)
            return {
                "RMSE": float(rmse),
                "MAE": float(mae),
                "R2": float(r2)
            }
            
        metrics = {
            "sir": calculate_metrics(real, sir),
            "neural": calculate_metrics(real, neural),
            "hybrid": calculate_metrics(real, hybrid)
        }
        
        trajectories = []
        for i in range(length):
            trajectories.append({
                "day": i + 1,
                "real": float(real[i]),
                "sir": float(sir[i]),
                "neural": float(neural[i]),
                "hybrid": float(hybrid[i])
            })
            
        return {
            "best_model": "Hybrid SIR + Neural ODE",
            "metrics": metrics,
            "trajectories": trajectories
        }
    except Exception as e:
        return {
            "error": f"Error running comparison: {str(e)}",
            "metrics": {},
            "trajectories": []
        }

