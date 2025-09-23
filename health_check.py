#!/usr/bin/env python3
"""
Health check script for PlagiaSense backend deployment
"""

import requests
import sys
import time

def check_health(base_url):
    """Check if the backend is healthy"""
    print(f"🔍 Checking health of: {base_url}")
    
    try:
        # Check root endpoint
        response = requests.get(f"{base_url}/", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed with error: {e}")
        return False

def check_endpoints(base_url):
    """Check specific API endpoints"""
    endpoints = [
        "/api/models",
        "/api/ai-detection/methods",
        "/api/ai-detection/models",
        "/api/status"
    ]
    
    print(f"\n🧪 Testing API endpoints...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint}: OK")
            else:
                print(f"⚠️ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: Error - {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Enter backend URL (e.g., https://your-app.onrender.com): ").strip()
    
    if not url.startswith(('http://', 'https://')):
        url = f"https://{url}"
    
    print(f"🚀 Testing PlagiaSense backend at: {url}")
    print("=" * 50)
    
    # Wait a moment for any cold start
    if "onrender.com" in url:
        print("⏳ Waiting for potential cold start (Render free tier)...")
        time.sleep(5)
    
    # Run health checks
    health_ok = check_health(url)
    
    if health_ok:
        check_endpoints(url)
        print(f"\n🎉 Backend is running successfully at: {url}")
    else:
        print(f"\n💥 Backend health check failed at: {url}")
        sys.exit(1)