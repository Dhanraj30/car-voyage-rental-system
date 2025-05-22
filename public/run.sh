
#!/bin/bash

# Car Rental System Execution Script
echo "🚗 Starting Car Rental System..."

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Check if the backend directory exists
if [ ! -d "backend" ]; then
    echo "Error: Backend directory not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Start backend in the background
echo "Starting FastAPI backend..."
cd backend
uvicorn main:app --reload --host ${API_HOST:-0.0.0.0} --port ${API_PORT:-8000} &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend
echo "Starting React frontend..."
npm run dev -- --port ${FRONTEND_PORT:-8080} &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Register the cleanup function for termination signals
trap cleanup SIGINT SIGTERM

echo "✅ Car Rental System is running!"
echo "Backend: http://localhost:${API_PORT:-8000}"
echo "Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "API Documentation: http://localhost:${API_PORT:-8000}/docs"
echo "Press Ctrl+C to stop all services"

# Keep the script running
wait
