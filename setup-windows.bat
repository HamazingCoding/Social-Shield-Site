@echo off
echo Setting up Guardian Shield for Windows...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js before continuing.
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm before continuing.
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file with default PostgreSQL settings...
    echo DATABASE_URL=postgres://postgres:postgres@localhost:5432/guardian_shield > .env
    echo PGUSER=postgres >> .env
    echo PGPASSWORD=postgres >> .env
    echo PGDATABASE=guardian_shield >> .env
    echo PGHOST=localhost >> .env
    echo PGPORT=5432 >> .env
    
    echo A default .env file has been created with local PostgreSQL settings.
    echo Please update these values if you have a different PostgreSQL setup.
)

echo.
echo Setup complete!
echo To start the application, run: start-windows.bat
echo.

pause