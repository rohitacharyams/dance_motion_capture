@echo off
REM Dance Motion Capture - Server Startup Script
echo ========================================
echo Dance Motion Capture - Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python is installed
echo.

REM Check if dependencies are installed
echo Checking dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ========================================
echo Starting Flask Server
echo ========================================
echo.
echo Server will start on http://localhost:5000
echo.
echo INSTRUCTIONS:
echo 1. Open your browser to http://localhost:5000
echo 2. Upload your dance video
echo 3. Wait for automatic processing
echo 4. Animation will play automatically!
echo.
echo Press Ctrl+C to stop the server
echo.

python server.py
