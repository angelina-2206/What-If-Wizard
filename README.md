# What If Wizard 🧙‍♂️

*AI-Powered Legal Document Assistant*

## Overview

What If Wizard is an intelligent legal document analysis tool that helps you understand contracts, agreements, and other legal documents through natural language questions. Upload your PDF documents and get instant insights about your rights, obligations, and potential risks.

## ✨ Features

- **Smart Document Analysis**: AI-powered extraction of key rights, obligations, and terms
- **Red Flag Detection**: Automatically identifies potentially problematic clauses
- **Interactive Q&A**: Ask questions about your documents in plain English
- **Smart Summaries**: Get instant overviews of complex legal documents
- **Contextual Questions**: AI-generated relevant questions based on your document
- **Modern UI**: Professional interface with smooth animations
- **Cost-Effective**: Uses local embeddings to minimize API costs

## 🚀 Quick Start

### Option 1: Simple Run (Recommended)
```bash
python run.py
```

### Option 2: Manual Setup
1. **Activate virtual environment**:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Start the backend**:
   ```bash
   cd backend
   python app.py
   ```

3. **Open the frontend**:
   - Open `frontend/index.html` in your web browser
   - The backend will be running on http://127.0.0.1:5000

4. **Upload and analyze**:
   - Drag & drop a PDF document
   - Wait for processing to complete
   - Explore smart summaries and red flags
   - Ask questions about your document

## 🏗️ Project Structure (Cleaned)

```
what-if-wizard/
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Professional styling
│   └── script.js           # Enhanced frontend logic
├── backend/
│   ├── app.py              # Main Flask application
│   ├── document_processor.py # PDF processing & embeddings
│   └── requirements.txt    # Python dependencies
├── uploads/                # Temporary file storage (auto-created)
├── .env                    # API keys and configuration
├── run.py                  # Simple startup script
└── README.md
```

## 🔧 Configuration

### API Keys Setup
The application supports multiple AI providers:

1. **ByteZ API** (Recommended for cost-effectiveness):
   ```env
   BYTEZ_API_KEY=your-bytez-api-key
   ```

2. **OpenAI API** (Premium option):
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```

### Hybrid Architecture
- **Language Model**: ByteZ Llama-3-70B or OpenAI GPT
- **Embeddings**: Local SentenceTransformer (free, private, fast)
- **Vector Database**: ChromaDB (local storage)
- **No per-query embedding costs!**

## 💡 Key Advantages

1. **Cost-Effective**: Local embeddings eliminate per-query costs
2. **Privacy-First**: Document embeddings stay on your machine
3. **Reliable**: Multiple fallback options ensure it always works
4. **Fast**: Local embeddings are faster than API calls
5. **Professional**: Modern UI with smooth animations and responsive design

## 🔒 Security & Privacy

- Documents processed locally and deleted after analysis
- Embeddings computed and stored locally
- Only question/answer text sent to AI APIs
- No document content stored on external servers

## 🛠️ Advanced Usage

### Smart Summary Features
- Key rights extraction
- Obligation identification
- Risk level assessment
- Termination conditions
- Important dates

### Red Flag Detection
- Broad indemnification clauses
- Automatic renewal terms
- Unlimited liability exposure
- Restrictive covenants
- Unusual penalty clauses

### Interactive Features
- Context-aware question suggestions
- Visual citations with source highlighting
- Confidence indicators for AI responses
- Toast notifications for user feedback

## 📋 Requirements

- Python 3.8+
- Modern web browser
- 2GB RAM (for local embeddings)
- Internet connection (for AI API calls)

## 🚨 Troubleshooting

### Common Solutions
1. **API Errors**: Check your API keys in `.env` file
2. **Slow Processing**: First-time download of embedding model (~500MB)
3. **CORS Issues**: Ensure backend is running on port 5000
4. **PDF Issues**: Ensure PDFs contain extractable text

### Get Help
- Check the browser console for error messages
- Verify all dependencies are installed
- Ensure virtual environment is activated

## 🎯 Example Questions

- "What are my main obligations under this contract?"
- "How can I terminate this agreement?"
- "What red flags should I be concerned about?"
- "What are the payment terms and deadlines?"
- "What happens if I breach this contract?"
- "Are there any automatic renewal clauses?"

---

*What If Wizard - Making legal documents accessible through AI* 🧙‍♂️⚖️
