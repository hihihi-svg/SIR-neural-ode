from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

def calculate_metrics(true, pred):
    """
    Computes RMSE, MAE, and R2 score between true targets and model predictions.
    """
    rmse = np.sqrt(mean_squared_error(true, pred))
    mae = mean_absolute_error(true, pred)
    r2 = r2_score(true, pred)
    return {
        "RMSE": float(rmse),
        "MAE": float(mae),
        "R2": float(r2)
    }
