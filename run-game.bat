@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Vexilla needs Node.js before it can run.
  echo.
  echo Please install the LTS version from:
  echo https://nodejs.org
  echo.
  echo After Node.js is installed, double-click run-game.bat again.
  echo.
  pause
  exit /b 1
)

echo.
echo Starting Vexilla...
echo.
echo When the server is ready, open this address in your browser:
echo http://localhost:8000/
echo.
echo Leave this window open while you play.
echo Press Ctrl+C in this window when you want to stop Vexilla.
echo.

node server.js

echo.
pause
