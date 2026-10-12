import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pseudo } from "../lib/anim";

/**
 * Mundo do produto (referência: vídeo enviado pelo cliente): verde-floresta profundo com vinheta,
 * órbitas finas girando em volta do telefone e partículas de poeira (algumas terracota).
 */
export const ForestBG: React.FC<{ cx?: number; cy?: number; orbits?: number; particles?: number; glow?: number }> = ({
  cx = 540,
  cy = 1050,
  orbits = 1,
  particles = 1,
  glow = 1,
}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(85% 55% at ${(cx / 1080) * 100}% ${(cy / 1920) * 100 - 6}%, rgba(58,110,82,${0.55 * glow}) 0%, rgba(32,64,47,0.9) 32%, #142a1e 62%, #0b1711 100%)`,
        }}
      />
      {/* órbitas (elipses inclinadas, como anéis em volta do telefone) */}
      {orbits > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: orbits }}>
          {[0, 1].map((k) => {
            const rx = 520 + k * 140;
            const ry = 120 + k * 40;
            const rot = -8 + k * 5 + Math.sin(t * 0.3 + k) * 2;
            const dash = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
            return (
              <g key={k} transform={`translate(${cx} ${cy + 260 + k * 90}) rotate(${rot})`}>
                <ellipse rx={rx} ry={ry} fill="none" stroke="rgba(244,242,238,0.13)" strokeWidth={1.6} strokeDasharray={`${dash * 0.55} ${dash}`} strokeDashoffset={-t * 60 * (k ? -1 : 1)} />
                {/* "planeta" que percorre a órbita */}
                <circle cx={rx * Math.cos(t * (0.5 + k * 0.2) + k * 2)} cy={ry * Math.sin(t * (0.5 + k * 0.2) + k * 2)} r={4} fill={k ? "#e69a7f" : "rgba(244,242,238,0.7)"} />
              </g>
            );
          })}
        </svg>
      )}
      {/* partículas */}
      {particles > 0 &&
        Array.from({ length: 34 }).map((_, i) => {
          const x0 = pseudo(i) * 1080;
          const y0 = pseudo(i + 50) * 1920;
          const sp = 8 + pseudo(i + 7) * 22;
          const y = ((y0 - t * sp) % 1920 + 1920) % 1920;
          const x = x0 + Math.sin(t * 0.6 + i) * 18;
          const s = 1.5 + pseudo(i + 3) * 3;
          const terra = i % 9 === 0;
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + pseudo(i) * 1.5) + i));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: s,
                height: s,
                borderRadius: s,
                background: terra ? "#e69a7f" : "rgba(244,242,238,0.85)",
                opacity: tw * particles * (terra ? 0.9 : 0.45),
                boxShadow: terra ? "0 0 8px 2px rgba(230,154,127,0.6)" : "none",
              }}
            />
          );
        })}
    </AbsoluteFill>
  );
};
