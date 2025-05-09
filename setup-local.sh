#!/bin/bash

# Colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Guardian Shield for local development...${NC}"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm before continuing."
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Check for database environment variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Setting up database environment variables...${NC}"
    
    # Create a .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        touch .env
        
        # Add default database URL for local development
        echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/guardian_shield" >> .env
        echo "PGUSER=postgres" >> .env
        echo "PGPASSWORD=postgres" >> .env
        echo "PGDATABASE=guardian_shield" >> .env
        echo "PGHOST=localhost" >> .env
        echo "PGPORT=5432" >> .env
        
        echo -e "${YELLOW}A default .env file has been created with local PostgreSQL settings.${NC}"
        echo -e "${YELLOW}Please update these values if you have a different PostgreSQL setup.${NC}"
    fi
    
    # Load environment variables from .env file
    export $(grep -v '^#' .env | xargs)
fi

# Create or update start-dev.sh script
cat > start-dev.sh << 'EOF'
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
EOF

# Make the script executable
chmod +x start-dev.sh

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}To start the application, run: ./start-dev.sh${NC}"
echo -e "${GREEN}Then open http://localhost:5000 in your browser${NC}"