<div align="center">
  <h1>🧙‍♂️ What If Wizard</h1>
  <p><strong>The Intelligence-Driven Legal Workspace</strong></p>
  <img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img alt="Flask" src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img alt="LangChain" src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</div>

<br/>

## 📖 Overview

**What If Wizard** is a premium, AI-native legal document analysis tool. It transforms static contracts, terms of service, and agreements into fully interactive workspaces. With a focus on consumer and enterprise privacy, the platform automatically parses complex legal jargon and highlights hidden risks, obligations, and financial exposures.

Through an intuitive, glassmorphic UI, users can engage in high-speed, structural Q&A to uncover exactly what their contracts dictate—without the need for an expensive legal retainer.

---

## ⚡ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Architecture** | Vanilla HTML5, Modern CSS3 (Glassmorphism), Vanilla JavaScript (ES6+), FontAwesome Icons |
| **Backend Framework** | Python 3, Flask, Werkzeug |
| **AI & NLP Processing** | LangChain, ByteZ API (LLaMA-3 70B), Local SentenceTransformers |
| **Vector Database** | ChromaDB (Local, Privacy-First storage) |

---

## ✨ Premium Features

*   **Asymmetric 60/40 Workspace:** A high-end split layout featuring an intelligent dropzone and a dynamic conversational AI side-panel.
*   **Intelligent Smart Summaries:** Scrapes complex PDF text into categorised, collapsible Markdown-rendered blocks (Rights, Obligations, Risks) with embedded Risk Gauges.
*   **Conversational UX & Typewriter AI:** AI responses are streamed naturally via a custom DOM TreeWalker mechanic, supporting live Markdown, Confidence Badges, and Source Highlight bindings.
*   **Color-Coded NLP Chips:** Quick-action suggested questions are dynamically scraped from the contract and presented as color-coded, interactive tags.
*   **Zero-Retention Privacy:** Uses local Python chunking and temporary system routing. The document never persists remotely.

---

## 🚀 Quick Start Guide

### 1. Simple Run (Recommended)
You can launch the backend automatically using the bootstrap script:
```bash
python run.py
```

### 2. Manual Setup Sequence

**Enter your Virtual Environment:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

**Initialize the Backend API:**
```bash
cd backend
python app.py
```

**Launch the Client:**
Simply open `frontend/index.html` in your favorite web browser (Chrome or Edge recommended).

---

## ⚙️ Configuration

Ensure you create a `.env` file in your root tracking directory containing your language-model provider's key. 

```env
# Primary LLM via ByteZ
BYTEZ_API_KEY=your-bytez-api-key

# Fallback LLM via OpenAI
OPENAI_API_KEY=your-openai-api-key
```
> **Note:** Embeddings are generated locally on your hardware via `SentenceTransformers` to prevent query-cost inflation and preserve strict IP confidentiality.

---

## 🔒 Security & Privacy Architecture

What If Wizard was built with zero-trust principles in mind:
1. **Local Uploading:** PDFs remain temporarily on your local system `uploads/` directory.
2. **Client-Side Chunking:** Text chunks and structural embeddings are synthesized strictly by your CPU/GPU.
3. **Ephemerality:** The query loop simply sends the strict text-snippets to the LLM. Whole documents are explicitly NOT hosted on external servers. 

---
<div align="center">
  <p><i>Make informed agreements, safely. Built by Angelina Chatterjee.</i></p>
</div>
