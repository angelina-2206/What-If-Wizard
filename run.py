#!/usr/bin/env python3
"""
What If Wizard - Simple Runner
Easy way to start the application
"""

import os
import sys
import webbrowser
import time
from pathlib import Path

def main():
    """Run the What If Wizard application."""
    print("🧙‍♂️ Starting What If Wizard...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("backend/app.py").exists():
        print("❌ Error: Please run this script from the project root directory")
        sys.exit(1)
    
    # Check if virtual environment is activated
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Virtual environment not detected")
        print("   Consider activating your virtual environment first:")
        print("   Windows: venv\\Scripts\\activate")
        print("   Linux/Mac: source venv/bin/activate")
        print()
    
    print("🚀 Starting backend server...")
    print("📊 Using local embeddings (no API costs!)")
    print("🤖 ByteZ API integration enabled")
    print()
    print("📝 Instructions:")
    print("   1. Backend will start on http://127.0.0.1:5000")
    print("   2. Open frontend/index.html in your browser")
    print("   3. Upload a PDF document to get started")
    print("   4. Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Change to backend directory and run the app
    os.chdir("backend")
    os.system("python app.py")

if __name__ == "__main__":
    main()