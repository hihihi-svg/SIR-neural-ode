import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict

class DataLoader:
    def __init__(self, raw_dir: str = "datasets/raw", processed_dir: str = "datasets/processed"):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir

    def load_raw_data(self, filename: str) -> pd.DataFrame:
        """
        Loads a CSV file from the raw datasets directory.
        """
        filepath = os.path.join(self.raw_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Raw data file not found: {filepath}")
        return pd.read_csv(filepath)

    def preprocess(self, df: pd.DataFrame, target_cols: list) -> pd.DataFrame:
        """
        Interpolates missing values and cleans the dataset.
        """
        df_clean = df.copy()
        # Simple interpolation for missing values in time-series
        df_clean[target_cols] = df_clean[target_cols].interpolate(method="linear")
        df_clean[target_cols] = df_clean[target_cols].bfill().ffill()
        return df_clean

    def normalize_data(self, data: np.ndarray) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Normalizes dataset to [0, 1] range. Returns normalized data and scale factors.
        """
        min_val = np.min(data, axis=0)
        max_val = np.max(data, axis=0)
        # Avoid division by zero
        range_val = np.where(max_val - min_val == 0, 1.0, max_val - min_val)
        normalized = (data - min_val) / range_val
        
        scales = {
            "min_val": min_val.tolist(),
            "max_val": max_val.tolist(),
            "range_val": range_val.tolist()
        }
        return normalized, scales

    def split_data(self, data: np.ndarray, split_ratio: float = 0.8) -> Tuple[np.ndarray, np.ndarray]:
        """
        Splits sequential time-series data into training and test sets.
        """
        split_idx = int(len(data) * split_ratio)
        train_data = data[:split_idx]
        test_data = data[split_idx:]
        return train_data, test_data

    def generate_synthetic_sir(self, days: int = 100, beta: float = 0.3, gamma: float = 0.1, N: int = 1000) -> pd.DataFrame:
        """
        Generates synthetic SIR data using classical Euler forward integration.
        Useful for testing before actual datasets are configured.
        """
        S = np.zeros(days)
        I = np.zeros(days)
        R = np.zeros(days)
        
        # Initial conditions
        I[0] = 10.0
        S[0] = N - I[0]
        R[0] = 0.0
        
        for t in range(1, days):
            dS = -(beta * S[t-1] * I[t-1]) / N
            dI = (beta * S[t-1] * I[t-1]) / N - gamma * I[t-1]
            dR = gamma * I[t-1]
            
            S[t] = S[t-1] + dS
            I[t] = I[t-1] + dI
            R[t] = R[t-1] + dR
            
        df = pd.DataFrame({
            "day": np.arange(days),
            "Susceptible": S,
            "Infected": I,
            "Recovered": R
        })
        return df
