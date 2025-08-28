#!/bin/bash

# FTC Parts Exchange - goBilda Auto-Update Setup Script
# This script sets up the automated goBilda parts update system

echo "🚀 Setting up goBilda Parts Auto-Update System..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install frontend dependencies (if not already installed)
echo "📦 Installing frontend dependencies..."
npm install

# Create backend directory if it doesn't exist
if [ ! -d "backend" ]; then
    mkdir backend
    echo "📁 Created backend directory"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found. Please ensure all files were created properly."
    cd ..
    exit 1
fi

npm install

echo "✅ Dependencies installed successfully!"

# Start the backend scraper service
echo ""
echo "🔄 Starting goBilda scraper service..."
echo "This will run in the background and provide APIs for the frontend."
echo ""

# Start the scraper service in the background
nohup npm start > scraper.log 2>&1 &
SCRAPER_PID=$!

echo "✅ Scraper service started with PID: $SCRAPER_PID"
echo "📋 Logs are being written to: backend/scraper.log"

# Wait a moment for the service to start
sleep 5

# Test the service
echo ""
echo "🧪 Testing scraper service..."
cd ..

# Check if the service is responding
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Scraper service is running and responding!"
    echo "🌐 Available endpoints:"
    echo "   - Health check: http://localhost:3001/health"
    echo "   - Scrape all parts: http://localhost:3001/api/scrape-all"
    echo "   - Get parts data: http://localhost:3001/api/parts"
else
    echo "⚠️  Scraper service may still be starting up..."
    echo "   Check backend/scraper.log for details"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Start your React development server:"
echo "   npm run dev"
echo ""
echo "2. Navigate to the Admin page in your app to:"
echo "   - Trigger manual updates"
echo "   - Configure automatic update schedule"
echo "   - Monitor update status"
echo ""
echo "3. The system will automatically:"
echo "   - Check for updates every 24 hours"
echo "   - Update parts database in the background"
echo "   - Provide notifications about updates"
echo ""
echo "📖 For detailed setup and configuration, see:"
echo "   GOBILDA_UPDATE_SETUP.md"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check backend logs: tail -f backend/scraper.log"
echo "   - Restart scraper: pkill -f scraper.js && cd backend && npm start"
echo "   - Test endpoints: curl http://localhost:3001/health"
echo ""
echo "✨ goBilda Auto-Update System is now ready!"

# Save the PID for later reference
echo $SCRAPER_PID > backend/scraper.pid
echo "💾 Scraper PID saved to backend/scraper.pid"
