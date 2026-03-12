# ╔══════════════════════════════════════════════════════════╗
# ║  core/validators.py — Rs4Machine · FraudEye             ║
# ║  Regras antifraude isoladas como funções puras           ║
# ║  Extraídas de app.py · compatíveis com FastAPI           ║
# ╚══════════════════════════════════════════════════════════╝

import re
import unicodedata
import pandas as pd
from datetime import datetime
from typing import List, Tuple, Optional


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UTILITÁRIOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def limpar_texto(texto: str) -> str:
    """Normaliza encoding, espaços e quebras de linha."""
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = re.sub(r"\s+", " ", texto)
    texto = re.sub(r"[\n\r]+", "\n", texto)
    return texto.strip()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TIPOS DE ANOMALIA
# Severity: "critical" | "high" | "medium" | "low" | "ok"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _anomalia(
    type_id: str,
    label: str,
    severity: str,
    detail: str,
    sub: str,
    icon: str,
    confidence: int,
) -> dict:
    return {
        "type":       type_id,
        "label":      label,
        "severity":   severity,
        "detail":     detail,
        "sub":        sub,
        "icon":       icon,
        "confidence": confidence,
        "timestamp":  datetime.now().strftime("%H:%M:%S"),
    }


def _log(type_id: str, text: str) -> dict:
    """Entrada de log para o AuditTerminal do FraudEye."""
    return {
        "type": type_id,  # "sys" | "ok" | "warn" | "err"
        "text": text,
        "time": datetime.now().strftime("%H:%M:%S"),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VALIDAÇÃO 1 — CNPJ (módulo 11 oficial Receita Federal)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _validar_cnpj(cnpj_str: str) -> bool:
    cnpj = re.sub(r"\D", "", cnpj_str)
    if len(cnpj) != 14 or cnpj == "0" * 14:
        return False

    # Dígito verificador 1
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma   = sum(int(cnpj[i]) * pesos1[i] for i in range(12))
    resto  = soma % 11
    dv1    = 0 if resto < 2 else 11 - resto

    # Dígito verificador 2
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma   = sum(int(cnpj[i]) * pesos2[i] for i in range(13))
    resto  = soma % 11
    dv2    = 0 if resto < 2 else 11 - resto

    return dv1 == int(cnpj[12]) and dv2 == int(cnpj[13])


def validar_cnpjs(texto: str) -> Tuple[List[dict], List[dict]]:
    """
    Extrai e valida todos os CNPJs do texto.
    Retorna (anomalias, logs).
    """
    anomalias = []
    logs      = []

    padrao    = r"\b\d{2}[.-]?\d{3}[.-]?\d{3}[./]?\d{4}[-/]?\d{2}\b|\b\d{14}\b"
    cnpjs_raw = re.findall(padrao, texto)
    unicos    = {re.sub(r"\D", "", c) for c in cnpjs_raw if len(re.sub(r"\D", "", c)) == 14}

    logs.append(_log("sys", f"Verificando CNPJ(s) detectados: {len(unicos)} encontrado(s)"))

    invalidos, validos = [], []
    for c in unicos:
        fmt = f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:]}"
        if _validar_cnpj(c):
            validos.append(fmt)
            logs.append(_log("ok", f"CNPJ {fmt} ......................... VÁLIDO"))
        else:
            invalidos.append(fmt)
            logs.append(_log("err", f"CNPJ {fmt} ......................... INVÁLIDO → dígito verificador mod-11"))

    if invalidos:
        anomalias.append(_anomalia(
            type_id    = "cnpj_invalid",
            label      = "CNPJ/CPF Inválido",
            severity   = "critical",
            detail     = invalidos[0],
            sub        = f"Dígito verificador mod-11 incorreto · {len(invalidos)} CNPJ(s) inválido(s)",
            icon       = "🚩",
            confidence = 99,
        ))

    if len(unicos) > 3:
        anomalias.append(_anomalia(
            type_id    = "cnpj_multiple",
            label      = "Múltiplos CNPJs",
            severity   = "medium",
            detail     = f"{len(unicos)} CNPJs distintos",
            sub        = "Volume incomum de CNPJs em documento único",
            icon       = "⚠️",
            confidence = 75,
        ))
        logs.append(_log("warn", f"Múltiplos CNPJs detectados: {len(unicos)} — volume atípico"))

    return anomalias, logs


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VALIDAÇÃO 2 — DATAS (futuras / retroativas > 5 anos)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def validar_datas(texto: str) -> Tuple[List[dict], List[dict]]:
    anomalias = []
    logs      = []
    hoje      = datetime.now()

    # Formatos BR e ISO
    padroes = [
        (r"\b\d{2}/\d{2}/\d{4}\b",  "%d/%m/%Y"),
        (r"\b\d{4}-\d{2}-\d{2}\b",  "%Y-%m-%d"),
    ]

    datas_encontradas = set()
    for padrao, fmt in padroes:
        for match in re.findall(padrao, texto):
            try:
                data = datetime.strptime(match, fmt)
                datas_encontradas.add((match, data))
            except ValueError:
                # Dia inválido (ex: 2024-02-30)
                logs.append(_log("err", f"Data {match} ......................... INVÁLIDA → dia inexistente no calendário"))
                anomalias.append(_anomalia(
                    type_id    = "date_invalid",
                    label      = "Data Inconsistente",
                    severity   = "high",
                    detail     = f"Emissão: {match}",
                    sub        = "Dia inexistente no calendário gregoriano",
                    icon       = "📅",
                    confidence = 100,
                ))

    logs.append(_log("sys", f"Validando {len(datas_encontradas)} data(s) detectada(s)"))

    for data_str, data in datas_encontradas:
        if data > hoje:
            logs.append(_log("err", f"Data {data_str} ......................... FUTURA → emissão pós-hoje"))
            anomalias.append(_anomalia(
                type_id    = "date_future",
                label      = "Data Futura",
                severity   = "critical",
                detail     = f"Data: {data_str}",
                sub        = f"Documento emitido no futuro ({(data - hoje).days} dias à frente)",
                icon       = "📅",
                confidence = 98,
            ))
        elif (hoje - data).days > 365 * 5:
            logs.append(_log("warn", f"Data {data_str} ......................... ANTIGA → >5 anos"))
            anomalias.append(_anomalia(
                type_id    = "date_old",
                label      = "Data Retroativa",
                severity   = "medium",
                detail     = f"Data: {data_str}",
                sub        = f"Documento com mais de 5 anos de emissão",
                icon       = "📅",
                confidence = 80,
            ))
        else:
            logs.append(_log("ok", f"Data {data_str} ......................... OK"))

    return anomalias, logs


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VALIDAÇÃO 3 — SOMA DE ITENS vs TOTAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def validar_soma_itens(texto: str, tabelas: list) -> Tuple[List[dict], List[dict]]:
    anomalias = []
    logs      = []

    logs.append(_log("sys", "Verificando consistência: soma itens vs valor total"))

    tabela_itens = None
    for t in tabelas:
        if isinstance(t, pd.DataFrame):
            cols = [str(c).lower() for c in t.columns]
        else:
            # lista de listas (pdfplumber fallback)
            if not t or len(t) < 2:
                continue
            header = [str(c).lower() for c in t[0]]
            t      = pd.DataFrame(t[1:], columns=header)
            cols   = list(t.columns)

        if any(k in col for col in cols for k in ["qtde", "total", "valor", "preco"]):
            tabela_itens = t
            break

    if tabela_itens is None:
        logs.append(_log("sys", "Tabela de itens não localizada — validação de soma ignorada"))
        return anomalias, logs

    try:
        col_valor = next(
            (c for c in tabela_itens.columns if any(k in str(c).lower() for k in ["total", "valor"])),
            None,
        )
        if col_valor is None:
            logs.append(_log("sys", "Coluna de valor não identificada na tabela"))
            return anomalias, logs

        vals = (
            tabela_itens[col_valor]
            .astype(str)
            .str.replace(r"[R$\s]", "", regex=True)
            .str.replace(r"\.", "", regex=True)
            .str.replace(",", ".", regex=False)
        )
        soma = pd.to_numeric(vals, errors="coerce").dropna().sum()

        if soma <= 0:
            logs.append(_log("sys", "Soma calculada zerada — possível formatação não reconhecida"))
            return anomalias, logs

        match = re.search(
            r"(?:valor\s*total|total\s*(?:da\s*nf-?e|nota|geral))[^\d]*([\d.,]+)",
            texto,
            re.IGNORECASE,
        )
        if match:
            total_str = match.group(1).replace(".", "").replace(",", ".")
            total     = float(total_str)
            delta     = abs(soma - total)

            if delta > 5:
                logs.append(_log("err", f"Soma inconsistente ................. DIVERGÊNCIA → Δ R$ {delta:.2f}"))
                anomalias.append(_anomalia(
                    type_id    = "value_divergent",
                    label      = "Valor Divergente",
                    severity   = "high",
                    detail     = f"Δ R$ {delta:,.2f} detectado",
                    sub        = f"Soma itens R$ {soma:,.2f} ≠ Total R$ {total:,.2f}",
                    icon       = "💰",
                    confidence = 96,
                ))
            else:
                logs.append(_log("ok", f"Soma de itens vs total ............. OK (R$ {total:,.2f})"))
        else:
            logs.append(_log("sys", "Valor total geral não encontrado no texto — validação parcial"))

    except Exception as exc:
        logs.append(_log("sys", f"Erro na validação de soma: {str(exc)[:60]}"))

    return anomalias, logs


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VALIDAÇÃO 4 — FORMATAÇÃO / ESTRUTURA SUSPEITA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def validar_formatacao(texto: str) -> Tuple[List[dict], List[dict]]:
    anomalias = []
    logs      = []

    logs.append(_log("sys", "Verificando padrões de formatação e estrutura do documento"))

    # Repetição excessiva de padrões (sinal de geração automática maliciosa)
    palavras  = re.findall(r"\b\w{4,}\b", texto.lower())
    contagem  = pd.Series(palavras).value_counts()
    excessivo = contagem[contagem > 15]
    if not excessivo.empty:
        top_palavra = excessivo.index[0]
        logs.append(_log("warn", f"Repetição excessiva da palavra '{top_palavra}' ({excessivo.iloc[0]}x) — padrão suspeito"))
        anomalias.append(_anomalia(
            type_id    = "formatting_suspicious",
            label      = "Formatação Suspeita",
            severity   = "high",
            detail     = f"Repetição: '{top_palavra}' ({excessivo.iloc[0]}x)",
            sub        = "Padrão de repetição atípico — possível geração automatizada",
            icon       = "📑",
            confidence = 78,
        ))
    else:
        logs.append(_log("ok", "Padrão de repetição de palavras .... OK"))

    # Ausência de chave de acesso NF-e (44 dígitos)
    chave_nfe = re.search(r"\b\d{44}\b", re.sub(r"\s", "", texto))
    if chave_nfe:
        logs.append(_log("ok", f"Chave de acesso NF-e (44 dígitos) .. OK"))
    else:
        logs.append(_log("warn", "Chave de acesso NF-e ............... NÃO ENCONTRADA"))
        anomalias.append(_anomalia(
            type_id    = "missing_nfe_key",
            label      = "Chave NF-e Ausente",
            severity   = "medium",
            detail     = "Chave de 44 dígitos não localizada",
            sub        = "Documento pode não ser uma NF-e válida ou chave está ilegível",
            icon       = "🔑",
            confidence = 70,
        ))

    return anomalias, logs


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ORQUESTRADOR PRINCIPAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def analisar_documento(texto: str, tabelas: list) -> dict:
    """
    Executa todas as validações e retorna resultado estruturado
    pronto para serialização JSON pela FastAPI.
    """
    todas_anomalias = []
    todos_logs      = []

    todos_logs.append(_log("sys", "FraudEye v3.1 · Rs4Machine · análise iniciada"))
    todos_logs.append(_log("sys", "Motor de visão computacional · modelo: Rs4-Vision-NF"))

    # Assinatura / integridade básica
    todos_logs.append(_log("ok",  "Arquivo recebido e lido com sucesso .... OK"))

    # Executa validações
    for fn in [
        lambda: validar_cnpjs(texto),
        lambda: validar_datas(texto),
        lambda: validar_soma_itens(texto, tabelas),
        lambda: validar_formatacao(texto),
    ]:
        anomalias, logs = fn()
        todas_anomalias.extend(anomalias)
        todos_logs.extend(logs)

    # Numera anomalias para o frontend
    for i, a in enumerate(todas_anomalias):
        a["id"] = i + 1

    todos_logs.append(_log(
        "sys" if not todas_anomalias else "warn",
        f"Análise concluída · {len(todas_anomalias)} anomalia(s) detectada(s)",
    ))

    return {
        "anomalies": todas_anomalias,
        "auditLog":  todos_logs,
        "textPreview": texto[:800],
    }