#!/usr/bin/env python3
"""
What If Wizard - Quick Setup Script
This script helps set up the What If Wizard application quickly.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required.")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_pip():
    """Check if pip is available."""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print("✅ pip is available")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error: pip is not available")
        return False

def create_virtual_environment():
    """Create a virtual environment."""
    venv_path = Path("venv")
    if venv_path.exists():
        print("✅ Virtual environment already exists")
        return True
    
    try:
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Virtual environment created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error creating virtual environment: {e}")
        return False

def install_dependencies():
    """Install Python dependencies."""
    requirements_path = Path("backend/requirements.txt")
    if not requirements_path.exists():
        print("❌ Error: requirements.txt not found")
        return False
    
    # Determine the correct pip path based on OS
    if os.name == 'nt':  # Windows
        pip_path = Path("venv/Scripts/pip")
    else:  # macOS/Linux
        pip_path = Path("venv/bin/pip")
    
    try:
        print("📦 Installing dependencies...")
        subprocess.run([str(pip_path), "install", "-r", str(requirements_path)], 
                      check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def setup_environment_file():
    """Set up the .env file from template."""
    env_template_path = Path(".env.template")
    env_path = Path("backend/.env")
    
    if env_path.exists():
        print("✅ .env file already exists")
        return True
    
    if not env_template_path.exists():
        print("❌ Error: .env.template not found")
        return False
    
    try:
        # Copy template to backend directory
        with open(env_template_path, 'r') as template:
            content = template.read()
        
        with open(env_path, 'w') as env_file:
            env_file.write(content)
        
        print("✅ .env file created from template")
        print("⚠️  IMPORTANT: Please edit backend/.env and add your OpenAI API key!")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

def print_next_steps():
    """Print the next steps for the user."""
    print("\n" + "="*60)
    print("🎉 Setup completed successfully!")
    print("="*60)
    print("\n📝 Next steps:")
    print("1. Edit backend/.env and add your OpenAI API key:")
    print("   OPENAI_API_KEY=your-actual-api-key-here")
    print("\n2. Activate the virtual environment:")
    if os.name == 'nt':  # Windows
        print("   venv\\Scripts\\activate")
    else:  # macOS/Linux
        print("   source venv/bin/activate")
    print("\n3. Start the backend server:")
    print("   cd backend")
    print("   python app.py")
    print("\n4. In another terminal, serve the frontend:")
    print("   cd frontend")
    print("   python -m http.server 8000")
    print("\n5. Open http://localhost:8000 in your browser")
    print("\n📖 For detailed instructions, see README.md")

def main():
    """Main setup function."""
    print("🧙‍♂️ What If Wizard - Setup Script")
    print("="*40)
    
    # Check prerequisites
    if not check_python_version():
        return 1
    
    if not check_pip():
        return 1
    
    # Setup steps
    steps = [
        ("Creating virtual environment", create_virtual_environment),
        ("Installing dependencies", install_dependencies),
        ("Setting up environment file", setup_environment_file),
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        if not step_func():
            print(f"❌ Setup failed at: {step_name}")
            return 1
    
    print_next_steps()
    return 0

if __name__ == "__main__":
    sys.exit(main())