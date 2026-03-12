// ╔══════════════════════════════════════════════╗
// ║  components/FraudEye/EvidenceCard.jsx        ║
// ║  Card de anomalia com barra de confiança     ║
// ╚══════════════════════════════════════════════╝

import { useState } from "react";
import { T, SEVERITY_COLOR } from "../../constants/tokens";

export default function EvidenceCard({ item, visible, index }) {
  const [hovered, setHovered] = useState(false);
  const color = SEVERITY_COLOR[item.severity] || T.cyan;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered ? `${color}0a` : T.card,
        border:       `1px solid ${hovered ? color+"66" : color+"33"}`,
        borderLeft:   `3px solid ${color}`,
        borderRadius: "6px",
        padding:      "12px 14px",
        opacity:       visible ? 1 : 0,
        transform:     visible ? "translateX(0)" : "translateX(16px)",
        transition:   `all 0.4s ease ${index * 0.15}s`,
        cursor:        "pointer",
        boxShadow:     hovered ? `0 4px 20px ${color}22, inset 0 0 20px ${color}06` : "none",
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      {/* Flash on appear */}
      {visible && (
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg, transparent, ${color}18, transparent)`, animation:`evidence-flash 0.6s ease-out ${index * 0.15}s both`, pointerEvents:"none" }} />
      )}

      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
        <div style={{ fontSize:"18px", lineHeight:1, flexShrink:0, marginTop:"1px" }}>{item.icon}</div>
        <div style={{ flex:1, minWidth:0 }}>

          {/* Header row */}
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"3px" }}>
            <span style={{ fontFamily:"monospace", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", color, textTransform:"uppercase", textShadow:`0 0 8px ${color}66` }}>
              {item.label}
            </span>
            <span style={{ marginLeft:"auto", fontFamily:"monospace", fontSize:"8px", color:T.dim, letterSpacing:"0.06em", flexShrink:0 }}>
              {item.timestamp}
            </span>
          </div>

          {/* Detail */}
          <div style={{ fontFamily:"monospace", fontSize:"11px", color:T.text, letterSpacing:"0.04em", marginBottom:"3px" }}>{item.detail}</div>
          <div style={{ fontFamily:"monospace", fontSize:"9px",  color:T.muted, letterSpacing:"0.04em", lineHeight:"1.5" }}>{item.sub}</div>

          {/* Confidence bar */}
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"8px" }}>
            <span style={{ fontFamily:"monospace", fontSize:"8px", color:T.dim, letterSpacing:"0.08em" }}>CONF.</span>
            <div style={{ flex:1, height:"3px", background:T.border, borderRadius:"1px", overflow:"hidden" }}>
              <div style={{ height:"100%", width:visible ? `${item.confidence}%` : "0%", background:color, borderRadius:"1px", boxShadow:`0 0 4px ${color}`, transition:`width 0.8s ease ${index * 0.15 + 0.3}s` }} />
            </div>
            <span style={{ fontFamily:"monospace", fontSize:"8px", color, letterSpacing:"0.06em" }}>{item.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}