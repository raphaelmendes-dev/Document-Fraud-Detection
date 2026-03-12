# ╔══════════════════════════════════════════════════════════╗
# ║  core/scorer.py — Rs4Machine · FraudEye                 ║
# ║  Calcula Risk Score 0-100 baseado nas anomalias          ║
# ╚══════════════════════════════════════════════════════════╝

from typing import List

# Peso por severidade
SEVERITY_WEIGHTS = {
    "critical": 35,
    "high":     22,
    "medium":   12,
    "low":       5,
}

# Penalidade adicional por tipo específico de anomalia
TYPE_BONUS = {
    "cnpj_invalid":          10,
    "date_future":           15,
    "date_invalid":          12,
    "value_divergent":        8,
    "formatting_suspicious":  6,
    "cnpj_multiple":          4,
    "missing_nfe_key":        3,
}


def calcular_risk_score(anomalies: List[dict]) -> int:
    """
    Retorna score de risco de 0 a 100.

    Lógica:
    - Soma pesos por severidade de cada anomalia
    - Adiciona bônus por tipo específico
    - Cap em 100
    - Score 0 = sem anomalias detectadas
    """
    if not anomalies:
        return 0

    score = 0
    for a in anomalies:
        score += SEVERITY_WEIGHTS.get(a.get("severity", "low"), 5)
        score += TYPE_BONUS.get(a.get("type", ""), 0)

    return min(score, 100)


def classificar_risco(score: int) -> dict:
    """
    Retorna label, cor e recomendação baseados no score.
    Mapeado diretamente para o RiskMeter do FraudEye.
    """
    if score == 0:
        return {
            "label":          "SEM RISCO",
            "color":          "green",
            "recommendation": "Documento dentro dos padrões esperados.",
        }
    elif score < 30:
        return {
            "label":          "RISCO BAIXO",
            "color":          "green",
            "recommendation": "Pontos de atenção menores. Revisão manual recomendada.",
        }
    elif score < 60:
        return {
            "label":          "RISCO MÉDIO",
            "color":          "yellow",
            "recommendation": "Inconsistências detectadas. Encaminhe para auditoria.",
        }
    elif score < 80:
        return {
            "label":          "RISCO ALTO",
            "color":          "red",
            "recommendation": "Múltiplas anomalias críticas. Suspenda o documento.",
        }
    else:
        return {
            "label":          "RISCO CRÍTICO",
            "color":          "red",
            "recommendation": "Forte indício de fraude. Acione equipe jurídica/fiscal.",
        }