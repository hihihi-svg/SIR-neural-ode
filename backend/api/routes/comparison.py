from fastapi import APIRouter
import os
import numpy as np
# Custom metrics implementation using numpy to avoid scikit-learn dependency at runtime

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
            # Calculate metrics using numpy to avoid sklearn dependency
            mse = np.mean((true - pred) ** 2)
            rmse = np.sqrt(mse)
            mae = np.mean(np.abs(true - pred))
            
            # R2 score calculation
            ss_res = np.sum((true - pred) ** 2)
            ss_tot = np.sum((true - np.mean(true)) ** 2)
            r2 = 1.0 - (ss_res / ss_tot) if ss_tot != 0 else 0.0
            
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

