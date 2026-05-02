#!/bin/bash

echo "🎯 JobSwipe - Automated Setup Script"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend
npm install

echo ""
echo "🎭 Installing Playwright..."
npm install playwright
npx playwright install chromium

cd ..
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend
npm install

cd ..
echo ""

# Check for API key
if grep -q "your_openrouter_api_key_here" backend/.env; then
    echo "⚠️  WARNING: OpenRouter API key not configured!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Get FREE API key: https://openrouter.ai/keys"
    echo "   2. Edit backend/.env and add your key"
    echo "   3. Run: npm start (in backend folder)"
    echo "   4. Run: npm run dev (in frontend folder)"
else
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 To start the system:"
    echo ""
    echo "   Terminal 1 - Backend:"
    echo "   cd backend && npm start"
    echo ""
    echo "   Terminal 2 - Frontend:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "   Then open: http://localhost:3000"
fi

echo ""
echo "📚 Read README.md for full documentation"
echo ""
