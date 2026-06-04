import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def preprocess(df):
    df = df.copy()
    df = df.dropna()
    df["date"] = pd.to_datetime(
        df["date"]
    )
    df = df.sort_values(
        "date"
    )
    scaler = MinMaxScaler()
    df["confirmed"] = scaler.fit_transform(
        df[["confirmed"]]
    )
    return df

if __name__ == "__main__":
    data = pd.read_csv(
        "../../datasets/raw/covid.csv"
    )
    processed = preprocess(data)
    import os
    os.makedirs("../../datasets/processed", exist_ok=True)
    processed.to_csv(
        "../../datasets/processed/processed.csv",
        index=False
    )
    print(processed.head())
