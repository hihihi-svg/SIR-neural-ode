import os
import numpy as np
from scipy.integrate import odeint
import matplotlib.pyplot as plt

def sir_equations(y, t, beta, gamma):
    S, I, R = y
    dSdt = -beta * S * I
    dIdt = beta * S * I - gamma * I
    dRdt = gamma * I
    return [dSdt, dIdt, dRdt]

def run_sir():
    beta = 0.3
    gamma = 0.1
    S0 = 0.99
    I0 = 0.01
    R0 = 0
    days = 160
    t = np.linspace(0, days, days)

    solution = odeint(
        sir_equations,
        [S0, I0, R0],
        t,
        args=(beta, gamma)
    )

    S = solution[:,0]
    I = solution[:,1]
    R = solution[:,2]

    plt.figure(figsize=(10,6))
    plt.plot(t, S, label="Susceptible")
    plt.plot(t, I, label="Infected")
    plt.plot(t, R, label="Recovered")
    plt.xlabel("Days")
    plt.ylabel("Population Fraction")
    plt.legend()
    plt.title("SIR Epidemic Simulation")
    
    # Ensure directory exists before saving
    fig_dir = "../../../results/figures"
    os.makedirs(fig_dir, exist_ok=True)
    save_path = os.path.join(fig_dir, "sir_curve.png")
    plt.savefig(save_path)
    print(f"Graph saved to {save_path}")
    
    # Commented out plt.show() to prevent blocking in non-interactive runs
    # plt.show()

if __name__ == "__main__":
    run_sir()
