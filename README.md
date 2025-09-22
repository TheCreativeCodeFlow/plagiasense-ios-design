# PlagiaSense - AI-Powered Plagiarism Detection

PlagiaSense is a modern, full-stack plagiarism detection application that combines a React frontend with a Python FastAPI backend powered by BERT (Bidirectional Encoder Representations from Transformers) for advanced semantic similarity analysis.

## Features

### Frontend (React + TypeScript + Tailwind CSS)
- 🎨 Modern iOS-inspired design with glassmorphism effects
- 📱 Responsive design that works on all devices
- 🌙 Dark/Light theme support
- 📊 Interactive dashboard with file upload
- 📈 Detailed plagiarism reports with visual insights
- 🔍 Sentence-by-sentence analysis navigation

### Backend (FastAPI + BERT)
- 🧠 BERT-powered semantic similarity detection
- 📄 PDF document processing
- 🌍 Multi-language support (100+ languages)
- ⚡ Real-time analysis with progress tracking
- 🔧 Configurable similarity thresholds
- 📊 RESTful API with automatic documentation

## Quick Start

### Option 1: Use the Startup Scripts (Recommended)

**Windows:**
```bash
# Double-click start.bat or run in terminal:
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

**1. Install Dependencies**

Frontend:
```bash
npm install
```

Backend:
```bash
cd backend
pip install -r requirements.txt
```

**2. Start the Services**

Backend (Terminal 1):
```bash
cd backend
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Frontend (Terminal 2):
```bash
npm run dev
```

## Access Points

- **Frontend Application**: http://localhost:8080 (or 8081 if 8080 is in use)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/

## How to Use

1. **Upload Documents**: 
   - Navigate to the Dashboard
   - Upload at least 2 PDF files (first is student document, rest are references)
   - Click "Analyze Documents"

2. **Review Results**:
   - View overall plagiarism score and statistics
   - Navigate through flagged sentences
   - Review similarity scores and source matches
   - Download detailed reports

3. **Customize Analysis**:
   - Adjust similarity thresholds via API
   - Configure processing parameters
   - Choose different BERT models for analysis

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (UI components)
- React Router (navigation)
- React Query (state management)

### Backend
- FastAPI (Python web framework)
- Sentence Transformers (BERT models)
- PyTorch (machine learning)
- pdfplumber (PDF processing)
- NLTK (natural language processing)

## Original Lovable Project

**URL**: https://lovable.dev/projects/7e7f3051-e69a-4868-901e-ca786cc85d96

This project was originally created with Lovable and has been extended with a full Python backend for AI-powered plagiarism detection.
