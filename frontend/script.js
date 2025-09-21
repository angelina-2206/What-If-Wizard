/**
 * What If Wizard - Frontend JavaScript
 * Handles file upload, chat interface, and API communication
 */

class WhatIfWizard {
    constructor() {
        this.API_BASE_URL = 'http://127.0.0.1:5000';
        this.currentDocument = null;
        this.isProcessing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.showUploadSection();
    }

    initializeElements() {
        // Upload elements
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.uploadProgress = document.getElementById('upload-progress');
        this.progressFill = document.getElementById('progress-fill');
        this.uploadStatus = document.getElementById('upload-status');

        // Chat elements
        this.chatSection = document.getElementById('chat-section');
        this.uploadSection = document.getElementById('upload-section');
        this.chatMessages = document.getElementById('chat-messages');
        this.questionForm = document.getElementById('question-form');
        this.questionInput = document.getElementById('question-input');
        this.sendBtn = document.getElementById('send-btn');
        this.docName = document.getElementById('doc-name');
        this.resetBtn = document.getElementById('reset-btn');

        // Utility elements
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');
        this.toastContainer = document.getElementById('toast-container');

        // Sample question buttons
        this.questionButtons = document.querySelectorAll('.question-btn');
    }

    bindEvents() {
        // File upload events
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Chat events
        this.questionForm.addEventListener('submit', (e) => this.handleQuestionSubmit(e));
        this.questionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleQuestionSubmit(e);
            }
        });

        // Sample question buttons
        this.questionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.questionInput.value = question;
                this.handleQuestionSubmit();
            });
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetSession());

        // Prevent default drag behaviors on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    // File Upload Handlers
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.uploadFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        this.dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.uploadFile(files[0]);
        }
    }

    async uploadFile(file) {
        if (!this.validateFile(file)) {
            return;
        }

        this.showUploadProgress();
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.currentDocument = {
                    id: result.document_id,
                    filename: result.filename
                };
                
                this.showSuccessToast(`Document "${result.filename}" uploaded successfully!`);
                this.showChatSection();
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showErrorToast(`Upload failed: ${error.message}`);
            this.hideUploadProgress();
        }
    }

    validateFile(file) {
        if (!file.type.includes('pdf')) {
            this.showErrorToast('Please select a PDF file.');
            return false;
        }

        if (file.size > 16 * 1024 * 1024) { // 16MB limit
            this.showErrorToast('File size too large. Maximum size is 16MB.');
            return false;
        }

        return true;
    }

    // Chat Handlers
    async handleQuestionSubmit(event) {
        if (event) {
            event.preventDefault();
        }

        const question = this.questionInput.value.trim();
        if (!question || this.isProcessing) {
            return;
        }

        if (!this.currentDocument) {
            this.showErrorToast('Please upload a document first.');
            return;
        }

        this.addUserMessage(question);
        this.questionInput.value = '';
        this.setProcessing(true);

        try {
            const response = await fetch(`${this.API_BASE_URL}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.addBotMessage(result.answer, result.confidence, result.sources);
            } else {
                throw new Error(result.error || 'Failed to get answer');
            }
        } catch (error) {
            console.error('Question error:', error);
            this.addBotMessage(
                'I apologize, but I encountered an error while processing your question. Please try again.',
                'low'
            );
            this.showErrorToast(`Error: ${error.message}`);
        } finally {
            this.setProcessing(false);
        }
    }

    // UI State Management
    showUploadSection() {
        this.uploadSection.style.display = 'block';
        this.chatSection.style.display = 'none';
        this.resetBtn.style.display = 'none';
    }

    showChatSection() {
        this.uploadSection.style.display = 'none';
        this.chatSection.style.display = 'block';
        this.resetBtn.style.display = 'block';
        
        this.docName.textContent = this.currentDocument.filename;
        this.questionInput.focus();
        
        // Clear any existing chat messages except welcome
        const messages = this.chatMessages.querySelectorAll('.message:not(.welcome-message .message)');
        messages.forEach(msg => msg.remove());
    }

    showUploadProgress() {
        document.querySelector('.drop-zone-content').style.display = 'none';
        this.uploadProgress.style.display = 'block';
        
        // Animate progress bar
        this.progressFill.style.width = '0%';
        setTimeout(() => {
            this.progressFill.style.width = '90%';
        }, 100);
    }

    hideUploadProgress() {
        document.querySelector('.drop-zone-content').style.display = 'block';
        this.uploadProgress.style.display = 'none';
        this.progressFill.style.width = '0%';
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        this.sendBtn.disabled = processing;
        this.questionInput.disabled = processing;
        
        if (processing) {
            this.showLoadingOverlay('Processing your question...');
        } else {
            this.hideLoadingOverlay();
        }
    }

    showLoadingOverlay(text = 'Loading...') {
        this.loadingText.textContent = text;
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoadingOverlay() {
        this.loadingOverlay.style.display = 'none';
    }

    // Chat Message Management
    addUserMessage(text) {
        const messageHtml = `
            <div class="message user-message">
                <div class="message-avatar">👤</div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                </div>
            </div>
        `;
        
        this.chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    addBotMessage(text, confidence = 'medium', sources = []) {
        const confidenceBadge = confidence ? 
            `<span class="confidence-badge confidence-${confidence}">${confidence} confidence</span>` : '';
        
        const messageHtml = `
            <div class="message bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-meta">
                        ${confidenceBadge}
                        ${sources.length > 0 ? `• Based on ${sources.length} source(s)` : ''}
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    // Session Management
    async resetSession() {
        if (this.isProcessing) {
            this.showWarningToast('Please wait for the current operation to complete.');
            return;
        }

        try {
            await fetch(`${this.API_BASE_URL}/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            this.currentDocument = null;
            this.hideUploadProgress();
            this.showUploadSection();
            this.fileInput.value = '';
            this.showSuccessToast('Session reset successfully. You can upload a new document.');
        } catch (error) {
            console.error('Reset error:', error);
            this.showErrorToast('Failed to reset session. Please refresh the page.');
        }
    }

    // Toast Notifications
    showToast(message, type = 'success', duration = 5000) {
        const toastId = Date.now().toString();
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        const toastHtml = `
            <div class="toast ${type}" id="toast-${toastId}">
                <span class="toast-icon">${iconMap[type] || '📋'}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" onclick="this.parentElement.remove()">×</button>
            </div>
        `;

        this.toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Auto-remove after duration
        setTimeout(() => {
            const toast = document.getElementById(`toast-${toastId}`);
            if (toast) {
                toast.remove();
            }
        }, duration);
    }

    showSuccessToast(message, duration) {
        this.showToast(message, 'success', duration);
    }

    showErrorToast(message, duration) {
        this.showToast(message, 'error', duration);
    }

    showWarningToast(message, duration) {
        this.showToast(message, 'warning', duration);
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // API Health Check
    async checkApiHealth() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/`);
            const result = await response.json();
            
            if (response.ok && result.status === 'healthy') {
                console.log('✅ API is healthy:', result.message);
                return true;
            } else {
                throw new Error('API health check failed');
            }
        } catch (error) {
            console.error('❌ API health check failed:', error);
            this.showErrorToast(
                'Unable to connect to the backend API. Please ensure the server is running on http://127.0.0.1:5000',
                10000
            );
            return false;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new WhatIfWizard();
    
    // Perform initial API health check
    app.checkApiHealth();
    
    // Make app globally accessible for debugging
    window.whatIfWizard = app;
});

// Service Worker Registration (optional - for offline capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then((registration) => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch((registrationError) => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}