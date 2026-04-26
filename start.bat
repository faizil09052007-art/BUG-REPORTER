@echo off
echo ========================================================
echo Starting Advanced Full-Stack Defect Management Ecosystem
echo ========================================================
echo.

echo [1/2] Installing dependencies and starting the Backend...
cd backend
start cmd /k "npm install && npm run dev"

cd ..

echo [2/2] Installing dependencies and starting the Frontend...
cd frontend
start cmd /k "npm install && npm run dev"

echo.
echo Both servers are starting in separate windows!
echo Once they are ready, open your browser to: http://localhost:5173/login
echo.
pause
