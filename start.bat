@echo off
echo 🚀 Starting PlagiaSense Full Stack Application...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js/npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js/npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Start backend
echo 📚 Starting Python backend...
cd backend
start "PlagiaSense Backend" cmd /k "..\.venv\Scripts\python.exe -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Start frontend
echo 🎨 Starting React frontend...
start "PlagiaSense Frontend" cmd /k "npm run dev"

echo.
echo 🎉 PlagiaSense is now running!
echo 📝 Frontend: http://localhost:8080
echo 🔧 Backend API: http://localhost:8000
echo 📖 API Documentation: http://localhost:8000/docs
echo.
echo Both services are running in separate terminal windows.
echo Close those windows to stop the services.
echo.
pause