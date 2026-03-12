# ╔══════════════════════════════════════════════════════════╗
# ║  api.py — Rs4Machine · FraudEye                         ║
# ║  FastAPI — Bridge entre backend Python e FraudEye React ║
# ║  Roda em paralelo ao Streamlit (app.py intacto)         ║
# ║                                                          ║
# ║  Iniciar:  uvicorn api:app --reload --port 8000          ║
# ╚══════════════════════════════════════════════════════════╝

import io
import pdfplumber
import camelot
import pandas as pd

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core.validators import analisar_documento, limpar_texto
from core.scorer import calcular_risk_score, classificar_risco

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# APP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app = FastAPI(
    title       = "FraudEye API — Rs4Machine",
    description = "Backend forense para detecção de fraudes em NF-e, DANFE e contratos.",
    version     = "3.1.0",
)

# CORS — permite o React (localhost:3000 / qualquer origem em dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],        # em produção, troque por domínio específico
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXTRAÇÃO (espelha o app.py original)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _extrair_de_pdf(arquivo_bytes: bytes) -> tuple[str, list]:
    buf = io.BytesIO(arquivo_bytes)

    # Texto via pdfplumber
    with pdfplumber.open(buf) as pdf:
        texto = ""
        for p in pdf.pages:
            texto += (p.extract_text() or "") + "\n\n"

    # Tabelas via Camelot (com fallback para pdfplumber)
    tabelas = []
    try:
        buf.seek(0)
        tables = camelot.read_pdf(buf, pages="all", flavor="stream", suppress_stdout=True)
        tabelas = [t.df for t in tables if not t.df.empty]
    except Exception:
        buf.seek(0)
        with pdfplumber.open(buf) as pdf:
            for p in pdf.pages:
                t = p.extract_tables()
                if t:
                    for tbl in t:
                        if tbl and len(tbl) > 1:
                            df = pd.DataFrame(tbl[1:], columns=tbl[0])
                            tabelas.append(df)

    return limpar_texto(texto), tabelas


def _extrair_de_imagem(_arquivo_bytes: bytes) -> tuple[str, list]:
    # Stub — extensível com pytesseract ou Azure OCR
    return "Extração de imagem: OCR não configurado nesta versão.", []


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/health")
def health():
    """Verifica se a API está no ar. Útil para o FraudEye mostrar status de conexão."""
    return {"status": "ok", "service": "FraudEye API", "version": "3.1.0"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Recebe um PDF ou imagem, extrai texto/tabelas e executa
    todas as validações antifraude.

    Retorna JSON estruturado consumido diretamente pelo FraudEye.jsx:
    {
        "riskScore":   int (0-100),
        "riskLabel":   str,
        "riskColor":   str,
        "recommendation": str,
        "anomalies":   [...],   → EvidencePanel
        "auditLog":    [...],   → AuditTerminal
        "textPreview": str,     → prévia do texto extraído
        "fileName":    str,
        "anomalyCount":int,
    }
    """
    # Valida tipo de arquivo
    allowed = {"application/pdf", "image/png", "image/jpeg", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code = 422,
            detail      = f"Tipo não suportado: {file.content_type}. Use PDF, PNG ou JPG.",
        )

    raw_bytes = await file.read()

    # Extração
    if file.content_type == "application/pdf":
        texto, tabelas = _extrair_de_pdf(raw_bytes)
    else:
        texto, tabelas = _extrair_de_imagem(raw_bytes)

    # Análise
    resultado = analisar_documento(texto, tabelas)

    # Score
    score      = calcular_risk_score(resultado["anomalies"])
    classif    = classificar_risco(score)

    return {
        "riskScore":      score,
        "riskLabel":      classif["label"],
        "riskColor":      classif["color"],
        "recommendation": classif["recommendation"],
        "anomalies":      resultado["anomalies"],
        "auditLog":       resultado["auditLog"],
        "textPreview":    resultado["textPreview"],
        "fileName":       file.filename,
        "anomalyCount":   len(resultado["anomalies"]),
    }