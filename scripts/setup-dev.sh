#!/bin/bash

# 🚀 FasoCare Quick Start Guide
# This script helps you get FasoCare development environment running

set -e

echo "
███████╗ █████╗ ███████╗ ██████╗  ██████╗ █████╗ ██████╗ ███████╗
██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝
█████╗  ███████║███████╗██║   ██║██║     ███████║██████╔╝█████╗  
██╔══╝  ██╔══██║╚════██║██║   ██║██║     ██╔══██║██╔══██╗██╔══╝  
██║     ██║  ██║███████║╚██████╔╝╚██████╗██║  ██║██║  ██║███████╗
╚═╝     ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
                                                                    
🇧🇫 Plateforme Nationale de Santé Numérique - Dev Setup
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Checks
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        echo "Install from: https://nodejs.org/ (v18+)"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker not found (optional for postgres)${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Docker $(docker --version)${NC}"
}

check_git() {
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Git $(git --version | cut -d' ' -f3)${NC}"
}

# Main setup
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
check_node
check_git
check_docker || true

echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Root dependencies
echo "📍 Installing root dependencies..."
npm install

# Backend dependencies
echo "📍 Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies (if needed)
if [ -f "package.json" ]; then
    echo "📍 Dependencies ready!"
fi

echo ""
echo -e "${BLUE}🗂️  Setting up environment files...${NC}"

# Copy .env files if they don't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    cat > .env.local << 'EOF'
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF
    echo -e "${YELLOW}⚠️  Please update .env.local with your credentials${NC}"
fi

if [ ! -f "backend/.env.local" ]; then
    echo "Creating backend/.env.local..."
    cp backend/.env.example backend/.env.local 2>/dev/null || cat > backend/.env.local << 'EOF'
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fasocare
DB_PASSWORD=fasocare_password
DB_DATABASE=fasocare_db
JWT_SECRET=dev_secret_key_must_be_32_chars_minimum_xxx
JWT_REFRESH_SECRET=dev_refresh_secret_key_must_be_32_chars_minimum
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
    echo -e "${YELLOW}⚠️  Update backend/.env.local with your database credentials${NC}"
fi

echo ""
echo ""
echo -e "${BLUE}🐳 Starting services...${NC}"

if command -v docker-compose &> /dev/null; then
    docker-compose up -d || echo -e "${YELLOW}⚠️  docker-compose failed${NC}"
elif docker compose version &> /dev/null; then
    docker compose up -d || echo -e "${YELLOW}⚠️  docker compose failed${NC}"
else
    echo -e "${YELLOW}⚠️  Neither 'docker compose' nor 'docker-compose' were found.${NC}"
    echo -e "Starting services manually with 'docker run'..."
    docker run -d --name postgres -p 5432:5432 -e POSTGRES_USER=fasocare -e POSTGRES_PASSWORD=fasocare_password -e POSTGRES_DB=fasocare_db postgres:15-alpine 2>/dev/null || echo "Postgres already running or failed."
    docker run -d --name redis -p 6379:6379 redis:7-alpine 2>/dev/null || echo "Redis already running or failed."
fi

echo ""
echo -e "${BLUE}🏗️  Building application...${NC}"

# Build backend
echo "📍 Building backend..."
cd backend
npm run build || echo -e "${YELLOW}⚠️  Backend build had issues${NC}"
cd ..

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""
echo "Option 1: Run all services concurrently (recommended)"
echo -e "  ${GREEN}npm run dev:all${NC}"
echo ""
echo "Option 2: Run services separately"
echo -e "  Frontend:   ${GREEN}npm run dev${NC}            (http://localhost:3000)"
echo -e "  Backend:    ${GREEN}npm run dev:backend${NC}    (http://localhost:3001)"
echo -e "  Mobile:     ${GREEN}npm run dev:mobile${NC}     (React Native)"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "  Swagger API Docs:  ${GREEN}http://localhost:3001/api/docs${NC}"
echo -e "  Improvements:      ${GREEN}docs/IMPROVEMENTS.md${NC}"
echo -e "  Security Guide:    ${GREEN}docs/SECURITY.md${NC}"
echo -e "  Commit Guide:      ${GREEN}docs/COMMIT_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Update environment variables in .env.local files"
echo "  2. Run: npm run dev:all"
echo "  3. Visit: http://localhost:3000"
echo ""
echo "💡 For help, check the documentation or ask the team!"
