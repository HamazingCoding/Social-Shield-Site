@echo off
echo Starting Guardian Shield application...
echo.

:: Set environment variables
set NODE_ENV=development

:: Start the server with both frontend and backend
echo Starting backend server on port 5000...
start /B npx tsx server/index.ts

echo.
echo Guardian Shield is now running!
echo.
echo Open http://localhost:5000 in your browser to view the application
echo Press Ctrl+C to stop the server
echo.

:: Keep the window open
pause