// ╔══════════════════════════════════════════════╗
// ║  components/FraudEye/MetricPills.jsx         ║
// ║  Os 4 cards de métricas no topo esquerdo     ║
// ╚══════════════════════════════════════════════╝

import { T } from "../../constants/tokens";

export default function MetricPills({ phase, evidence }) {
  const done = phase === "done";
  const idle = phase === "idle";

  const avgConf = evidence.length > 0
    ? Math.round(evidence.reduce((a, b) => a + b.confidence, 0) / evidence.length)
    : null;

  const metrics = [
    { label:"Campos Analisados", value: idle ? "—" : done ? "47"                          : "...", color:T.cyan   },
    { label:"Anomalias",         value: idle ? "—" : `${evidence.length}`,                          color: evidence.length > 0 ? T.red : T.green },
    { label:"Tempo Análise",     value: idle ? "—" : done ? "~3s"                         : "...", color:T.purple },
    { label:"Confiança Média",   value: idle ? "—" : done && avgConf ? `${avgConf}%`      : "...", color:T.green  },
  ];

  return (
    <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
      {metrics.map(({ label, value, color }) => (
        <div key={label} style={{ flex:1, padding:"10px 12px", background: !idle ? `${color}0d` : T.card, border:`1px solid ${!idle ? color+"44" : T.border}`, borderRadius:"6px", transition:"all 0.5s ease" }}>
          <div style={{ fontFamily:"monospace", fontSize:"8px", letterSpacing:"0.14em", color:T.dim, textTransform:"uppercase", marginBottom:"4px" }}>{label}</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"20px", fontWeight:"700", color: !idle ? color : T.dim, textShadow: !idle ? `0 0 12px ${color}` : "none", transition:"all 0.5s", lineHeight:1 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}