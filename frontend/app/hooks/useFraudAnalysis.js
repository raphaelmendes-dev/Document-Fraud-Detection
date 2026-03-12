// ╔══════════════════════════════════════════════════╗
// ║  hooks/useFraudAnalysis.js                       ║
// ║  Toda a lógica de estado e fetch da API          ║
// ╚══════════════════════════════════════════════════╝

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../constants/tokens";

const now = () => new Date().toLocaleTimeString("pt-BR");

export function useFraudAnalysis() {
  const [phase,          setPhase]          = useState("idle");
  const [uploadedFile,   setUploadedFile]   = useState(null);
  const [fileName,       setFileName]       = useState(null);

  // Resultados da API
  const [riskScore,      setRiskScore]      = useState(0);
  const [riskLabel,      setRiskLabel]      = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [evidence,       setEvidence]       = useState([]);
  const [auditLogs,      setAuditLogs]      = useState([]);
  const [visibleEvidence,setVisibleEvidence]= useState([]);
  const [riskActive,     setRiskActive]     = useState(false);
  const [errorMsg,       setErrorMsg]       = useState(null);
  const [apiOnline,      setApiOnline]      = useState(null);

  // Verifica health da API no mount
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false));
  }, []);

  const handleFileSelect = useCallback((file) => {
    setUploadedFile(file);
    setFileName(file.name);
    setPhase("ready");
    setEvidence([]);
    setAuditLogs([]);
    setVisibleEvidence([]);
    setRiskActive(false);
    setErrorMsg(null);
    setRiskScore(0);
  }, []);

  const handleStart = useCallback(async () => {
    if (!uploadedFile || phase === "scanning" || phase === "analyzing") return;

    setPhase("scanning");
    setEvidence([]);
    setAuditLogs([]);
    setVisibleEvidence([]);
    setRiskActive(false);
    setErrorMsg(null);

    setAuditLogs([
      { type: "sys", text: "FraudEye v3.1 · Rs4Machine · perícia iniciada", time: now() },
      { type: "sys", text: `Arquivo recebido: ${uploadedFile.name}`,         time: now() },
      { type: "sys", text: "Enviando para motor de análise...",               time: now() },
    ]);

    try {
      setPhase("analyzing");

      const formData = new FormData();
      formData.append("file", uploadedFile);

      const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setAuditLogs(data.auditLog || []);
      setRiskScore(data.riskScore ?? 0);
      setRiskLabel(data.riskLabel ?? "");
      setRecommendation(data.recommendation ?? "");

      const items = data.anomalies || [];
      setEvidence(items);
      setTimeout(() => setRiskActive(true), 300);
      items.forEach((_, i) => {
        setTimeout(() => setVisibleEvidence(prev => [...prev, i]), 500 + i * 300);
      });

      setPhase("done");

    } catch (err) {
      setErrorMsg(err.message);
      setAuditLogs(prev => [
        ...prev,
        { type: "err", text: `Erro na análise: ${err.message}`, time: now() },
      ]);
      setPhase("ready");
    }
  }, [uploadedFile, phase]);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setUploadedFile(null);
    setFileName(null);
    setEvidence([]);
    setAuditLogs([]);
    setVisibleEvidence([]);
    setRiskActive(false);
    setErrorMsg(null);
    setRiskScore(0);
  }, []);

  return {
    // estado
    phase, fileName, uploadedFile,
    riskScore, riskLabel, recommendation,
    evidence, auditLogs, visibleEvidence,
    riskActive, errorMsg, apiOnline,
    anomalyCount: visibleEvidence.length,
    isRunning: phase === "scanning" || phase === "analyzing",
    // ações
    handleFileSelect, handleStart, handleReset,
  };
}