# What If Wizard 🧙‍♂️

**AI-Powered Legal Document Assistant**

Transform static, complex legal documents into interactive simulations. What If Wizard allows users to upload legal documents and ask natural language questions about them, receiving instant, accurate answers directly sourced from the document's text.

![What If Wizard Banner](https://via.placeholder.com/800x200/4f46e5/ffffff?text=What+If+Wizard)

## 🌟 Features

- **📄 PDF Document Upload**: Drag-and-drop or browse to upload PDF legal documents
- **🤖 AI-Powered Q&A**: Ask questions in natural language about your documents
- **🔍 RAG Technology**: Uses Retrieval-Augmented Generation for accurate, source-based answers
- **💬 Chat Interface**: Intuitive chat-style interface for seamless interaction
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Real-time Processing**: Fast document processing and question answering
- **🎯 Legal Focus**: Specialized prompts for legal document analysis

## 🚀 Tech Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **LangChain** - LLM orchestration
- **OpenAI GPT-3.5-turbo** - Language model
- **ChromaDB** - Vector database
- **PyPDF2** - PDF text extraction

### Frontend
- **HTML5** - Structure
- **Modern CSS** - Styling with CSS variables
- **Vanilla JavaScript** - Interactive functionality
- **Fetch API** - HTTP requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher**
- **pip** (Python package manager)
- **OpenAI API Key** (from [OpenAI Platform](https://platform.openai.com/))

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd what-if-wizard
```

### 2. Create a Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

```bash
# Copy the template file
cp .env.template .env

# Edit the .env file with your actual values
```

**Required Environment Variables:**

```env
OPENAI_API_KEY=your-openai-api-key-here
```

**Get your OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

### 5. Run the Backend Server

```bash
cd backend
python app.py
```

The backend server will start on `http://127.0.0.1:5000`

### 6. Serve the Frontend

You have several options to serve the frontend:

**Option A: Simple HTTP Server (Python)**
```bash
cd frontend
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option B: Live Server (VS Code Extension)**
1. Install the "Live Server" extension in VS Code
2. Right-click on `frontend/index.html`
3. Select "Open with Live Server"

**Option C: Any Web Server**
Simply serve the `frontend` directory with any web server of your choice.

## 🎯 Usage

### 1. Upload a Document
- Open the application in your browser
- Drag and drop a PDF file onto the upload area, or click "Choose PDF File"
- Wait for the document to be processed (this may take a few seconds)

### 2. Ask Questions
- Once the document is processed, you'll see a chat interface
- Use the sample question buttons for quick start
- Or type your own questions about the document
- Press Enter or click the send button

### 3. Review Answers
- The AI will provide answers based on the document content
- Each answer includes a confidence level (high, medium, low)
- Source information shows how many document sections were used

### 4. Start Over
- Click "New Document" to reset and upload a different document

## 💡 Sample Questions

Try asking questions like:

- "What are my main obligations under this document?"
- "What happens if I breach the terms of this agreement?"
- "What are the termination conditions?"
- "What fees or payments are required?"
- "What are the key dates and deadlines?"
- "What if I want to cancel early?"
- "Under what circumstances can this agreement be modified?"

## 🔧 Configuration

### Backend Configuration

The backend can be configured through environment variables:

```env
# Flask settings
FLASK_ENV=development
FLASK_DEBUG=True

# OpenAI settings
OPENAI_API_KEY=your-api-key-here

# File upload limits
MAX_FILE_SIZE=16777216  # 16MB in bytes
```

### Frontend Configuration

The API base URL can be changed in `frontend/script.js`:

```javascript
this.API_BASE_URL = 'http://127.0.0.1:5000';
```

## 📁 Project Structure

```
what-if-wizard/
│
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── document_processor.py     # PDF processing and vector storage
│   ├── question_answerer.py      # RAG question answering
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── styles.css               # CSS styling
│   └── script.js                # JavaScript functionality
│
├── uploads/                     # Temporary file uploads (auto-created)
├── chroma_db/                   # ChromaDB vector store (auto-created)
├── .env.template               # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🔒 Security Considerations

- **API Keys**: Never commit your `.env` file or expose API keys
- **File Uploads**: The application only accepts PDF files up to 16MB
- **CORS**: Currently configured for development; adjust for production
- **Input Validation**: All user inputs are validated and sanitized

## 🚀 Deployment

### For Production Deployment:

1. **Backend**:
   - Use a production WSGI server like Gunicorn
   - Set up proper environment variables
   - Configure CORS for your domain
   - Set up HTTPS

2. **Frontend**:
   - Serve static files through a web server (Nginx, Apache)
   - Update API_BASE_URL to your production backend URL
   - Enable gzip compression

3. **Database**:
   - Consider using a more robust vector database for production
   - Set up regular backups

## 🐛 Troubleshooting

### Common Issues:

**"Unable to connect to the backend API"**
- Ensure the backend server is running on `http://127.0.0.1:5000`
- Check that no firewall is blocking the connection

**"OpenAI API key not set"**
- Verify your `.env` file contains the correct API key
- Make sure the `.env` file is in the `backend` directory

**"Error extracting text from PDF"**
- Ensure the PDF is not encrypted or password-protected
- Try with a different PDF file

**"File too large"**
- Maximum file size is 16MB
- Compress your PDF or use a smaller file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT models
- **LangChain** for the LLM orchestration framework
- **ChromaDB** for the vector database
- **Flask** for the web framework
- **Inter Font** for the beautiful typography

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**Made with ❤️ by the What If Wizard Team**