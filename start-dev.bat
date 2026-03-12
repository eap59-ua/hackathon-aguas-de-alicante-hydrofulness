@echo off
REM Hydrofulness — Arranque sin Docker
echo === Hydrofulness Dev Mode ===

echo [1/3] Iniciando backend...
cd backend
if not exist .venv (
    python -m venv .venv
    .venv\Scripts\pip install -r requirements.txt
)
start "Backend" cmd /k ".venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
cd ..

echo [2/3] Iniciando frontend...
cd frontend
if not exist node_modules (
    npm install
)
start "Frontend" cmd /k "npm run dev"
cd ..

echo [3/3] Listo! abrir http://localhost:5173
echo    Backend:  http://localhost:8000/docs
echo    Frontend: http://localhost:5173
