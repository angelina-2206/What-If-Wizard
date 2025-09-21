/**
 * What If Wizard - Enhanced Professional Frontend
 * Advanced features: Smart Summary, Red Flags, Visual Citations, Dynamic Interactions
 */

class WhatIfWizard {
    constructor() {
        this.API_BASE_URL = 'http://127.0.0.1:5000';
        this.currentDocument = null;
        this.isProcessing = false;
        this.smartSummary = null;
        this.redFlags = [];
        this.suggestedQuestions = [];
        this.processingStartTime = null;
        this.chunkCount = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.showUploadSection();
        this.initializeAnimations();
        this.checkApiHealth();
    }

    initializeElements() {
        // Upload elements
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.uploadProgress = document.getElementById('upload-progress');
        this.uploadStatus = document.getElementById('upload-status');
        this.uploadSubstatus = document.getElementById('upload-substatus');
        this.progressCircle = document.getElementById('progress-circle');

        // Section elements
        this.uploadSection = document.getElementById('upload-section');
        this.analysisSection = document.getElementById('analysis-section');

        // Document header elements
        this.docName = document.getElementById('doc-name');
        this.processingTime = document.getElementById('processing-time');
        this.chunkCountEl = document.getElementById('chunk-count');

        // Panel elements
        this.smartSummaryContent = document.getElementById('smart-summary-content');
        this.redFlagsContent = document.getElementById('red-flags-content');
        this.redFlagCount = document.getElementById('red-flag-count');
        this.questionsContent = document.getElementById('questions-content');

        // Chat elements
        this.chatMessages = document.getElementById('chat-messages');
        this.questionForm = document.getElementById('question-form');
        this.questionInput = document.getElementById('question-input');
        this.sendBtn = document.getElementById('send-btn');
        this.voiceBtn = document.getElementById('voice-btn');
        this.inputSuggestions = document.getElementById('input-suggestions');

        // Modal elements
        this.citationModal = document.getElementById('citation-modal');
        this.citationContent = document.getElementById('citation-content');
        this.closeCitation = document.getElementById('close-citation');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelp = document.getElementById('close-help');
        this.helpBtn = document.getElementById('help-btn');

        // Navigation and utility elements
        this.resetBtn = document.getElementById('reset-btn');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingTitle = document.getElementById('loading-title');
        this.loadingText = document.getElementById('loading-text');
        this.toastContainer = document.getElementById('toast-container');

        // Action buttons
        this.refreshSummary = document.getElementById('refresh-summary');
        this.expandSummary = document.getElementById('expand-summary');
        this.generateQuestions = document.getElementById('generate-questions');

        // Question lists
        this.rightsQuestions = document.getElementById('rights-questions');
        this.terminationQuestions = document.getElementById('termination-questions');
        this.financialQuestions = document.getElementById('financial-questions');
    }

