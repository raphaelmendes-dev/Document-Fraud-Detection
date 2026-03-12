// ╔══════════════════════════════════════════════╗
// ║  components/FraudEye/DropZone.jsx            ║
// ║  Área de upload com drag & drop e scan line  ║
// ╚══════════════════════════════════════════════╝

import { useState, useRef } from "react";
import { T } from "../../constants/tokens";

export default function DropZone({ phase, onFileSelect, fileName }) {
  const [drag, setDrag] = useState(false);
  const inputRef        = useRef(null);
  const scanning        = phase === "scanning" || phase === "analyzing";

  const handleFile = (file) => { if (file) onFileSelect(file); };

  return (
    <div
      style={{ position:"relative", background:T.card, border:`1px dashed ${drag ? T.cyan : scanning ? T.cyan+"88" : T.borderHi}`, borderRadius:"10px", overflow:"hidden", minHeight:"220px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:phase === "idle" ? "pointer" : "default", transition:"border-color 0.3s ease", boxShadow:scanning ? `inset 0 0 40px ${T.cyan}08, 0 0 0 1px ${T.cyan}22` : "none" }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => phase === "idle" && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".pdf,.xml,.png,.jpg,.jpeg"
        style={{ display:"none" }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {/* Dot grid background */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(${T.dim} 1px, transparent 1px)`, backgroundSize:"24px 24px", opacity:0.4, pointerEvents:"none" }} />

      {/* Corner brackets */}
      {[
        { top:12, left:12,  borderTop:`2px solid ${T.cyan}`, borderLeft:`2px solid ${T.cyan}` },
        { top:12, right:12, borderTop:`2px solid ${T.cyan}`, borderRight:`2px solid ${T.cyan}` },
        { bottom:12, left:12,  borderBottom:`2px solid ${T.cyan}`, borderLeft:`2px solid ${T.cyan}` },
        { bottom:12, right:12, borderBottom:`2px solid ${T.cyan}`, borderRight:`2px solid ${T.cyan}` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:"24px", height:"24px", ...s, boxShadow:scanning ? `0 0 8px ${T.cyan}66` : "none" }} />
      ))}

      {/* Scan line */}
      {scanning && (
        <>
          <div style={{ position:"absolute", left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${T.cyan}88, ${T.cyan}, ${T.cyan}88, transparent)`, boxShadow:`0 0 16px ${T.cyan}, 0 0 32px ${T.cyan}66`, animation:"doc-scan 2s ease-in-out infinite", zIndex:4 }} />
          <div style={{ position:"absolute", left:0, right:0, height:"60px", background:`linear-gradient(to bottom, ${T.cyan}14, transparent)`, animation:"doc-scan-glow 2s ease-in-out infinite", zIndex:3 }} />
        </>
      )}

      {/* Document preview (after upload) */}
      {phase !== "idle" && (
        <div style={{ position:"absolute", inset:"24px", background:"#0a1018", borderRadius:"4px", border:`1px solid ${T.border}`, padding:"14px", overflow:"hidden", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
            <div>
              <div style={{ width:"80px", height:"8px", background:T.border, borderRadius:"2px", marginBottom:"4px" }} />
              <div style={{ width:"120px", height:"6px", background:T.dim, borderRadius:"2px" }} />
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"monospace", fontSize:"9px", color:T.muted }}>{fileName}</div>
              <div style={{ fontFamily:"monospace", fontSize:"8px", color:T.dim }}>documento fiscal</div>
            </div>
          </div>
          <div style={{ height:"1px", background:T.border, marginBottom:"10px" }} />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"5px" }}>
              <div style={{ width:`${30 + (i * 17) % 40}%`, height:"5px", background:T.dim, borderRadius:"1px" }} />
              <div style={{ width:`${20 + (i * 11) % 30}%`, height:"5px", background:T.border, borderRadius:"1px" }} />
              <div style={{ marginLeft:"auto", width:"15%", height:"5px", background:T.dim, borderRadius:"1px" }} />
            </div>
          ))}
        </div>
      )}

      {/* Idle placeholder */}
      {phase === "idle" && (
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:"12px", opacity:drag ? 1 : 0.6 }}>
          <div style={{ fontSize:"36px", filter:`drop-shadow(0 0 12px ${T.cyan}66)` }}>📄</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"monospace", fontSize:"12px", letterSpacing:"0.15em", color:T.cyan, textTransform:"uppercase" }}>{drag ? "Solte para analisar" : "Arraste a Nota Fiscal"}</div>
            <div style={{ fontFamily:"monospace", fontSize:"10px", color:T.muted, marginTop:"4px", letterSpacing:"0.08em" }}>PDF · XML · PNG · JPG</div>
          </div>
          <div style={{ padding:"4px 14px", border:`1px solid ${T.border}`, borderRadius:"3px", fontFamily:"monospace", fontSize:"9px", color:T.dim, letterSpacing:"0.12em" }}>ou clique para selecionar</div>
        </div>
      )}

      {/* Filename badge */}
      {phase !== "idle" && fileName && (
        <div style={{ position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", zIndex:5, display:"flex", alignItems:"center", gap:"6px", background:`${T.bgDeep}ee`, padding:"4px 12px", borderRadius:"3px", border:`1px solid ${T.border}` }}>
          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:scanning ? T.cyan : T.green, animation:scanning ? "dot-blink 0.8s ease-in-out infinite" : "none", boxShadow:`0 0 6px currentColor` }} />
          <span style={{ fontFamily:"monospace", fontSize:"9px", color:T.muted, letterSpacing:"0.08em" }}>{fileName}</span>
        </div>
      )}
    </div>
  );
}