@echo off
echo Starting Epidemic SciML application...

echo Launching Backend Server on port 8001...
start "Epidemic SciML Backend" cmd /k "set PYTHONPATH=backend;backend/api && python -m backend.main"

echo Launching Frontend Server...
start "Epidemic SciML Frontend" cmd /k "cd frontend && npm run dev"

echo Application launched! The backend is running on http://localhost:8001 and the frontend is on http://localhost:5173/
pause
