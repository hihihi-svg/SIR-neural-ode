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
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