    bindEvents() {
        // File upload events
        if (this.dropZone) {
            this.dropZone.addEventListener('click', () => this.fileInput?.click());
            this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', () => this.fileInput?.click());
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Chat events
        if (this.questionForm) {
            this.questionForm.addEventListener('submit', (e) => this.handleQuestionSubmit(e));
        }

        if (this.questionInput) {
            this.questionInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleQuestionSubmit(e);
                }
            });
            this.questionInput.addEventListener('input', (e) => this.handleInputChange(e));
        }

        // Voice input (placeholder for future implementation)
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => this.handleVoiceInput());
        }

        // Navigation events
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetSession());
        }

        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', () => this.showHelpModal());
        }

        // Modal events
        if (this.closeCitation) {
            this.closeCitation.addEventListener('click', () => this.hideCitationModal());
        }

        if (this.closeHelp) {
            this.closeHelp.addEventListener('click', () => this.hideHelpModal());
        }

        // Action button events
        if (this.refreshSummary) {
            this.refreshSummary.addEventListener('click', () => this.generateSmartSummary());
        }

        if (this.expandSummary) {
            this.expandSummary.addEventListener('click', () => this.expandSummaryModal());
        }

        if (this.generateQuestions) {
            this.generateQuestions.addEventListener('click', () => this.generateSuggestedQuestions());
        }

        // Global events
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());

        // Modal overlay clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideAllModals();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    initializeAnimations() {
        // Add intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.panel, .message').forEach(el => {
            this.observer.observe(el);
        });
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
        this.dropZone?.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.dropZone?.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        this.dropZone?.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.uploadFile(files[0]);
        }
    }

    async uploadFile(file) {
        if (!this.validateFile(file)) {
            return;
        }

        this.processingStartTime = Date.now();
        this.showUploadProgress();
        this.updateUploadStatus('Uploading file...', 'Please wait while we process your document');

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
                    filename: result.filename,
                    uploadTime: new Date()
                };
                
                // Calculate processing time
                const processingTime = Math.round((Date.now() - this.processingStartTime) / 1000);
                
                this.updateUploadStatus('Processing complete!', 'Initializing analysis dashboard...');
                
                setTimeout(() => {
                    this.showAnalysisSection(processingTime);
                    this.showSuccessToast(`Document "${result.filename}" analyzed successfully!`);
                }, 1500);

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

        if (file.size > 16 * 1024 * 1024) {
            this.showErrorToast('File size too large. Maximum size is 16MB.');
            return false;
        }

        return true;
    }

    updateUploadStatus(title, subtitle) {
        if (this.uploadStatus) this.uploadStatus.textContent = title;
        if (this.uploadSubstatus) this.uploadSubstatus.textContent = subtitle;
    }

    showUploadProgress() {
        const dropZoneContent = document.querySelector('.drop-zone-content');
        if (dropZoneContent) dropZoneContent.style.display = 'none';
        if (this.uploadProgress) this.uploadProgress.style.display = 'flex';

        // Animate progress circle
        if (this.progressCircle) {
            this.progressCircle.style.strokeDashoffset = '283';
            setTimeout(() => {
                this.progressCircle.style.strokeDashoffset = '28'; // 90% progress
            }, 300);
        }
    }

    hideUploadProgress() {
        const dropZoneContent = document.querySelector('.drop-zone-content');
        if (dropZoneContent) dropZoneContent.style.display = 'block';
        if (this.uploadProgress) this.uploadProgress.style.display = 'none';
        if (this.progressCircle) this.progressCircle.style.strokeDashoffset = '283';
    }

    showUploadSection() {
        if (this.uploadSection) this.uploadSection.style.display = 'block';
        if (this.analysisSection) this.analysisSection.style.display = 'none';
        if (this.resetBtn) this.resetBtn.style.display = 'none';
    }

    showAnalysisSection(processingTime = 0) {
        if (this.uploadSection) this.uploadSection.style.display = 'none';
        if (this.analysisSection) this.analysisSection.style.display = 'block';
        if (this.resetBtn) this.resetBtn.style.display = 'flex';

        // Update document info
        if (this.docName && this.currentDocument) {
            this.docName.textContent = this.currentDocument.filename;
        }
        
        if (this.processingTime) {
            this.processingTime.textContent = `Processed in ${processingTime}s`;
        }

        // Initialize analysis components
        this.generateSmartSummary();
        this.detectRedFlags();
        this.generateSuggestedQuestions();
        
        // Focus on chat input
        setTimeout(() => {
            this.questionInput?.focus();
        }, 1000);
    }

    // Smart Summary Generation
    async generateSmartSummary() {
        if (!this.currentDocument) return;

        if (this.smartSummaryContent) {
            this.smartSummaryContent.innerHTML = `
                <div class="summary-loading">
                    <div class="loading-spinner small"></div>
                    <p>Generating intelligent summary...</p>
                </div>
            `;
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/smart-summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.smartSummary = result.summary;
                this.renderSmartSummary(result.summary);
            } else {
                throw new Error(result.error || 'Failed to generate smart summary');
            }

        } catch (error) {
            console.error('Summary generation error:', error);
            if (this.smartSummaryContent) {
                this.smartSummaryContent.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to generate summary. ${error.message}</p>
                    </div>
                `;
            }
        }
    }

    renderSmartSummary(summary) {
        if (!this.smartSummaryContent) return;

        const summaryHtml = `
            <div class="summary-sections">
                <div class="summary-section">
                    <h4><i class="fas fa-shield-alt"></i> Key Rights</h4>
                    <ul class="summary-list">
                        ${summary.keyRights.map(right => `<li>${right}</li>`).join('')}
                    </ul>
                </div>
                <div class="summary-section">
                    <h4><i class="fas fa-tasks"></i> Top Obligations</h4>
                    <ul class="summary-list">
                        ${summary.topObligations.map(obligation => `<li>${obligation}</li>`).join('')}
                    </ul>
                </div>
                <div class="summary-section">
                    <h4><i class="fas fa-times-circle"></i> Termination Rules</h4>
                    <ul class="summary-list">
                        ${summary.terminationRules.map(rule => `<li>${rule}</li>`).join('')}
                    </ul>
                </div>
                <div class="summary-footer">
                    <div class="risk-indicator risk-${summary.riskLevel.toLowerCase()}">
                        <i class="fas fa-info-circle"></i>
                        Risk Level: ${summary.riskLevel}
                    </div>
                </div>
            </div>
        `;

        this.smartSummaryContent.innerHTML = summaryHtml;
        this.smartSummaryContent.style.animation = 'fadeInUp 0.5s ease-out';
    }

    // Red Flag Detection
    async detectRedFlags() {
        if (!this.currentDocument) return;

        try {
            const response = await fetch(`${this.API_BASE_URL}/red-flags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.redFlags = result.red_flags;
                this.renderRedFlags(result.red_flags);
            } else {
                throw new Error(result.error || 'Failed to detect red flags');
            }

        } catch (error) {
            console.error('Red flag detection error:', error);
            this.renderNoRedFlags();
        }
    }

    renderRedFlags(redFlags) {
        if (!this.redFlagsContent || !this.redFlagCount) return;

        this.redFlagCount.textContent = redFlags.length.toString();
        
        if (redFlags.length === 0) {
            this.renderNoRedFlags();
            return;
        }

        const redFlagsHtml = redFlags.map(flag => `
            <div class="red-flag-item" data-flag-id="${flag.id}">
                <div class="red-flag-title">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${flag.title}
                    <span class="severity-badge severity-${flag.severity}">${flag.severity}</span>
                </div>
                <div class="red-flag-description">${flag.description}</div>
                <div class="red-flag-location">
                    <i class="fas fa-map-marker-alt"></i>
                    Found in: <span class="citation-highlight" onclick="window.whatIfWizard.showCitation('${flag.location}')">${flag.location}</span>
                </div>
            </div>
        `).join('');

        this.redFlagsContent.innerHTML = redFlagsHtml;
    }

    renderNoRedFlags() {
        if (!this.redFlagsContent || !this.redFlagCount) return;
        
        this.redFlagCount.textContent = '0';
        this.redFlagsContent.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-shield-alt"></i>
                <p>No critical issues detected</p>
                <small>Your document appears to have standard terms and conditions</small>
            </div>
        `;
    }

    // Question Generation
    async generateSuggestedQuestions() {
        if (!this.currentDocument) return;

        try {
            const response = await fetch(`${this.API_BASE_URL}/suggested-questions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.suggestedQuestions = result.questions;
                this.renderSuggestedQuestions(result.questions);
            } else {
                // Fallback to generic questions if API fails
                const fallbackQuestions = {
                    rights: [
                        "What are my intellectual property rights?",
                        "Can I terminate this contract early?",
                        "What happens to my work if the contract ends?"
                    ],
                    termination: [
                        "What constitutes a material breach?",
                        "How much notice is required for termination?",
                        "What are the consequences of early termination?"
                    ],
                    financial: [
                        "When and how will payments be made?",
                        "Are there any penalties or late fees?",
                        "What expenses am I responsible for?"
                    ]
                };
                this.suggestedQuestions = fallbackQuestions;
                this.renderSuggestedQuestions(fallbackQuestions);
            }

        } catch (error) {
            console.error('Question generation error:', error);
            // Use fallback questions on error
            const fallbackQuestions = {
                rights: ["What are my main rights under this document?"],
                termination: ["How can this contract be terminated?"],
                financial: ["What are my payment obligations?"]
            };
            this.suggestedQuestions = fallbackQuestions;
            this.renderSuggestedQuestions(fallbackQuestions);
        }
    }

    renderSuggestedQuestions(questions) {
        if (this.rightsQuestions) {
            this.rightsQuestions.innerHTML = questions.rights.map(q => 
                `<button class="question-item" onclick="window.whatIfWizard.askQuestion('${q}')">${q}</button>`
            ).join('');
        }

        if (this.terminationQuestions) {
            this.terminationQuestions.innerHTML = questions.termination.map(q => 
                `<button class="question-item" onclick="window.whatIfWizard.askQuestion('${q}')">${q}</button>`
            ).join('');
        }

        if (this.financialQuestions) {
            this.financialQuestions.innerHTML = questions.financial.map(q => 
                `<button class="question-item" onclick="window.whatIfWizard.askQuestion('${q}')">${q}</button>`
            ).join('');
        }
    }

    // Chat Functionality
    async handleQuestionSubmit(event) {
        if (event) {
            event.preventDefault();
        }

        const question = this.questionInput?.value?.trim();
        if (!question || this.isProcessing) {
            return;
        }

        if (!this.currentDocument) {
            this.showErrorToast('Please upload a document first.');
            return;
        }

        this.askQuestion(question);
    }

    async askQuestion(question) {
        if (this.questionInput) {
            this.questionInput.value = question;
        }
        
        this.addUserMessage(question);
        if (this.questionInput) {
            this.questionInput.value = '';
        }
        
        this.setProcessing(true);
        this.showLoadingOverlay('AI is analyzing your question...', 'This may take a few moments');

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
            this.hideLoadingOverlay();
        }
    }

    addUserMessage(text) {
        if (!this.chatMessages) return;

        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const messageHtml = `
            <div class="message user-message">
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
        
        this.chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    addBotMessage(text, confidence = 'medium', sources = []) {
        if (!this.chatMessages) return;

        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const confidenceBadge = confidence ? 
            `<span class="confidence-badge confidence-${confidence}">${confidence} confidence</span>` : '';

        // Process text for citations
        const processedText = this.addCitationHighlights(text);
        
        const sourceInfo = sources.length > 0 ? 
            `<div class="sources-info">
                <i class="fas fa-quote-left"></i>
                Based on ${sources.length} source(s) from document
            </div>` : '';

        const messageHtml = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${processedText}</div>
                    ${sourceInfo}
                    <div class="message-meta">
                        ${confidenceBadge}
                        <span class="message-time">${timestamp}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    addCitationHighlights(text) {
        // Add clickable citations for common legal references
        return text.replace(
            /(Section \d+\.?\d*|Clause \d+\.?\d*|Article \d+\.?\d*|Paragraph \d+\.?\d*)/gi,
            '<span class="citation-highlight" onclick="window.whatIfWizard.showCitation(\'$1\')">$1</span>'
        );
    }

    scrollToBottom() {
        if (this.chatMessages) {
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);
        }
    }

    // Input suggestions (as user types)
    handleInputChange(event) {
        const value = event.target.value.toLowerCase();
        if (value.length < 3) {
            this.hideSuggestions();
            return;
        }

        // Simple suggestion matching
        const suggestions = [
            "What are my rights under this contract?",
            "What happens if I breach this agreement?",
            "How can I terminate this contract?",
            "What are my payment obligations?",
            "What are the key deadlines I need to know?",
            "Are there any penalties mentioned?",
            "What intellectual property rights are involved?",
            "What dispute resolution mechanisms are in place?"
        ].filter(suggestion => 
            suggestion.toLowerCase().includes(value) && suggestion.toLowerCase() !== value
        ).slice(0, 3);

        this.showSuggestions(suggestions);
    }

    showSuggestions(suggestions) {
        if (!this.inputSuggestions || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsHtml = suggestions.map(suggestion => 
            `<div class="suggestion-item" onclick="window.whatIfWizard.selectSuggestion('${suggestion}')">${suggestion}</div>`
        ).join('');

        this.inputSuggestions.innerHTML = suggestionsHtml;
        this.inputSuggestions.style.display = 'block';
    }

    hideSuggestions() {
        if (this.inputSuggestions) {
            this.inputSuggestions.style.display = 'none';
        }
    }

    selectSuggestion(suggestion) {
        if (this.questionInput) {
            this.questionInput.value = suggestion;
            this.questionInput.focus();
        }
        this.hideSuggestions();
    }

    // Citation Modal
    showCitation(reference) {
        if (!this.citationModal || !this.citationContent) return;

        const citationData = {
            reference: reference,
            content: `This is the full text of ${reference}. In a real implementation, this would show the actual text from the document that corresponds to this reference.`,
            context: "This section deals with the specific terms and conditions related to your query."
        };

        const citationHtml = `
            <div class="citation-details">
                <h4>${citationData.reference}</h4>
                <div class="citation-text">
                    <p>${citationData.content}</p>
                </div>
                <div class="citation-context">
                    <strong>Context:</strong> ${citationData.context}
                </div>
                <div class="citation-actions">
                    <button class="action-btn" onclick="window.whatIfWizard.askAboutCitation('${reference}')">
                        <i class="fas fa-question-circle"></i>
                        Ask about this section
                    </button>
                </div>
            </div>
        `;

        this.citationContent.innerHTML = citationHtml;
        this.citationModal.style.display = 'flex';
    }

    hideCitationModal() {
        if (this.citationModal) {
            this.citationModal.style.display = 'none';
        }
    }

    askAboutCitation(reference) {
        this.hideCitationModal();
        this.askQuestion(`Can you explain ${reference} in more detail?`);
    }

    // Help Modal
    showHelpModal() {
        if (this.helpModal) {
            this.helpModal.style.display = 'flex';
        }
    }

    hideHelpModal() {
        if (this.helpModal) {
            this.helpModal.style.display = 'none';
        }
    }

    hideAllModals() {
        this.hideCitationModal();
        this.hideHelpModal();
    }

    // Voice Input (placeholder)
    handleVoiceInput() {
        this.showWarningToast('Voice input feature coming soon!');
    }

    // Processing State Management
    setProcessing(processing) {
        this.isProcessing = processing;
        if (this.sendBtn) this.sendBtn.disabled = processing;
        if (this.questionInput) this.questionInput.disabled = processing;
    }

    showLoadingOverlay(title = 'Processing...', text = 'Please wait...') {
        if (this.loadingTitle) this.loadingTitle.textContent = title;
        if (this.loadingText) this.loadingText.textContent = text;
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
    }

    hideLoadingOverlay() {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
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
            this.smartSummary = null;
            this.redFlags = [];
            this.suggestedQuestions = [];
            this.hideUploadProgress();
            this.showUploadSection();
            if (this.fileInput) this.fileInput.value = '';
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
                <button class="toast-close" onclick="document.getElementById('toast-${toastId}').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        if (this.toastContainer) {
            this.toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        }

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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                'Unable to connect to the backend API. Please ensure the server is running.',
                10000
            );
            return false;
        }
    }

    // Modal expansion features
    expandSummaryModal() {
        if (!this.smartSummary) return;
        
        // Create expanded summary modal
        const expandedModal = document.createElement('div');
        expandedModal.className = 'modal expanded-summary-modal';
        expandedModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content large">
                <div class="modal-header">
                    <h3><i class="fas fa-expand"></i> Detailed Document Summary</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="expanded-summary">
                        ${this.smartSummaryContent?.innerHTML || 'Summary not available'}
                        <div class="summary-actions">
                            <button class="action-btn" onclick="window.whatIfWizard.downloadSummary()">
                                <i class="fas fa-download"></i>
                                Download Summary
                            </button>
                            <button class="action-btn" onclick="window.whatIfWizard.emailSummary()">
                                <i class="fas fa-envelope"></i>
                                Email Summary
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(expandedModal);
        expandedModal.style.display = 'flex';
    }

    downloadSummary() {
        this.showWarningToast('Download feature coming soon!');
    }

    emailSummary() {
        this.showWarningToast('Email feature coming soon!');
    }
}

// Initialize the enhanced application
document.addEventListener('DOMContentLoaded', () => {
    const app = new WhatIfWizard();
    
    // Make app globally accessible
    window.whatIfWizard = app;
    
    // Enhanced loading animation
    const loadingElements = document.querySelectorAll('.loading-spinner, .upload-animation');
    loadingElements.forEach(el => {
        el.style.animation = 'spin 1s linear infinite';
    });
});

// Enhanced error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.whatIfWizard) {
        window.whatIfWizard.showErrorToast('An unexpected error occurred. Please refresh the page.');
    }
});

// Enhanced performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`✅ What If Wizard loaded in ${Math.round(loadTime)}ms`);
});