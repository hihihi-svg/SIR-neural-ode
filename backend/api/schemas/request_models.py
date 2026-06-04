from pydantic import BaseModel

class PredictionInput(BaseModel):
    population: int
    infected: int
    vaccination: float
    mobility: float
    days: int

class SimulationInput(BaseModel):
    mobility: float
    vaccination: float
    lockdown_intensity: float
    lockdown_day: int

