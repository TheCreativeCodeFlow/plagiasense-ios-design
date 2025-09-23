#!/bin/bash

# 🚨 RENDER DEPLOYMENT - MINIMAL VERSION

echo "🚀 Deploying minimal PlagiaSense backend..."

# Backup full requirements
if [ -f "requirements.txt" ]; then
    echo "📋 Backing up full requirements..."
    cp requirements.txt requirements-full.txt
fi

# Use minimal requirements
echo "📦 Using minimal requirements for deployment..."
cp requirements-minimal.txt requirements.txt

echo "✅ Ready for minimal deployment!"
echo ""
echo "📋 Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Deploy minimal version for Render'"
echo "3. git push origin main"
echo "4. Deploy on Render with manual setup"
echo ""
echo "🔧 Render Build Command:"
echo "python -m pip install --upgrade pip==23.2.1 && pip install -r requirements.txt"
echo ""
echo "🚀 Render Start Command:"
echo "uvicorn backend.api:app --host 0.0.0.0 --port \$PORT"