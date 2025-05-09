#!/bin/bash

# Start the backend in the background
NODE_ENV=development npx tsx server/index.ts &
BACKEND_PID=$!

# Function to clean up processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal trapping
trap cleanup SIGINT SIGTERM

# Wait for the server to start
echo "Starting backend server on port 5000..."
sleep 2

# Verify that the server is running
curl -s http://localhost:5000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend server is running!"
    echo "✅ Visit http://localhost:5000 to view the application"
    echo "Press Ctrl+C to stop all servers"
else
    echo "❌ Backend server failed to start."
    cleanup
    exit 1
fi

# Keep script running
while true; do
    sleep 1
done
