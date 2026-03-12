import streamlit as st
import pdfplumber
import camelot
from PIL import Image
import io
import re
import pandas as pd
from datetime import datetime
import unicodedata

def limpar_texto(texto):
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('ascii')
    texto = re.sub(r'\s+', ' ', texto)
    texto = re.sub(r'[\n\r]+', '\n', texto)
    return texto.strip()

def validar_cnpj(cnpj_str):
    cnpj = re.sub(r'\D', '', cnpj_str)
    if len(cnpj) != 14 or cnpj == '0' * 14:
        return False
    soma = sum(int(cnpj[i]) * (5 - i % 4 if i < 4 else 13 - i % 4) for i in range(12))
    resto = soma % 11
    dv1 = 0 if resto < 2 else 11 - resto
    soma = sum(int(cnpj[i]) * (6 - i % 5 if i < 5 else 14 - i % 5) for i in range(13))
    resto = soma % 11
    dv2 = 0 if resto < 2 else 11 - resto
    return dv1 == int(cnpj[12]) and dv2 == int(cnpj[13])

def extrair_de_pdf(arquivo_bytes):
    with pdfplumber.open(arquivo_bytes) as pdf:
        texto = ""
        for p in pdf.pages:
            texto += (p.extract_text() or "") + "\n\n"

    try:
        tables = camelot.read_pdf(arquivo_bytes, pages='all', flavor='stream', suppress_stdout=True)
        tabelas = [t.df for t in tables if not t.df.empty]
    except:
        tabelas = []
        with pdfplumber.open(arquivo_bytes) as pdf:
            for p in pdf.pages:
                tabelas.extend(p.extract_tables())

    return limpar_texto(texto), tabelas

def extrair_de_imagem(arquivo_bytes):
    return "Extração limitada para imagens."

def analisar_fraude(texto, tabelas):
    riscos = []
    avisos = []
    sucessos = []

    hoje = datetime.now()

    datas = set(re.findall(r'\b\d{2}/\d{2}/\d{4}\b', texto))
    for data_str in datas:
        try:
            data = datetime.strptime(data_str, "%d/%m/%Y")
            if data > hoje:
                riscos.append(f"**RISCO ALTO** - Data futura: {data_str}")
            elif (hoje - data).days > 365 * 5:
                avisos.append(f"Atenção - Data antiga (>5 anos): {data_str}")
        except:
            pass

    cnpjs_raw = re.findall(r'\b\d{2}[.-]?\d{3}[.-]?\d{3}[./]?\d{4}[-/]?\d{2}\b|\b\d{14}\b', texto)
    cnpjs_unicos = set()
    for raw in cnpjs_raw:
        limpo = re.sub(r'\D', '', raw)
        if len(limpo) == 14:
            cnpjs_unicos.add(limpo)

    invalidos = []
    validos = []
    for c in cnpjs_unicos:
        if validar_cnpj(c):
            formatado = f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:]}"
            validos.append(formatado)
        else:
            formatado = f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:]}"
            invalidos.append(formatado)

    if invalidos:
        riscos.append(f"**ATENÇÃO / POSSÍVEL RISCO** - CNPJ(s) inválido(s) ou mal extraído: {', '.join(invalidos[:3])}")
        avisos.append("Nota: Em PDFs de exemplo/teste, CNPJs podem ser fictícios ou inválidos intencionalmente.")
    if len(cnpjs_unicos) > 3:
        avisos.append(f"Múltiplos CNPJs diferentes ({len(cnpjs_unicos)})")
    if validos:
        sucessos.append(f"CNPJ(s) válido(s): {', '.join(validos[:3])}")

    tabela_itens = None
    for t in tabelas:
        cols = [str(c).lower() for c in t.columns]
        if any(k in col for col in cols for k in ['qtde', 'total', 'valor']):
            tabela_itens = t
            break

    if tabela_itens is not None:
        try:
            col_valor = next((c for c in tabela_itens.columns if any(k in str(c).lower() for k in ['total', 'valor'])), None)
            if col_valor:
                vals = tabela_itens[col_valor].astype(str).str.replace(r'[R$\s,.]', '', regex=True).str.replace(',', '.')
                soma = pd.to_numeric(vals, errors='coerce').sum()
                if soma > 0:
                    match = re.search(r'(?:total\s*(da\s*(nf-e|nota))|valor\s*total).*?([\d.,]+)', texto.lower(), re.I | re.S)
                    if match:
                        total = float(match.group(1).replace('.', '').replace(',', '.'))
                        if abs(soma - total) > 5:
                            riscos.append(f"**RISCO** - Soma inconsistente: itens R$ {soma:.2f} vs total R$ {total:.2f}")
                        else:
                            sucessos.append(f"Soma consistente (R$ {total:.2f})")
        except:
            pass

    if riscos:
        return riscos + avisos + sucessos
    elif avisos:
        return avisos + sucessos
    else:
        return sucessos + ["Nenhum risco detectado nas regras atuais."]

st.set_page_config(page_title="Análise Antifraude", layout="wide")
st.title("🔍 Análise Automatizada de Documentos Antifraude")
st.markdown("**Projeto Final - Bootcamp AI-102 Microsoft Azure**  \nRaphael | DIO + Microsoft")

uploaded_file = st.file_uploader("PDF ou imagem", type=["pdf", "png", "jpg", "jpeg"])

if uploaded_file:
    texto, tabelas = "", []
    with st.spinner("Extraindo..."):
        if "pdf" in uploaded_file.type:
            texto, tabelas = extrair_de_pdf(io.BytesIO(uploaded_file.getvalue()))
        else:
            texto = extrair_de_imagem(io.BytesIO(uploaded_file.getvalue()))

    st.subheader("Texto Extraído")
    st.text_area("", texto, height=160)

    if tabelas:
        tabela_itens = next((t for t in tabelas if any(k in ' '.join(map(str, t.columns)).lower() for k in ['qtde','total','valor'])), tabelas[0] if tabelas else None)
        if tabela_itens is not None:
            st.subheader("Tabela Principal")
            st.dataframe(tabela_itens)
        else:
            st.info("Sem tabela clara de itens (normal em alguns documentos).")

    if st.button("Analisar Padrões de Fraude", type="primary"):
        with st.spinner("Analisando..."):
            resultados = analisar_fraude(texto, tabelas)
            st.subheader("Relatório Antifraude")
            for r in resultados:
                if "**RISCO" in r or "ATENÇÃO" in r:
                    st.warning(r)  # mudei para warning em vez de error para suavizar
                else:
                    st.success(r)

            st.info("Simulação simples. Azure real usaria modelos treinados.")

st.divider()
st.info("Extração: pdfplumber + Camelot | Gratuito e local")
st.caption("Sem Azure por restrições Free Tier.")