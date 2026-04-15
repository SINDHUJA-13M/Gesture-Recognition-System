@echo off
title GestureAI Launcher
color 0A
echo.
echo  =========================================
echo    GestureAI - Hand Gesture Recognition
echo  =========================================
echo.
echo  [1/2] Starting Flask backend (port 5000)...
start "GestureAI Backend" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\activate && python app.py"
timeout /t 3 /nobreak >nul
echo  [2/2] Starting React frontend (port 3000)...
start "GestureAI Frontend" cmd /k "cd /d %~dp0frontend && npm start"
echo.
echo  Backend:   http://localhost:5000/health
echo  Frontend:  http://localhost:3000
echo.
echo  Close both terminal windows to stop the app.
echo.
pause
