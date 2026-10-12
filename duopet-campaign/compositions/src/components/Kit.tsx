import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, EASE, FONT, HAND, MONO } from "../theme";
import { clamp01, FPS, prog } from "../lib/anim";

/** Fundo escuro "antes": noite com bruma verde e vinheta. */
export const NightBG: React.FC<{ glow?: number; hue?: string; style?: React.CSSProperties }> = ({ glow = 1, hue = "#1d3a2b", style }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 70% at 50% 38%, ${hue} 0%, #12211a ${38 + 10 * (1 - glow)}%, ${C.night} 78%)`,
      ...style,
    }}
  />
);

/** Fundo claro "depois": papel creme da marca com luz suave. */
export const PaperBG: React.FC<{ style?: React.CSSProperties; warm?: number }> = ({ style, warm = 0 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(110% 65% at 50% 35%, #fbfaf7 0%, ${C.page} 55%, ${warm ? "#ece4d6" : "#e9e5dd"} 100%)`,
      ...style,
    }}
  />
);

/** Granulação de filme animada (bem sutil): 6 texturas pré-geradas alternadas — muito mais leve que feTurbulence. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: opacity * 1.6 }}>
      <Img src={staticFile(`img/grain-${f % 6}.png`)} style={{ width: 1080, height: 1920, imageRendering: "pixelated" }} />
    </AbsoluteFill>
  );
};

/** Desfoque direcional (motion blur) via filtro SVG, por elemento. */
export const MotionBlur: React.FC<{ id: string; x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ id, x, y, children, style }) => {
  const bx = Math.min(40, Math.abs(x));
  const by = Math.min(40, Math.abs(y));
  if (bx < 0.6 && by < 0.6) return <div style={style}>{children}</div>;
  return (
    <div style={{ ...style, filter: `url(#mb-${id})` }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={`mb-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={`${bx * 0.5} ${by * 0.5}`} />
        </filter>
      </svg>
      {children}
    </div>
  );
};

/** Título de impacto: caixa alta pesada, tracking negativo, ponto final terracota (assinatura do DuoPet). */
export const Headline: React.FC<{
  lines: string[];
  t: number; // tempo local (s)
  t0: number; // início
  size?: number;
  color?: string;
  accent?: string;
  dot?: boolean | string; // ponto final terracota, ou "?" etc.
  stagger?: number;
  align?: "left" | "center";
  out?: number; // instante de saída
  style?: React.CSSProperties;
  weight?: number;
  accentWords?: string[];
}> = ({ lines, t, t0, size = 150, color = C.nightText, accent = C.terracotta, dot = true, stagger = 0.07, align = "left", out, style, weight = 800, accentWords = [] }) => {
  let k = 0;
  const outP = out !== undefined ? prog(t, out, 0.28, EASE.inOut) : 0;
  return (
    <div style={{ fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.055em", color, textAlign: align, textTransform: "uppercase", ...style }}>
      {lines.map((ln, li) => {
        const words = ln.split(" ");
        return (
          <div key={li} style={{ whiteSpace: "nowrap", overflow: "visible", paddingBottom: size * 0.04 }}>
            {words.map((w, wi) => {
              const p = prog(t, t0 + k * stagger, 0.55, EASE.slam);
              k++;
              const isLast = li === lines.length - 1 && wi === words.length - 1;
              const y = (1 - p) * size * 0.55 - outP * size * 0.4;
              const blur = (1 - p) * 14 + outP * 10;
              const strip = (x: string) => x.replace(/[.,?!…]/g, "").toLowerCase();
              const isAccent = accentWords.some((a) => strip(a) === strip(w));
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    transform: `translateY(${y}px) scale(${0.92 + 0.08 * p})`,
                    opacity: clamp01(p * 1.6) * (1 - outP),
                    filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                    marginRight: wi < words.length - 1 ? size * 0.22 : 0,
                    color: isAccent ? accent : undefined,
                  }}
                >
                  {w}
                  {isLast && dot ? <span style={{ color: accent }}>{dot === true ? "." : dot}</span> : null}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Rótulo mono pequeno ("01 — ROTINA"). */
export const Eyebrow: React.FC<{ text: string; t: number; t0: number; color?: string; style?: React.CSSProperties }> = ({ text, t, t0, color = C.nightMuted, style }) => {
  const p = prog(t, t0, 0.5);
  return (
    <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.22em", color, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, display: "flex", alignItems: "center", gap: 18, ...style }}>
      <span style={{ display: "inline-block", width: 60 * p, height: 2, background: color }} />
      {text}
    </div>
  );
};

/** Recorte de pet (PNG com alfa) com sombra de contato. */
export const Cutout: React.FC<{ src: string; width: number; style?: React.CSSProperties; shadow?: boolean }> = ({ src, width, style, shadow = true }) => (
  <Img src={staticFile(src)} style={{ width, filter: shadow ? "drop-shadow(0 40px 50px rgba(0,0,0,0.35))" : undefined, ...style }} />
);

/* ------------------------------------------------------------------ */
/* Elementos do "caos" (antes do DuoPet): objetos genéricos do dia a dia */
/* ------------------------------------------------------------------ */

const paperShadow = "0 30px 60px -20px rgba(0,0,0,0.55), 0 8px 18px -8px rgba(0,0,0,0.4)";

export const StickyNote: React.FC<{ lines: string[]; w?: number; color?: string }> = ({ lines, w = 360, color = "#efd9a0" }) => (
  <div style={{ width: w, padding: "34px 30px 30px", background: `linear-gradient(170deg, ${color} 0%, #e6cb86 100%)`, boxShadow: paperShadow, fontFamily: HAND, fontSize: 52, lineHeight: 1.05, color: "#3b3022", borderRadius: 4 }}>
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

export const PaperCard: React.FC<{ title: string; rows: [string, string][]; w?: number; stamp?: string }> = ({ title, rows, w = 420, stamp }) => (
  <div style={{ width: w, background: "#f6f1e6", boxShadow: paperShadow, borderRadius: 10, padding: "26px 28px", fontFamily: FONT, color: "#3a352c", position: "relative" }}>
    <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.16em", color: "#7b6f5a", borderBottom: "2px solid #d8ccb2", paddingBottom: 12 }}>{title}</div>
    {rows.map(([a, b], i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 28, padding: "12px 0", borderBottom: "1px dashed #d8ccb2" }}>
        <span style={{ fontWeight: 600 }}>{a}</span>
        <span style={{ fontFamily: HAND, fontSize: 38, color: b.includes("?") ? C.terracottaText : "#4a4033" }}>{b}</span>
      </div>
    ))}
    {stamp && (
      <div style={{ position: "absolute", right: 22, top: 70, transform: "rotate(-14deg)", border: `3px solid ${C.terracotta}`, color: C.terracotta, fontFamily: MONO, fontSize: 18, padding: "4px 10px", borderRadius: 6, opacity: 0.8 }}>{stamp}</div>
    )}
  </div>
);

export const CalendarCard: React.FC<{ w?: number; marks?: number[]; label?: string }> = ({ w = 420, marks = [9, 14, 15, 23], label = "OUTUBRO" }) => (
  <div style={{ width: w, background: "#fff", borderRadius: 26, boxShadow: paperShadow, padding: 26, fontFamily: FONT }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#141a16" }}>{label}</div>
      <div style={{ fontSize: 22, color: "#8a8f89" }}>2026</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 18 }}>
      {Array.from({ length: 31 }).map((_, i) => {
        const m = marks.includes(i + 1);
        return (
          <div key={i} style={{ height: 40, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 20, color: m ? "#fff" : "#4a4f49", background: m ? (i % 2 ? C.terracotta : "#3d6b8a") : "transparent", fontWeight: m ? 700 : 400 }}>
            {i + 1}
          </div>
        );
      })}
    </div>
  </div>
);

export const ChatCard: React.FC<{ w?: number; msgs: { me?: boolean; text: string; time: string }[]; title?: string }> = ({ w = 470, msgs, title = "Família" }) => (
  <div style={{ width: w, background: "#e9e6df", borderRadius: 30, boxShadow: paperShadow, overflow: "hidden", fontFamily: FONT }}>
    <div style={{ background: "#2f3833", color: "#f1f1ee", padding: "18px 24px", fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 44, background: "#5d6b63" }} />
      {title}
    </div>
    <div style={{ padding: "18px 18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
      {msgs.map((m, i) => (
        <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "82%", background: m.me ? "#d7e6dc" : "#fff", borderRadius: 18, padding: "12px 16px", fontSize: 25, color: "#1f2622", lineHeight: 1.2 }}>
          {m.text}
          <span style={{ fontSize: 16, color: "#7b827d", marginLeft: 10 }}>{m.time}</span>
        </div>
      ))}
    </div>
  </div>
);

export const ReceiptCard: React.FC<{ w?: number }> = ({ w = 300 }) => (
  <div style={{ width: w, background: "#fbfaf6", boxShadow: paperShadow, padding: "24px 24px 30px", fontFamily: MONO, color: "#3a3a36", fontSize: 19, lineHeight: 1.6, clipPath: "polygon(0 0,100% 0,100% 96%,92% 100%,84% 96%,76% 100%,68% 96%,60% 100%,52% 96%,44% 100%,36% 96%,28% 100%,20% 96%,12% 100%,4% 96%,0 100%)" }}>
    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 21 }}>PET SHOP</div>
    <div>RAÇÃO 10KG ..... 189,90</div>
    <div>BANHO ........... 70,00</div>
    <div>PETISCO ......... 18,50</div>
    <div style={{ borderTop: "2px dashed #999", marginTop: 6, paddingTop: 6, fontWeight: 700 }}>TOTAL ........ 278,40</div>
  </div>
);

