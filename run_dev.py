"""
DocuMind AI - Unified Development Runner
Launches the FastAPI backend and provides instructions for the React frontend.
"""
import subprocess
import sys
import os
import time

def main():
    print("=" * 70)
    print("🧠 DocuMind AI - Autonomous Academic Document Intelligence Platform")
    print("=" * 70)
    print("Starting FastAPI backend server on http://127.0.0.1:8000 ...")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    print("Frontend is located in ./frontend (run 'npm run dev' to launch UI)")
    print("=" * 70)

    try:
        import uvicorn
        uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\nDocuMind AI server stopped.")

if __name__ == "__main__":
    main()
