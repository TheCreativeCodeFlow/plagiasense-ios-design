"""
Minimal FastAPI server for local development
"""
import asyncio
import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def check_and_install_dependencies():
    """Check and install required dependencies"""
    required_packages = [
        "fastapi",
        "uvicorn",
        "python-multipart"
    ]
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package} is available")
        except ImportError:
            print(f"📦 Installing {package}...")
            if install_package(package):
                print(f"✅ {package} installed successfully")
            else:
                print(f"❌ Failed to install {package}")

if __name__ == "__main__":
    print("🚀 Setting up PlagiaSense backend...")
    check_and_install_dependencies()
    
    try:
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        import uvicorn
        
        app = FastAPI(title="PlagiaSense API - Local Dev", version="1.0.0")
        
        # CORS configuration
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:8080", "http://localhost:8081", "http://localhost:5173"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        @app.get("/")
        async def health_check():
            return {
                "status": "healthy", 
                "message": "PlagiaSense API - Local Development",
                "model_loaded": False,
                "pdf_support": False,
                "ml_support": False,
                "nltk_support": False
            }
        
        @app.get("/api/status")
        async def get_status():
            return {
                "status": "running",
                "mode": "local_development",
                "ml_features": "disabled",
                "message": "Basic API functionality available"
            }
        
        @app.get("/api/models")
        async def get_models():
            return {"models": {"basic": "Local Development Mode"}}
        
        @app.get("/api/ai-detection/methods")
        async def get_ai_detection_methods():
            return {
                "methods": {
                    "statistical": {
                        "name": "Statistical Analysis",
                        "description": "Basic statistical AI detection",
                        "available": True,
                        "requires_internet": False,
                        "requires_api_key": False
                    }
                }
            }
        
        @app.get("/api/ai-detection/models")
        async def get_ai_detection_models():
            return {
                "models": {"statistical": "Statistical AI Detector"},
                "performance_info": {
                    "statistical": {
                        "accuracy": 0.75, 
                        "speed": "Fast", 
                        "memory": "Low", 
                        "description": "Statistical analysis"
                    }
                }
            }
        
        print("🌐 Starting FastAPI server...")
        print("📍 Backend will be available at: http://localhost:8002")
        print("📍 Frontend is running at: http://localhost:8081")
        print("📖 API docs will be at: http://localhost:8002/docs")
        
        uvicorn.run(app, host="127.0.0.1", port=8002, reload=False)
        
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("💡 Please install FastAPI manually:")
        print("   pip install fastapi uvicorn python-multipart")
    except Exception as e:
        print(f"❌ Error starting server: {e}")