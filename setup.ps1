# Dance Motion Capture Pipeline - Setup Script
# This script will help you set up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Dance Motion Capture - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

try {
    pip install -r requirements.txt
    Write-Host "✓ Python dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Try running: pip install --upgrade pip" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Run setup test
Write-Host "Running setup test..." -ForegroundColor Yellow
python test_setup.py

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: python -m http.server 8000" -ForegroundColor White
Write-Host "2. Open: http://localhost:8000" -ForegroundColor White
Write-Host "3. Load: output/sample_motion.json" -ForegroundColor White
Write-Host ""
Write-Host "Or extract from your video:" -ForegroundColor Yellow
Write-Host "python extract_pose.py -i your_video.mp4 -o output/motion.json" -ForegroundColor White
Write-Host ""

# Ask if user wants to start server
$response = Read-Host "Start web server now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Starting web server on http://localhost:8000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    python -m http.server 8000
}
