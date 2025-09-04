#!/bin/bash

# FinTech Dashboard Deployment Script

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running TypeScript type checking..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the project
echo "🏗️ Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🚀 Ready for deployment!"
    echo ""
    echo "To start the production server, run:"
    echo "  npm start"
    echo ""
    echo "To deploy to Vercel:"
    echo "  vercel --prod"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

