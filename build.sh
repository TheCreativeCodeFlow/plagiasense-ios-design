#!/bin/bash
# Render build script for PlagiaSense

echo "🔧 Starting build process..."

# Ensure we're in the right directory
echo "📂 Current directory: $(pwd)"
echo "📋 Files in current directory:"
ls -la

# Check if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "✅ Found requirements.txt"
    cat requirements.txt
else
    echo "❌ requirements.txt not found"
    exit 1
fi

# Upgrade pip and install build tools first
echo "🔧 Upgrading pip and installing build tools..."
python -m pip install --upgrade pip
pip install setuptools wheel

# Install requirements
echo "📦 Installing Python packages..."
pip install -r requirements.txt

echo "✅ Build completed successfully!"