// ╔══════════════════════════════════════════════╗
// ║  components/FraudEye/AuditTerminal.jsx       ║
// ║  Terminal estilo macOS com logs do backend   ║
// ╚══════════════════════════════════════════════╝

import { useEffect, useRef } from "react";
import { T } from "../../constants/tokens";

const LOG_STYLE = {
  sys:  { color: T.muted,  prefix: "⬡ SYS" },
  ok:   { color: T.green,  prefix: "✓ OK " },
  warn: { color: T.yellow, prefix: "⚠ WRN" },
  err:  { color: T.red,    prefix: "✖ ERR" },
};

export default function AuditTerminal({ logs }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div style={{ background:"#040709", border:`1px solid ${T.border}`, borderRadius:"6px", overflow:"hidden", flex:1 }}>

      {/* macOS dots header */}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 12px", borderBottom:`1px solid ${T.border}`, background:T.surface }}>
        {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
          <div key={i} style={{ width:"8px", height:"8px", borderRadius:"50%", background:c, opacity:0.65 }} />
        ))}
        <span style={{ fontFamily:"monospace", fontSize:"9px", letterSpacing:"0.15em", color:T.muted, textTransform:"uppercase", marginLeft:"4px" }}>
          fraude-eye · audit · terminal
        </span>
        {logs.length > 0 && (
          <span style={{ marginLeft:"auto", fontFamily:"monospace", fontSize:"8px", color:T.dim }}>
            {logs.length} entradas
          </span>
        )}
      </div>

      {/* Log lines */}
      <div style={{ padding:"8px 12px", height:"140px", overflowY:"auto", scrollbarWidth:"thin", scrollbarColor:`${T.border} transparent` }}>

        {logs.length === 0 && (
          <div style={{ fontFamily:"monospace", fontSize:"10px", color:T.dim, letterSpacing:"0.1em", opacity:0.4, paddingTop:"4px" }}>
            · aguardando início da perícia...
          </div>
        )}

        {logs.map((log, i) => {
          const s = LOG_STYLE[log.type] || LOG_STYLE.sys;
          return (
            <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"2px", animation:"log-appear 0.2s ease-out both" }}>
              <span style={{ fontFamily:"monospace", fontSize:"9px", color:T.dim, whiteSpace:"nowrap", paddingTop:"1px", minWidth:"50px" }}>{log.time}</span>
              <span style={{ fontFamily:"monospace", fontSize:"9px", color:s.color, fontWeight:"700", letterSpacing:"0.08em", whiteSpace:"nowrap", paddingTop:"1px", minWidth:"40px", textShadow:`0 0 6px ${s.color}66` }}>{s.prefix}</span>
              <span style={{ fontFamily:"monospace", fontSize:"10px", color:log.type === "sys" ? T.muted : T.text, lineHeight:"1.5", opacity:log.type === "sys" ? 0.6 : 1 }}>{log.text}</span>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}