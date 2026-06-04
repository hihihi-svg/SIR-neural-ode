import torch
import torch.nn as nn

class ODEFunc(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(3, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 3)
        )

    def forward(self, t, x):
        """
        Computes the derivative at state x and time t.
        Input dimension: 3 (Susceptible, Infected, Recovered)
        """
        return self.net(x)
