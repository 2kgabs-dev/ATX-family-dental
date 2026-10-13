import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, EASE, FONT, MONO } from "../theme";
import { clamp01, lerp, prog, pseudo, springAt } from "../lib/anim";
import { Icon } from "./Icon";

/**
 * Primitivas de motion design (v4), tiradas das referências do cliente (anúncios de app em motion design):
 * pílula de vidro com ícone (Mercury), rastro de luz que varre a tela (Nomad/4.roues), órbita tracejada em volta
 * do logo (Temvo), blobs de gradiente no fundo (Temvo/Mercury), ícone 3D extrudado (Mercury/Zei/Nomad),
 * cursor clicando a UI (Zei), círculo desenhado à mão em volta de um destaque (Mercury) e palavra gigante
 * atravessando a tela com o objeto passando na frente (Nomad).
 * Tudo em CSS/SVG: renderiza no Chromium headless com SwiftShader.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- pílula de vidro com ícone ---------- */
export const GlassPill: React.FC<{
  icon?: string;
  label: string;
  sub?: string;
  t: number;
  t0: number;
  x: number;
  y: number;
  dark?: boolean;
  accent?: string;
  scale?: number;
  out?: number;
}> = ({ icon, label, sub, t, t0, x, y, dark = true, accent = C.terracotta, scale = 1, out }) => {
  const p = springAt(t * 30, t0, { damping: 14, stiffness: 170, mass: 0.7 }, 30);
  const o = out !== undefined ? prog(t, out, 0.25, EASE.inOut) : 0;
  if (t < t0 - 0.02) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: sub ? "16px 28px 16px 16px" : "14px 26px 14px 14px",
        borderRadius: 999,
        background: dark ? "linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.07))" : "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))",
        border: `1.5px solid ${dark ? "rgba(255,255,255,0.32)" : "rgba(20,26,22,0.08)"}`,
        boxShadow: dark ? "0 24px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.35)" : "0 24px 50px -24px rgba(20,26,22,0.45), inset 0 1px 0 #fff",
        fontFamily: FONT,
        transform: `translateY(${(1 - p) * 40 - o * 30}px) scale(${(0.7 + 0.3 * p) * scale})`,
        transformOrigin: "0% 50%",
        opacity: clamp01(p * 1.6) * (1 - o),
        whiteSpace: "nowrap",
      }}
    >
      {icon && (
        <div style={{ width: 56, height: 56, borderRadius: 56, background: accent, display: "grid", placeItems: "center", boxShadow: `0 8px 20px -8px ${accent}` }}>
          <Icon name={icon} size={30} color="#fff" stroke={2.6} />
        </div>
      )}
      <div style={{ lineHeight: 1.08 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: dark ? "#fff" : C.text, letterSpacing: "-0.01em" }}>{label}</div>
        {sub && <div style={{ fontSize: 22, color: dark ? "rgba(255,255,255,0.72)" : C.text2, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
};

/* ---------- rastro de luz: uma linha brilhante que varre a tela (transição/realce) ---------- */
export const LightStreak: React.FC<{ t: number; t0: number; dur?: number; y?: number; color?: string; angle?: number; thickness?: number }> = ({
  t,
  t0,
  dur = 0.45,
  y = 960,
  color = "#ffb38f",
  angle = -8,
  thickness = 10,
}) => {
  const p = prog(t, t0, dur, EASE.inOut);
  if (p <= 0 || p >= 1) return null;
  const head = lerp(-300, 1380, p);
  const tail = lerp(-900, 1380, Math.pow(p, 0.6));
  const len = Math.max(0, head - tail);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 0, transform: `rotate(${angle}deg)`, transformOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            left: tail,
            top: -thickness / 2,
            width: len,
            height: thickness,
            borderRadius: thickness,
            background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${color} 70%, #fff 100%)`,
            boxShadow: `0 0 ${thickness * 3}px ${thickness}px ${color}`,
            opacity: Math.sin(Math.PI * p),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- órbita tracejada que gira em volta de um elemento ---------- */
export const DashedOrbit: React.FC<{ t: number; t0: number; cx: number; cy: number; r: number; color?: string; dots?: number; speed?: number; width?: number }> = ({
  t,
  t0,
  cx,
  cy,
  r,
  color = C.terracotta,
  dots = 2,
  speed = 0.6,
  width = 3,
}) => {
  const p = prog(t, t0, 0.6, EASE.out);
  if (p <= 0) return null;
  const rot = (t - t0) * speed * 60;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={p}>
        <circle cx={cx} cy={cy} r={r * (0.85 + 0.15 * p)} fill="none" stroke={color} strokeWidth={width} strokeDasharray={`${circ / 60} ${circ / 60}`} strokeLinecap="round" />
        {Array.from({ length: dots }).map((_, i) => {
          const a = (i / dots) * Math.PI * 2;
          return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={width * 3} fill={color} />;
        })}
      </g>
    </svg>
  );
};

/* ---------- blobs de gradiente que derivam devagar no fundo ---------- */
export const Blobs: React.FC<{ t: number; colors?: string[]; opacity?: number }> = ({ t, colors = ["#2f6b4c", "#c9684a", "#3c7a5a"], opacity = 0.55 }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity, pointerEvents: "none" }}>
    {colors.map((c, i) => {
      const x = 540 + Math.sin(t * 0.35 + i * 2.1) * 380;
      const y = 900 + Math.cos(t * 0.27 + i * 1.7) * 620;
      const s = 700 + i * 140;
      return <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: s, background: `radial-gradient(closest-side, ${c}, rgba(0,0,0,0))`, opacity: i === 1 ? 0.45 : 0.8 }} />;
    })}
  </AbsoluteFill>
);

