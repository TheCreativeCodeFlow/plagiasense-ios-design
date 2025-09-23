#!/bin/bash

# Render startup script for PlagiaSense Backend

echo "🚀 Starting PlagiaSense Backend on Render..."

# Set environment variables
export PYTHONPATH="./backend:$PYTHONPATH"

# Download NLTK data if needed
python -c "
import nltk
try:
    nltk.data.find('tokenizers/punkt')
    print('✅ NLTK punkt tokenizer already available')
except LookupError:
    print('📥 Downloading NLTK punkt tokenizer...')
    nltk.download('punkt', quiet=True)
    print('✅ NLTK punkt tokenizer downloaded')

try:
    nltk.data.find('tokenizers/punkt_tab')
    print('✅ NLTK punkt_tab tokenizer already available')
except LookupError:
    print('📥 Downloading NLTK punkt_tab tokenizer...')
    nltk.download('punkt_tab', quiet=True)
    print('✅ NLTK punkt_tab tokenizer downloaded')
"

# Start the FastAPI server
echo "🌐 Starting FastAPI server on port $PORT..."
exec uvicorn backend.api:app --host 0.0.0.0 --port $PORT --workers 1