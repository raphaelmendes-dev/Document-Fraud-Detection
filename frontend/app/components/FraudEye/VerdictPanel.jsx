// ╔══════════════════════════════════════════════╗
// ║  components/FraudEye/VerdictPanel.jsx        ║
// ║  Laudo pericial gerado ao final da análise   ║
// ╚══════════════════════════════════════════════╝

import { T } from "../../constants/tokens";

export default function VerdictPanel({ evidence, recommendation }) {
  const hasAnomaly = evidence.length > 0;
  const color      = hasAnomaly ? T.red : T.green;

  return (
    <div style={{
      padding:      "14px",
      background:   `${color}10`,
      border:       `1px solid ${color}44`,
      borderRadius: "6px",
      flexShrink:   0,
      animation:    "stagger-in 0.5s ease-out both",
      boxShadow:    `0 0 20px ${color}18`,
    }}>
      {/* Title */}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
        <span style={{ fontSize:"14px" }}>{hasAnomaly ? "⚖️" : "✅"}</span>
        <span style={{ fontFamily:"monospace", fontSize:"9px", letterSpacing:"0.18em", color, textTransform:"uppercase", fontWeight:"700" }}>
          Laudo Pericial
        </span>
      </div>

      {/* Body */}
      <div style={{ fontFamily:"monospace", fontSize:"10px", color:T.text, lineHeight:"1.7", letterSpacing:"0.03em" }}>
        {hasAnomaly ? (
          <>
            Documento apresenta{" "}
            <span style={{ color:T.red, fontWeight:"700" }}>{evidence.length} anomalia(s)</span>
            {". "}{recommendation}
          </>
        ) : (
          "Nenhuma inconsistência detectada nas regras atuais."
        )}
      </div>

      {/* Footer timestamp */}
      <div style={{ marginTop:"8px", fontFamily:"monospace", fontSize:"8px", color:T.dim, letterSpacing:"0.1em" }}>
        Rs4Machine · FraudEye · {new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  );
}