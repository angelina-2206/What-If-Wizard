"""
What If Wizard - AI-Powered Legal Document Assistant
Main Flask application with RAG (Retrieval-Augmented Generation) capabilities.
"""

import os
import tempfile
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from document_processor import DocumentProcessor
from question_answerer import QuestionAnswerer

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize components
document_processor = DocumentProcessor()
question_answerer = QuestionAnswerer()

# Global variable to store current document state
current_document_id = None


def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'What If Wizard API is running',
        'version': '1.0.0'
    })


@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handle file upload and document processing.
    Processes the uploaded PDF and prepares it for questioning.
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Process the document
        document_id = document_processor.process_document(file_path, filename)
        
        # Store the current document ID globally
        global current_document_id
        current_document_id = document_id
        
        # Clean up the uploaded file (we've processed it into the vector store)
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'message': f'Document "{filename}" uploaded and processed successfully',
            'document_id': document_id,
            'filename': filename
        })
    
    except Exception as e:
        app.logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': f'Failed to process document: {str(e)}'}), 500


@app.route('/ask', methods=['POST'])
def ask_question():
    """
    Handle question asking about the uploaded document.
    Uses RAG to provide answers based on document content.
    """
    try:
        # Check if we have a document loaded
        if current_document_id is None:
            return jsonify({'error': 'No document uploaded. Please upload a PDF first.'}), 400
        
        # Get the question from request
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'error': 'No question provided'}), 400
        
        question = data['question'].strip()
        if not question:
            return jsonify({'error': 'Question cannot be empty'}), 400
        
        # Get answer from the question answerer
        result = question_answerer.answer_question(question, current_document_id)
        
        return jsonify({
            'success': True,
            'question': question,
            'answer': result['answer'],
            'sources': result.get('sources', []),
            'confidence': result.get('confidence', 'medium')
        })
    
    except Exception as e:
        app.logger.error(f"Error answering question: {str(e)}")
        return jsonify({'error': f'Failed to answer question: {str(e)}'}), 500


@app.route('/reset', methods=['POST'])
def reset_session():
    """Reset the current session and clear the loaded document."""
    try:
        global current_document_id
        if current_document_id:
            # Clear the document from the vector store if needed
            document_processor.clear_document(current_document_id)
            current_document_id = None
        
        return jsonify({
            'success': True,
            'message': 'Session reset successfully'
        })
    
    except Exception as e:
        app.logger.error(f"Error resetting session: {str(e)}")
        return jsonify({'error': f'Failed to reset session: {str(e)}'}), 500


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    return jsonify({'error': 'Internal server error occurred.'}), 500


if __name__ == '__main__':
    # Check for required environment variables
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key in a .env file or environment variable.")
    
    # Run the Flask app
    app.run(debug=True, host='127.0.0.1', port=5000)