export const PillPack: React.FC<{ w?: number; taken?: number }> = ({ w = 330, taken = 5 }) => (
  <div style={{ width: w, background: "linear-gradient(160deg,#dfe3e6,#c3c9cd)", borderRadius: 22, boxShadow: paperShadow, padding: 22, fontFamily: FONT }}>
    <div style={{ fontSize: 21, color: "#4b5258", fontWeight: 600, marginBottom: 12 }}>12 em 12 h · 10 dias</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ height: 44, borderRadius: 22, background: i < taken ? "rgba(255,255,255,0.35)" : "radial-gradient(circle at 35% 30%, #fff, #e9e3d8 60%, #cfc7b8)", boxShadow: i < taken ? "inset 0 2px 6px rgba(0,0,0,0.2)" : "0 3px 6px rgba(0,0,0,0.2)" }} />
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Legendas animadas palavra a palavra                                  */
/* ------------------------------------------------------------------ */

export type Word = { w: string; start: number; end: number };

/** Agrupa palavras em blocos curtos (até ~24 caracteres), quebrando também em pontuação forte. */
export const chunkWords = (words: Word[], maxChars = 24) => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  for (const w of words) {
    if (cur.length && len + w.w.length + 1 > maxChars) {
      chunks.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.w.length + 1;
    if (/[.?!…:]$/.test(w.w) || (/,$/.test(w.w) && len > 14)) {
      chunks.push(cur);
      cur = [];
      len = 0;
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
};

export const Captions: React.FC<{ words: Word[]; t: number; theme?: "dark" | "light"; y?: number }> = ({ words, t, theme = "dark", y = 1150 }) => {
  const chunks = chunkWords(words);
  const idx = chunks.findIndex((c, i) => t >= c[0].start - 0.08 && t < (chunks[i + 1] ? chunks[i + 1][0].start - 0.08 : c[c.length - 1].end + 0.5));
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const pIn = prog(t, chunk[0].start - 0.08, 0.18, EASE.out);
  const bg = theme === "dark" ? "rgba(14,19,17,0.84)" : "rgba(255,255,255,0.95)";
  const fg = theme === "dark" ? "#f4f2ee" : C.text;
  const dim = theme === "dark" ? "rgba(244,242,238,0.5)" : "rgba(20,26,22,0.42)";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 860,
          padding: "14px 26px 16px",
          borderRadius: 22,
          background: bg,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 54,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          textAlign: "center",
          transform: `translateY(${(1 - pIn) * 18}px) scale(${0.96 + 0.04 * pIn})`,
          opacity: pIn,
          boxShadow: theme === "dark" ? "0 20px 40px -20px rgba(0,0,0,0.6)" : "0 20px 40px -24px rgba(20,26,22,0.35)",
        }}
      >
        {chunk.map((w, i) => {
          const spoken = t >= w.start - 0.03;
          const current = spoken && t < w.end + 0.02;
          return (
            <span key={i} style={{ color: spoken ? (current ? C.terracotta : fg) : dim, transition: "none" }}>
              {w.w.replace("duopet.site", "duopet.site")}
              {i < chunk.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Overlay de depuração da área segura (só para QA). */
export const SafeZone: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 270, background: "rgba(255,0,0,0.18)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1920 - 1248, background: "rgba(255,0,0,0.18)" }} />
    <div style={{ position: "absolute", right: 0, top: 270, width: 140, height: 1248 - 270, background: "rgba(255,160,0,0.18)" }} />
  </AbsoluteFill>
);

export const secToFrame = (s: number) => Math.round(s * FPS);
