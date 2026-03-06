[![Status](https://img.shields.io/badge/Status-MVP%20Completed-brightgreen)](https://github.com/raphaelmendes-dev/Document-Fraud-Detection)
[![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Deployed-FF4B4B?logo=streamlit&logoColor=white)](https://antifraude-ai102-raphael.streamlit.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<div align="center">
  <h1>Document Fraud Detection</h1>
  <p><strong>Document Anti-Fraud Analysis with Deterministic Rules</strong></p>
  <p>Intelligent extraction + fraud pattern detection in invoices, contracts – fully local & free.</p>

  <p>
    <a href="https://antifraude-ai102-raphael.streamlit.app" target="_blank"><strong>Live Demo</strong></a> •
    <a href="https://github.com/raphaelmendes-dev"><strong>My GitHub</strong></a> •
    <a href="mailto:python.dev.raphael@gmail.com">Contact</a>
  </p>

  <p><em>README in <a href="README.md">Português</a></em></p>
</div>

## 🎯 Overview

Anti-fraud solution for fiscal documents and contracts combining:
- Structured text & table extraction (pdfplumber + Camelot)
- Custom deterministic rules for suspicious pattern detection
- Color-coded risk report

Azure AI Document Intelligence inspired, but 100% local implementation (no paid cloud).

## ✨ Features

- Upload PDF or image (PNG/JPG)
- Accurate text and table extraction (optimized for Brazilian fiscal layouts)
- Fraud detection rules:
  - CNPJ validation (official check digit)
  - Suspicious dates (future or very old)
  - Item sum vs total inconsistency
  - Multiple CNPJs or excessive repetition alerts
- Color-coded report (red = high risk, yellow = attention)
- Intuitive Streamlit interface + live demo

Flow: Upload → Structured extraction → Deterministic validations → Secure output.

🛠️ Tech Stack

- Backend → Python 3.12+
- UI → Streamlit
- Extraction → pdfplumber (text), Camelot (tables)
- Validation → re, pandas, unicodedata
- Images → Pillow

🚀 Quick Start

- CloneBashgit clone https://github.com/raphaelmendes-dev/Document-Fraud-Detection.git
- cd Document-Fraud-Detection
- Virtual envBashpython -m venv venv
- venv\Scripts\activate  # Windows
- or source venv/bin/activate # Linux
- InstallBashpip install -r requirements.txt
- RunBashstreamlit run app.py

- Access: http://localhost:8501

- Live Demo: https://antifraude-ai102-raphael.streamlit.app


📊 Results & Differentiators

- Accurate detection of common NF-e/DANFE inconsistencies
- 100% deterministic logic (no generative AI hallucinations)
- High precision on Brazilian fiscal tables (Camelot)
- Ready for scaling: Azure AI integration or OCR (pytesseract) possible

🤝 Contribute
Contributions welcome! Fork → branch → PR.

Anti-fraud systems, document intelligence, hybrid architectures, Azure AI, Streamlit, FastAPI.
Delivered functional projects.

Contact: raphaelmendes-dev | python.dev.raphael@gmail.com | LinkedIn


⭐ Star if you like it!
