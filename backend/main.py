import sys
import os

# Add backend and backend/api to sys.path to allow imports from local modules on Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)
api_dir = os.path.join(current_dir, "api")
if api_dir not in sys.path:
    sys.path.append(api_dir)

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router

app = FastAPI(
    title="Epidemic SciML API",
    description="Backend API for SIR and Neural ODE Epidemic Modeling",
    version="0.1.0"
)

# Configure CORS for local development (React UI defaults to port 5173 or 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "results"))
app.mount("/results", StaticFiles(directory=results_dir), name="results")

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Epidemic SciML API is running.",
        "endpoints": ["/api/simulate", "/api/train", "/api/metrics"]
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8001, reload=True)
