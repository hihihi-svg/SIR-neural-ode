import pandas as pd
import os

def download_and_format_data():
    url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
    print(f"Downloading dataset from {url}...")
    df = pd.read_csv(url)
    
    # Filter for Italy to get a classic, clean first-wave curve
    df_italy = df[df["Country/Region"] == "Italy"]
    
    # Drop non-date columns
    cols_to_drop = ["Province/State", "Country/Region", "Lat", "Long"]
    df_italy = df_italy.drop(columns=cols_to_drop)
    
    # Sum across rows (should be 1 row anyway, but safe)
    daily_cases = df_italy.sum(axis=0)
    
    # Convert to DataFrame
    df_out = pd.DataFrame({
        "date": daily_cases.index,
        "confirmed": daily_cases.values
    })
    
    # Convert date to standard YYYY-MM-DD
    df_out["date"] = pd.to_datetime(df_out["date"], format="%m/%d/%y").dt.strftime("%Y-%m-%d")
    
    # Filter to first wave (e.g., from Jan 22, 2020 to June 30, 2020)
    df_out["date"] = pd.to_datetime(df_out["date"])
    df_out = df_out[(df_out["date"] >= "2020-01-22") & (df_out["date"] <= "2020-06-30")]
    df_out["date"] = df_out["date"].dt.strftime("%Y-%m-%d")
    
    # Create target directory
    os.makedirs("datasets/raw", exist_ok=True)
    
    # Save to CSV
    output_path = "datasets/raw/covid.csv"
    df_out.to_csv(output_path, index=False)
    print(f"Dataset saved to {output_path}")
    print(df_out.head())

if __name__ == "__main__":
    download_and_format_data()
