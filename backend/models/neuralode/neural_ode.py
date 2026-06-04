import torch.nn as nn
from torchdiffeq import odeint
from ode_func import ODEFunc

class NeuralODEModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.func = ODEFunc()

    def forward(self, x0, t):
        """
        Integrates the network starting from initial condition x0 over time points t.
        Uses rk4 (Runge-Kutta 4) solver for fixed-step, stable daily integration.
        """
        out = odeint(
            self.func,
            x0,
            t,
            method="euler"
        )
        return out
