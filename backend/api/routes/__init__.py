from fastapi import APIRouter
from routes.prediction import router as prediction_router
from routes.simulation import router as simulation_router
from routes.comparison import router as comparison_router
from routes.explainability import router as explain_router

router = APIRouter()
router.include_router(prediction_router)
router.include_router(simulation_router)
router.include_router(comparison_router)
router.include_router(explain_router)
