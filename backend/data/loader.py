import pandas as pd

def load_dataset(path):
    df = pd.read_csv(path)
    print("Dataset Loaded")
    print(df.head())
    return df

if __name__ == "__main__":
    data = load_dataset(
        "../../datasets/raw/covid.csv"
    )
