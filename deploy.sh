#!/bin/bash

# PlagiaSense Deployment Script

echo "🚀 Preparing PlagiaSense for deployment..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for PlagiaSense deployment"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Check for required files
echo "📋 Checking deployment files..."
required_files=("vercel.json" "package.json" ".env.example" "DEPLOYMENT.md")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "🎯 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Vercel deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to https://vercel.com and import your GitHub repository"
echo ""
echo "3. Set environment variables in Vercel dashboard:"
echo "   VITE_API_URL = https://your-backend-service.vercel.app"
echo ""
echo "4. For backend deployment, see DEPLOYMENT.md"
echo ""
echo "📖 For detailed instructions, read DEPLOYMENT.md"