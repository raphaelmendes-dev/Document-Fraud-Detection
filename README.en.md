[![Status](https://img.shields.io/badge/Status-Live%20in%20Production-brightgreen)](https://fraudeye-frontend.vercel.app/fraud-eye)
[![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fraudeye-backend.onrender.com/docs)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://fraudeye-frontend.vercel.app/fraud-eye)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel&logoColor=white)](https://fraudeye-frontend.vercel.app/fraud-eye)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=white)](https://fraudeye-backend.onrender.com/docs)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<div align="center">
  <img src="https://raw.githubusercontent.com/raphaelmendes-dev/FinAI-Assistente-Financeiro/main/assets/Rs4Machine.png" width="380" />
  <h1>🔍 FraudEye — Rs4Machine</h1>
  <p><strong>Forensic Vision System v3.1</strong></p>
  <p>Real-time fraud detection for Brazilian fiscal documents (NF-e).</p>
  <p>
    <a href="https://fraudeye-frontend.vercel.app/fraud-eye" target="_blank"><strong>🚀 Live App</strong></a> •
    <a href="https://fraudeye-backend.onrender.com/docs" target="_blank"><strong>📡 API Docs</strong></a> •
    <a href="https://github.com/raphaelmendes-dev"><strong>GitHub</strong></a> •
    <a href="mailto:python.dev.raphael@gmail.com">Contact</a>
  </p>
  <p><em>README em <a href="README.md">Português</a></em></p>
</div>

---

## 🎯 Overview

**FraudEye** is a forensic analysis system for Brazilian fiscal documents (NF-e / DANFE). It combines intelligent PDF extraction with deterministic validation rules and a mission-critical interface developed by **Rs4Machine**.

- 🔎 NF-e forensic analysis in seconds
- 🧠 Deterministic rules (no generative AI hallucinations)
- 📊 Real-time visual Risk Score
- 🖥️ Terminal-style interface with evidence panel

---

## 🏗️ Architecture

```
Document-Fraud-Detection/
├── frontend/                  → Next.js 16 (Vercel)
│   └── app/
│       ├── fraud-eye/
│       │   └── page.jsx       → Main orchestrator
│       ├── components/FraudEye/
│       │   ├── RiskMeter.jsx
│       │   ├── DropZone.jsx
│       │   ├── EvidenceCard.jsx
│       │   ├── AuditTerminal.jsx
│       │   ├── MetricPills.jsx
│       │   └── VerdictPanel.jsx
│       ├── hooks/
│       │   └── useFraudAnalysis.js
│       ├── constants/
│       │   └── tokens.js      → Rs4Machine Design DNA
│       └── styles/
│           └── fraudeye.css
└── backend/                   → Python + FastAPI (Render)
    ├── api.py                 → Main endpoints
    ├── requirements.txt
    └── core/
        ├── validators.py      → Anti-fraud rules
        └── scorer.py          → Risk Score calculation
```

---

## ✨ Features

- PDF upload (NF-e / DANFE / Contracts)
- Text extraction with pdfplumber
- Deterministic validations:
  - CNPJ/CPF — official check digit
  - Retroactive or suspicious dates
  - Missing NF-e key (44 digits)
  - Sum inconsistency (items vs total)
- Risk Score 0–100 with animated gauge
- Evidence Panel with severity levels (critical / high / medium / low)
- Real-time Audit Terminal logs
- Automatic forensic report

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React |
| Styling | CSS-in-JS + Rs4Machine Design Tokens |
| Backend | Python 3.12+ + FastAPI + uvicorn |
| Extraction | pdfplumber |
| Validation | re, unicodedata, pandas |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn api:app --reload
```
API available at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at: `http://localhost:3000/fraud-eye`

> ⚠️ Run both terminals simultaneously.

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | API status |
| POST | `/analyze` | PDF document analysis |

---

## 🤝 Contact

**Rs4Machine** — Autonomous Agents Corporation  
CEO: Raphael Mendes  
📧 python.dev.raphael@gmail.com  
🔗 [github.com/raphaelmendes-dev](https://github.com/raphaelmendes-dev)

---

⭐ Star this repo if it helped you!

*Last updated: March 2026*
