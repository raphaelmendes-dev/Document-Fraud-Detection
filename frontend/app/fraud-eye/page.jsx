"use client";
// ╔══════════════════════════════════════════════════════╗
// ║  app/fraud-eye/page.jsx — FraudEye · Rs4Machine     ║
// ║  Arquivo principal — só orquestra os componentes    ║
// ╚══════════════════════════════════════════════════════╝

import "../styles/fraudeye.css";
import { useFraudAnalysis }  from "../hooks/useFraudAnalysis";
import RiskMeter             from "../components/FraudEye/RiskMeter";
import DropZone              from "../components/FraudEye/DropZone";
import EvidenceCard          from "../components/FraudEye/EvidenceCard";
import AuditTerminal         from "../components/FraudEye/AuditTerminal";
import MetricPills           from "../components/FraudEye/MetricPills";
import VerdictPanel          from "../components/FraudEye/VerdictPanel";
import { T, API_URL }        from "../constants/tokens";

export default function FraudEyePage() {
  const {
    phase, fileName,
    riskScore, riskLabel, recommendation,
    evidence, auditLogs, visibleEvidence,
    riskActive, errorMsg, apiOnline,
    anomalyCount, isRunning,
    handleFileSelect, handleStart, handleReset,
  } = useFraudAnalysis();

  return (
    <div style={{ height:"100vh", minHeight:"600px", background:`linear-gradient(155deg, #040608 0%, ${T.bgDeep} 40%, #060a0d 100%)`, fontFamily:"'JetBrains Mono', monospace", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* ── HEADER ── */}
      <header style={{ display:"flex", alignItems:"center", gap:"14px", padding:"0 20px", height:"56px", borderBottom:`1px solid ${T.border}`, background:`${T.surface}ee`, backdropFilter:"blur(16px)", flexShrink:0, animation:"stagger-in 0.5s ease-out both" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"6px", background:`linear-gradient(135deg, ${T.red}22, ${T.red}0a)`, border:`1px solid ${T.red}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", boxShadow:`0 0 12px ${T.red}33` }}>👁</div>
          <div>
            <div style={{ fontSize:"15px", fontWeight:"700", letterSpacing:"0.1em", background:`linear-gradient(90deg, ${T.red}, #ff8a6a, ${T.red})`, backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer-logo 4s linear infinite" }}>FRAUDEYE</div>
            <div style={{ fontSize:"7px", letterSpacing:"0.22em", color:T.dim }}>Rs4Machine · Forensic Vision System v3.1</div>
          </div>
        </div>

        {/* Badges de info */}
        <div style={{ display:"flex", gap:"6px", marginLeft:"8px" }}>
          {[
            { l:"ENGINE", v:"Rs4-Vision", c:T.cyan   },
            { l:"MODEL",  v:"NF-Forense", c:T.purple },
            { l:"STATUS", v: isRunning ? "ANALISANDO" : phase === "done" ? "CONCLUÍDO" : "AGUARDANDO", c: isRunning ? T.yellow : phase === "done" ? T.green : T.muted },
          ].map(({ l,v,c }) => (
            <div key={l} style={{ display:"flex", gap:"5px", padding:"3px 8px", background:`${c}0d`, border:`1px solid ${c}2a`, borderRadius:"3px", fontSize:"8px", letterSpacing:"0.08em" }}>
              <span style={{ color:T.dim }}>{l}</span>
              <span style={{ color:c, fontWeight:"600" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* API status */}
        <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"3px 10px", background: apiOnline === null ? `${T.muted}10` : apiOnline ? `${T.green}10` : `${T.red}10`, border:`1px solid ${apiOnline === null ? T.border : apiOnline ? T.green+"44" : T.red+"44"}`, borderRadius:"3px" }}>
          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background: apiOnline === null ? T.muted : apiOnline ? T.green : T.red, animation:"dot-blink 1.5s infinite" }} />
          <span style={{ fontFamily:"monospace", fontSize:"8px", color: apiOnline === null ? T.muted : apiOnline ? T.green : T.red, letterSpacing:"0.1em" }}>
            API {apiOnline === null ? "..." : apiOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>

        {/* Anomaly counter */}
        {anomalyCount > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"4px 12px", background:`${T.red}15`, border:`1px solid ${T.red}44`, borderRadius:"4px", animation:"risk-pulse 2s ease-in-out infinite" }}>
            <span style={{ fontSize:"8px", color:T.muted, letterSpacing:"0.1em" }}>ANOMALIAS</span>
            <span style={{ fontSize:"18px", fontWeight:"700", color:T.red, textShadow:`0 0 12px ${T.red}`, lineHeight:1 }}>{anomalyCount}</span>
          </div>
        )}

        {/* Reset button */}
        <div style={{ marginLeft:"auto", display:"flex", gap:"8px", alignItems:"center" }}>
          {phase === "done" && (
            <button onClick={handleReset}
              style={{ padding:"5px 14px", background:"transparent", border:`1px solid ${T.border}`, borderRadius:"4px", color:T.muted, fontSize:"9px", letterSpacing:"0.12em", cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.cyan; e.currentTarget.style.color=T.cyan; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted; }}
            >↺ NOVA ANÁLISE</button>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background: isRunning ? T.yellow : phase === "done" ? T.green : T.muted, animation:"dot-blink 1.5s infinite", boxShadow:`0 0 6px currentColor` }} />
            <span style={{ fontSize:"9px", color:T.muted, letterSpacing:"0.1em" }}>
              {isRunning ? "EM ANÁLISE" : phase === "done" ? "LAUDO GERADO" : "STANDBY"}
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* ── COLUNA ESQUERDA ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"16px 12px 16px 20px", gap:"12px", overflow:"hidden", minHeight:0, animation:"stagger-in 0.5s ease-out 0.1s both" }}>

          <MetricPills phase={phase} evidence={evidence} />

          <div style={{ flex:1, minHeight:0 }}>
            <DropZone phase={phase} onFileSelect={handleFileSelect} fileName={fileName} />
          </div>

          {/* Mensagem de erro */}
          {errorMsg && (
            <div style={{ padding:"10px 14px", background:`${T.red}10`, border:`1px solid ${T.red}44`, borderRadius:"6px", fontFamily:"monospace", fontSize:"10px", color:T.red, letterSpacing:"0.06em" }}>
              ✖ {errorMsg}
              {!apiOnline && " · Verifique se a API está rodando: uvicorn api:app --reload"}
            </div>
          )}

          {/* Botão INICIAR PERÍCIA */}
          <button
            onClick={handleStart}
            disabled={!fileName || isRunning || !apiOnline}
            style={{
              padding:"13px 24px", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
              background: (!fileName || isRunning || !apiOnline) ? "transparent" : `linear-gradient(135deg, ${T.red}22, ${T.red}0a)`,
              border:`1px solid ${(!fileName || isRunning || !apiOnline) ? T.border : T.red}`,
              borderRadius:"6px",
              color:(!fileName || isRunning || !apiOnline) ? T.dim : T.red,
              fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", fontWeight:"700",
              letterSpacing:"0.18em", textTransform:"uppercase",
              cursor:(!fileName || isRunning || !apiOnline) ? "not-allowed" : "pointer",
              boxShadow:(!fileName || isRunning || !apiOnline) ? "none" : `0 0 20px ${T.red}33`,
              transition:"all 0.3s ease",
              opacity:(!fileName || isRunning || !apiOnline) ? 0.4 : 1,
              animation: fileName && !isRunning && phase !== "done" && apiOnline ? "btn-glow 2.5s ease-in-out infinite" : "none",
            }}
          >
            {isRunning  ? <><span style={{ display:"inline-block", animation:"spin 1s linear infinite", fontSize:"12px" }}>◌</span>PERÍCIA EM ANDAMENTO...</>
            : phase === "done" ? <>✓  LAUDO GERADO — REPETIR PERÍCIA</>
            : <>👁  INICIAR PERÍCIA</>}
          </button>

          <AuditTerminal logs={auditLogs} />
        </div>

        {/* Divider */}
        <div style={{ width:"1px", background:`linear-gradient(to bottom, transparent, ${T.border}, transparent)`, flexShrink:0, margin:"20px 0" }} />

        {/* ── COLUNA DIREITA ── */}
        <div style={{ width:"300px", flexShrink:0, display:"flex", flexDirection:"column", padding:"16px 20px 16px 12px", gap:"12px", overflow:"hidden", animation:"stagger-in 0.5s ease-out 0.2s both" }}>

          {/* Risk Meter */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"16px", display:"flex", justifyContent:"center", flexShrink:0, boxShadow:riskActive && evidence.length > 0 ? `0 0 20px ${T.red}18` : "none", transition:"box-shadow 0.5s" }}>
            <RiskMeter score={riskScore} label={riskLabel} active={riskActive} />
          </div>

          {/* Evidence header */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0, paddingLeft:"2px" }}>
            <div style={{ width:"4px", height:"16px", background:T.red, borderRadius:"2px", boxShadow:`0 0 8px ${T.red}` }} />
            <span style={{ fontFamily:"monospace", fontSize:"9px", letterSpacing:"0.18em", color:T.muted, textTransform:"uppercase" }}>Painel de Evidências</span>
            {evidence.length > 0 && (
              <span style={{ marginLeft:"auto", padding:"1px 8px", background:`${T.red}18`, border:`1px solid ${T.red}33`, borderRadius:"2px", fontFamily:"monospace", fontSize:"8px", color:T.red, letterSpacing:"0.1em" }}>
                {anomalyCount} / {evidence.length}
              </span>
            )}
          </div>

          {/* Evidence list */}
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"8px", scrollbarWidth:"thin", scrollbarColor:`${T.border} transparent` }}>
            {evidence.map((item, i) => (
              <EvidenceCard key={item.id || i} item={item} visible={visibleEvidence.includes(i)} index={i} />
            ))}
            {evidence.length === 0 && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px", opacity:0.25 }}>
                <div style={{ fontSize:"28px" }}>🔍</div>
                <div style={{ fontFamily:"monospace", fontSize:"9px", color:T.muted, letterSpacing:"0.15em", textAlign:"center" }}>AGUARDANDO<br/>ANÁLISE</div>
              </div>
            )}
          </div>

          {/* Verdict */}
          {phase === "done" && (
            <VerdictPanel evidence={evidence} recommendation={recommendation} />
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"16px", padding:"6px 20px", height:"30px", borderTop:`1px solid ${T.border}`, background:T.surface, flexShrink:0 }}>
        {["Rs4Machine · FraudEye v3.1","Forensic Vision Engine","CEO: Raphael Mendes"].map((s,i) => (
          <span key={i} style={{ fontSize:"8px", color:T.dim, letterSpacing:"0.14em" }}>{i>0?"·  ":""}{s}</span>
        ))}
        <div style={{ marginLeft:"auto", fontFamily:"monospace", fontSize:"8px", color:T.dim }}>API: {API_URL}</div>
      </div>
    </div>
  );
}