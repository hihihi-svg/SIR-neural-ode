from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.prediction import router as prediction_router
from routes.simulation import router as simulation_router
from routes.comparison import router as comparison_router
from routes.explainability import router as explain_router

app = FastAPI(
    title="Epidemic SciML API",
    description="Backend endpoints for simulating, fitting, and explaining epidemic spread models",
    version="0.1.0"
)

results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "results"))
app.mount("/results", StaticFiles(directory=results_dir), name="results")


# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction_router)
app.include_router(simulation_router)
app.include_router(comparison_router)
app.include_router(explain_router)

@app.get("/")
def home():
    return {
        "message": "API Running"
    }
