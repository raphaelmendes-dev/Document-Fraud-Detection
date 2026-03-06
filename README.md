[![Status](https://img.shields.io/badge/Status-MVP%20Concluído-brightgreen)](https://github.com/raphaelmendes-dev/Document-Fraud-Detection)
[![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Deployed-FF4B4B?logo=streamlit&logoColor=white)](https://antifraude-ai102-raphael.streamlit.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<div align="center">
  <h1>Document-Fraud-Detection</h1>
  <p><strong>Análise Antifraude de Documentos com Regras Determinísticas</strong></p>
  <p>Extração inteligente + detecção de fraudes em NF-e, DANFE e contratos – 100% local e gratuito.</p>

  <p>
    <a href="https://antifraude-ai102-raphael.streamlit.app" target="_blank"><strong>Demo Online</strong></a> •
    <a href="https://github.com/raphaelmendes-dev"><strong>Meu GitHub</strong></a> •
    <a href="mailto:python.dev.raphael@gmail.com">Contato</a>
  </p>

  <p><em>README em <a href="README.en.md">English</a></em></p>
</div>

## 🎯 Visão Geral

Solução antifraude para documentos fiscais e contratos que combina:
- Extração de texto e tabelas estruturadas (pdfplumber + Camelot)
- Regras determinísticas customizadas para detecção de padrões suspeitos
- Relatório colorido com riscos, avisos e validações

Inspirado no Azure AI Document Intelligence, mas implementado localmente (sem dependência de nuvem paga).

## ✨ Funcionalidades

- Upload de PDF ou imagem (PNG/JPG)
- Extração precisa de texto e tabelas (alta acurácia em layouts fiscais brasileiros)
- Regras antifraude:
  - Validação de CNPJ (dígito verificador oficial)
  - Detecção de datas suspeitas (futuras ou antigas)
  - Verificação de soma inconsistente (itens vs total)
  - Alerta para múltiplos CNPJs ou repetições excessivas
- Relatório com alertas coloridos (vermelho = risco alto, amarelo = atenção)
- Interface Streamlit intuitiva + demo online

Fluxo: Upload → Extração estruturada → Validações 100% determinísticas → Output seguro.

🛠️ Stack Técnica

- Backend → Python 3.12+
- UI → Streamlit
- Extração → pdfplumber (texto), Camelot (tabelas fiscais BR)
- Validação → re, pandas, unicodedata
- Imagens → Pillow

🚀 Como Rodar

- Clone o repoBashgit clone https://github.com/raphaelmendes-dev/Document-Fraud-Detection.git
- d Document-Fraud-Detection
- Ambiente virtualBashpython -m venv venv
- venv\Scripts\activate  # Windows
- ou source venv/bin/activate  # Linux/Mac
- DependênciasBashpip install -r requirements.txt
- ExecuteBashstreamlit run app.py

- Acesse: http://localhost:8501
- Demo online: https://antifraude-ai102-raphael.streamlit.app

📊 Resultados & Diferenciais

- Detecção precisa de inconsistências comuns em NF-e/DANFE
- 100% determinístico (sem alucinações de IA generativa)
- Alta precisão em tabelas fiscais brasileiras (Camelot)
- Escalável: pode integrar Azure AI Document Intelligence ou OCR (pytesseract) no futuro

🤝 Contribua ou Freelance

Contribuições bem-vindas! Fork → branch → PR.

Soluções antifraude, extração inteligente de documentos, arquiteturas híbridas (determinístico + IA), Azure AI, Streamlit, FastAPI.
Projetos funcionais entregues.

Contato: raphaelmendes-dev | python.dev.raphael@gmail.com | LinkedIn


⭐ Dê uma estrela se o projeto te ajudou!


Última atualização: Março 2026