/* ---------- ícone 3D extrudado (camadas empilhadas em Z) ---------- */
export const Icon3D: React.FC<{ name: string; size?: number; color?: string; side?: string; depth?: number; rx?: number; ry?: number; tile?: boolean }> = ({
  name,
  size = 220,
  color = C.terracotta,
  side = "#8f4330",
  depth = 14,
  rx = 0,
  ry = 0,
  tile = true,
}) => {
  const layers = Array.from({ length: depth });
  const face = (i: number) =>
    tile ? (
      <div style={{ width: size, height: size, borderRadius: size * 0.26, background: i === 0 ? `linear-gradient(145deg, ${color}, ${side})` : side, display: "grid", placeItems: "center", boxShadow: i === 0 ? "inset 0 2px 0 rgba(255,255,255,0.35)" : undefined }}>
        {i === 0 && <Icon name={name} size={size * 0.52} color="#fff" stroke={2.4} />}
      </div>
    ) : (
      <Icon name={name} size={size} color={i === 0 ? color : side} stroke={2.6} />
    );
  return (
    <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", transform: `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {layers.map((_, k) => {
        const i = depth - 1 - k; // desenha de trás para frente
        return (
          <div key={i} style={{ position: "absolute", inset: 0, transform: `translateZ(${-i * 2}px)` }}>
            {face(i)}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- cursor clicando ---------- */
export const ClickCursor: React.FC<{ t: number; tapT: number; x: number; y: number; from?: [number, number]; dark?: boolean }> = ({ t, tapT, x, y, from = [220, 260], dark }) => {
  const arrive = prog(t, tapT - 0.6, 0.55, EASE.inOut);
  const leave = prog(t, tapT + 0.45, 0.35, EASE.inOut);
  const vis = clamp01(arrive * 3) * (1 - leave);
  if (vis <= 0) return null;
  const px = x + from[0] * (1 - arrive) + leave * 120;
  const py = y + from[1] * (1 - arrive) + leave * 160;
  const press = interpolate(t, [tapT - 0.06, tapT, tapT + 0.12], [1, 0.84, 1], clamp);
  const ripple = prog(t, tapT, 0.5, EASE.out);
  return (
    <div style={{ position: "absolute", left: px, top: py, opacity: vis, pointerEvents: "none" }}>
      {t >= tapT && <div style={{ position: "absolute", left: -60 * ripple, top: -60 * ripple, width: 120 * ripple, height: 120 * ripple, borderRadius: 200, border: `4px solid rgba(255,255,255,${0.9 * (1 - ripple)})` }} />}
      <svg width={64} height={64} viewBox="0 0 24 24" style={{ transform: `scale(${press})`, transformOrigin: "10% 10%", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
        <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.6 L11.6 14 L18 14 Z" fill={dark ? C.text : "#fff"} stroke={dark ? "#fff" : C.text} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ---------- círculo desenhado à mão em volta de um destaque ---------- */
export const HandCircle: React.FC<{ t: number; t0: number; cx: number; cy: number; rx: number; ry: number; color?: string; width?: number; dur?: number }> = ({
  t,
  t0,
  cx,
  cy,
  rx,
  ry,
  color = C.terracotta,
  width = 6,
  dur = 0.55,
}) => {
  const p = prog(t, t0, dur, EASE.inOut);
  if (p <= 0) return null;
  // elipse com um pequeno "passe" a mais no fim, como um traço de caneta
  const d = `M ${cx + rx * 0.2} ${cy - ry * 1.02} C ${cx + rx * 1.15} ${cy - ry * 0.95}, ${cx + rx * 1.12} ${cy + ry * 1.05}, ${cx} ${cy + ry} C ${cx - rx * 1.1} ${cy + ry * 0.98}, ${cx - rx * 1.08} ${cy - ry * 0.98}, ${cx + rx * 0.05} ${cy - ry * 1.05} C ${cx + rx * 0.45} ${cy - ry * 1.08}, ${cx + rx * 0.7} ${cy - ry * 0.98}, ${cx + rx * 0.82} ${cy - ry * 0.86}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

/* ---------- palavra gigante que atravessa a tela (fica atrás do objeto) ---------- */
export const BigWord: React.FC<{ text: string; t: number; t0: number; dur: number; y: number; color?: string; size?: number; dir?: 1 | -1; dot?: boolean }> = ({
  text,
  t,
  t0,
  dur,
  y,
  color = "#fff",
  size = 300,
  dir = -1,
  dot = true,
}) => {
  const p = clamp01((t - t0) / dur);
  if (t < t0 - 0.05 || p >= 1) return null;
  const enter = EASE.out(clamp01(p / 0.22));
  const x = dir < 0 ? lerp(1080, 60, enter) - p * 260 : lerp(-1400, 40, enter) + p * 260;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontWeight: 850, fontSize: size, letterSpacing: "-0.06em", lineHeight: 0.85, color, whiteSpace: "nowrap", textTransform: "uppercase", opacity: 1 - clamp01((p - 0.88) / 0.12) }}>
      {text}
      {dot && <span style={{ color: C.terracotta }}>.</span>}
    </div>
  );
};

/* ---------- etiqueta de anotação (dado do app apontando para a tela) ----------
 * Pílula creme com ícone em contorno e uma linha-guia até o ponto da tela que ela explica. Desenho de propósito
 * diferente de um banner de notificação (o app NÃO envia notificação; a Meta proíbe imitar notificação/botão). */
export const FloatChip: React.FC<{ t: number; t0: number; x: number; y: number; icon: string; title: string; value: string; seed?: number; accent?: string; anchor?: [number, number] }> = ({
  t,
  t0,
  x,
  y,
  icon,
  title,
  value,
  seed = 1,
  accent = C.forest,
  anchor,
}) => {
  const p = springAt(t * 30, t0, { damping: 13, stiffness: 150 }, 30);
  if (t < t0 - 0.02) return null;
  const fx = Math.sin(t * 1.1 + seed) * 6;
  const fy = Math.cos(t * 0.9 + seed * 2) * 8;
  const estW = 44 + 12 + Math.max(title.length * 10, value.length * 14.5) + 34;
  const cx = x + fx + estW / 2;
  const cy = y + fy + 34;
  const line = prog(t, t0 + 0.05, 0.35, EASE.out);
  return (
    <>
      {anchor && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          <line x1={cx} y1={cy} x2={lerp(cx, anchor[0], line)} y2={lerp(cy, anchor[1], line)} stroke="rgba(247,245,241,0.9)" strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
          <circle cx={anchor[0]} cy={anchor[1]} r={9 * line} fill="#f7f5f1" stroke={accent} strokeWidth={4} />
          <circle cx={anchor[0]} cy={anchor[1]} r={9 + 18 * prog(t, t0 + 0.35, 0.6, EASE.out)} fill="none" stroke={accent} strokeWidth={2} opacity={line * (1 - prog(t, t0 + 0.35, 0.6, EASE.out))} />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: x + fx,
          top: y + fy,
          transform: `perspective(1200px) rotateY(${(1 - p) * 40 + (pseudo(seed) - 0.5) * 10}deg) scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 1.5),
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 26px 10px 10px",
          borderRadius: 999,
          background: "rgba(247,245,241,0.97)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 22px 44px -22px rgba(0,0,0,0.7)",
          fontFamily: FONT,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 44, border: `2.5px solid ${accent}`, display: "grid", placeItems: "center" }}>
          <Icon name={icon} size={24} color={accent} stroke={2.4} />
        </div>
        <div style={{ lineHeight: 1.08 }}>
          <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.14em", color: C.text2, textTransform: "uppercase" }}>{title}</div>
          <div style={{ fontSize: 27, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>{value}</div>
        </div>
      </div>
    </>
  );
};
