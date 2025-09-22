#!/bin/bash

# PlagiaSense Full Stack Startup Script

echo "🚀 Starting PlagiaSense Full Stack Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to start backend
start_backend() {
    echo "📚 Starting Python backend..."
    cd backend
    
    # Activate virtual environment and start FastAPI
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        ../.venv/Scripts/python.exe -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload &
    else
        # Linux/Mac
        source ../.venv/bin/activate
        python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload &
    fi
    
    BACKEND_PID=$!
    echo "✅ Backend started with PID $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting React frontend..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started with PID $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check requirements
if ! command_exists python && ! command_exists python3; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js/npm is not installed or not in PATH"
    exit 1
fi

# Start services
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo "🎉 PlagiaSense is now running!"
echo "📝 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait