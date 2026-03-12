// ╔══════════════════════════════════════════════╗
// ║  components/FraudEye/RiskMeter.jsx           ║
// ║  Gauge SVG circular com animação de score    ║
// ╚══════════════════════════════════════════════╝

import { useState, useEffect } from "react";
import { T } from "../../constants/tokens";

export default function RiskMeter({ score, label, active }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!active) { setDisplayed(0); return; }
    let current = 0;
    const step = score / 60;
    const t = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayed(Math.round(current));
      if (current >= score) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [score, active]);

  const color      = displayed < 40 ? T.green : displayed < 70 ? T.yellow : T.red;
  const R          = 54, cx = 70, cy = 70;
  const startAngle = -220 * Math.PI / 180;
  const endAngle   =  40  * Math.PI / 180;
  const arcLen     = endAngle - startAngle;
  const fillAngle  = startAngle + arcLen * (displayed / 100);

  const arcPath = (a1, a2) => {
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${(a2 - a1) > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
  };

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = startAngle + arcLen * (i / 10);
    return { x1: cx + (R-6)*Math.cos(a), y1: cy + (R-6)*Math.sin(a), x2: cx + (R+1)*Math.cos(a), y2: cy + (R+1)*Math.sin(a), major: i % 5 === 0 };
  });

  const zoneLabels = [
    { a: startAngle + arcLen * 0.15, label: "BAIXO" },
    { a: startAngle + arcLen * 0.5,  label: "MÉDIO" },
    { a: startAngle + arcLen * 0.85, label: "ALTO"  },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
      <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:T.muted, fontFamily:"monospace", textTransform:"uppercase" }}>Risk Score</div>

      <div style={{ position:"relative", width:"140px", height:"140px" }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Track */}
          <path d={arcPath(startAngle, endAngle)} fill="none" stroke={T.border} strokeWidth="8" strokeLinecap="round" />

          {/* Fill */}
          {active && displayed > 0 && (
            <path d={arcPath(startAngle, fillAngle)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
              style={{ filter:`drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}66)`, transition:"stroke 0.5s ease" }}
            />
          )}

          {/* Ticks */}
          {ticks.map((tk, i) => (
            <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
              stroke={tk.major ? T.muted : T.dim} strokeWidth={tk.major ? 1.5 : 0.8}
            />
          ))}

          {/* Zone labels */}
          {zoneLabels.map(({ a, label: l }, i) => (
            <text key={i} x={cx + (R+18)*Math.cos(a)} y={cy + (R+18)*Math.sin(a)}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:"monospace", fontSize:"7px", fill:T.dim }}>{l}</text>
          ))}

          {/* Needle */}
          {active && (
            <line x1={cx} y1={cy} x2={cx + (R-10)*Math.cos(fillAngle)} y2={cy + (R-10)*Math.sin(fillAngle)}
              stroke={color} strokeWidth="2" strokeLinecap="round"
              style={{ filter:`drop-shadow(0 0 4px ${color})`, transition:"stroke 0.5s ease" }}
            />
          )}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="5" fill={active ? color : T.dim}
            style={{ filter:active ? `drop-shadow(0 0 6px ${color})` : "none", transition:"fill 0.5s ease" }}
          />
        </svg>

        {/* Score value */}
        <div style={{ position:"absolute", bottom:"18px", left:"50%", transform:"translateX(-50%)", textAlign:"center" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"26px", fontWeight:"700", color:active ? color : T.dim, textShadow:active ? `0 0 16px ${color}` : "none", lineHeight:1, transition:"color 0.5s ease" }}>
            {displayed}
          </div>
          <div style={{ fontSize:"8px", color:T.muted, letterSpacing:"0.12em", marginTop:"2px" }}>/ 100</div>
        </div>
      </div>

      {/* Label badge */}
      <div style={{ padding:"3px 14px", background:active ? `${color}18` : T.surface, border:`1px solid ${active ? color+"55" : T.border}`, borderRadius:"3px", fontFamily:"monospace", fontSize:"9px", letterSpacing:"0.18em", color:active ? color : T.muted, textTransform:"uppercase", transition:"all 0.5s ease" }}>
        {!active ? "AGUARDANDO" : label || (displayed < 40 ? "RISCO BAIXO" : displayed < 70 ? "RISCO MÉDIO" : "RISCO ALTO")}
      </div>
    </div>
  );
}