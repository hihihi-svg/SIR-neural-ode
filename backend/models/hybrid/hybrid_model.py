import os
import sys
import torch
import torch.nn as nn

# Ensure the backend directory is in the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from models.neuralode.ode_func import ODEFunc

class HybridODE(nn.Module):
    def __init__(self, beta, gamma):
        super().__init__()
        self.beta = beta
        self.gamma = gamma
        self.neural = ODEFunc()

    def sir_part(self, state):
        """
        Computes the standard physical SIR compartmental derivatives.
        Handles both 1D (single state vector) and 2D (batch of vectors) tensors.
        """
        if len(state.shape) == 1:
            S, I, R = state[0], state[1], state[2]
            dS = -self.beta * S * I
            dI = self.beta * S * I - self.gamma * I
            dR = self.gamma * I
            return torch.stack([dS, dI, dR])
        else:
            S, I, R = state[:, 0], state[:, 1], state[:, 2]
            dS = -self.beta * S * I
            dI = self.beta * S * I - self.gamma * I
            dR = self.gamma * I
            return torch.stack([dS, dI, dR], dim=1)

    def forward(self, t, state):
        """
        Combines classical physics with neural correction.
        dy/dt = f_SIR(y, beta, gamma) + f_NN(y, t, theta)
        """
        sir = self.sir_part(state)
        correction = self.neural(t, state) * 0.01
        return sir + correction
