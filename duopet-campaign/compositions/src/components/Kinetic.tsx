import React from "react";
import { C, EASE, FONT } from "../theme";
import { clamp01, lerp, prog, pseudo } from "../lib/anim";

/**
 * Tipografia cinética com animações DIFERENTES por título (como no vídeo de referência do cliente):
 *  - "track":    letras espaçadas que se fecham, mudando de cor (SEU PET.)
 *  - "cascade":  letras caindo uma a uma (REMÉDIO)
 *  - "type":     máquina de escrever com cursor (CUIDE_)
 *  - "rotate3d": palavra entra girando de um plano inclinado (LEMBRE)
 *  - "scatter":  letras chegam de posições aleatórias (BRINQUE)
 *  - "mask":     linhas sobem de dentro de uma máscara (MAIS LEVE)
 *  - "swap":     cor de destaque passa de uma palavra para outra (CÃO OU GATO)
 * O ponto final terracota é a assinatura da marca.
 */
export type KMode = "track" | "cascade" | "type" | "rotate3d" | "scatter" | "mask" | "swap";

export const KText: React.FC<{
  lines: string[];
  mode: KMode;
  t: number;
  t0: number;
  size?: number;
  color?: string;
  accent?: string;
  dot?: string | false;
  align?: "left" | "center";
  out?: number;
  weight?: number;
  accentWords?: string[];
  swapAt?: number; // modo "swap": instante em que o destaque troca da 1ª para a 2ª palavra marcada
  dur?: number;
  style?: React.CSSProperties;
  lineHeight?: number;
}> = ({ lines, mode, t, t0, size = 150, color = C.nightText, accent = C.terracotta, dot = ".", align = "left", out, weight = 800, accentWords = [], swapAt, dur, style, lineHeight = 0.9 }) => {
  const outP = out !== undefined ? prog(t, out, 0.3, EASE.inOut) : 0;
  const strip = (x: string) => x.replace(/[.,?!…:]/g, "").toLowerCase();
  const total = lines.join("").length;
  let gi = 0; // índice global de letra
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: "-0.055em",
        color,
        textAlign: align,
        textTransform: "uppercase",
        perspective: mode === "rotate3d" ? 900 : undefined,
        opacity: 1 - outP,
        transform: `translateY(${-outP * 40}px)`,
        filter: outP > 0.02 ? `blur(${outP * 8}px)` : undefined,
        ...style,
      }}
    >
      {lines.map((ln, li) => {
        const isLastLine = li === lines.length - 1;
        const words = ln.split(" ");
        // modo mask: a linha inteira sobe dentro de um recorte
        if (mode === "mask") {
          const p = prog(t, t0 + li * 0.12, dur ?? 0.65, EASE.out);
          return (
            <div key={li} style={{ overflow: "hidden", paddingBottom: size * 0.06, marginBottom: -size * 0.06 }}>
              <div style={{ transform: `translateY(${(1 - p) * 105}%)`, whiteSpace: "nowrap" }}>
                {renderWords(words, accentWords, accent, strip, size)}
                {isLastLine && dot ? <span style={{ color: accent }}>{dot}</span> : null}
              </div>
            </div>
          );
        }
        if (mode === "rotate3d") {
          const p = prog(t, t0 + li * 0.1, dur ?? 0.8, EASE.out);
          return (
            <div key={li} style={{ whiteSpace: "nowrap", transformOrigin: "0% 100%", transform: `rotateX(${(1 - p) * -70}deg) rotateZ(${(1 - p) * -14}deg) translateY(${(1 - p) * 60}px)`, opacity: clamp01(p * 2) }}>
              {renderWords(words, accentWords, accent, strip, size)}
              {isLastLine && dot ? <span style={{ color: accent }}>{dot}</span> : null}
            </div>
          );
        }
        if (mode === "swap") {
          const sp = swapAt !== undefined ? prog(t, swapAt, 0.35, EASE.inOut) : 0;
          const pIn = prog(t, t0 + li * 0.08, 0.5, EASE.out);
          return (
            <div key={li} style={{ whiteSpace: "nowrap", transform: `translateY(${(1 - pIn) * 40}px)`, opacity: pIn }}>
              {words.map((w, wi) => {
                const a = accentWords.findIndex((x) => strip(x) === strip(w));
                const col = a === 0 ? mixColor(accent, color, sp) : a === 1 ? mixColor(color, accent, sp) : color;
                return (
                  <span key={wi} style={{ color: col }}>
                    {w}
                    {wi < words.length - 1 ? " " : ""}
                  </span>
                );
              })}
              {isLastLine && dot ? <span style={{ color: accent }}>{dot}</span> : null}
            </div>
          );
        }
        // modos por letra
        const chars = (ln + (isLastLine && dot ? "\u0001" : "")).split("");
        return (
          <div key={li} style={{ whiteSpace: "pre" }}>
            {chars.map((ch, ci) => {
              const i = gi++;
              const isDot = ch === "\u0001";
              const glyph = isDot ? (dot as string) : ch;
              let st: React.CSSProperties = { display: "inline-block" };
              if (mode === "track") {
                const p = prog(t, t0 + 0.05 * i, dur ?? 0.9, EASE.out);
                st = { ...st, transform: `translateX(${(1 - p) * (ci - ln.length / 2) * size * 0.16}px)`, opacity: clamp01(p * 2), color: isDot ? accent : mixColor("#9aa79f", color, p) };
              } else if (mode === "cascade") {
                const p = prog(t, t0 + 0.035 * i, dur ?? 0.42, EASE.slam);
                st = { ...st, transform: `translateY(${(1 - p) * -size * 0.9}px) rotate(${(1 - p) * (pseudo(i) - 0.5) * 30}deg)`, opacity: clamp01(p * 3) };
              } else if (mode === "type") {
                const shown = Math.floor((t - t0) / 0.06);
                st = { ...st, opacity: i < shown ? 1 : 0 };
              } else if (mode === "scatter") {
                const p = prog(t, t0 + pseudo(i + 9) * 0.35, dur ?? 0.55, EASE.out);
                st = { ...st, transform: `translate(${(1 - p) * (pseudo(i) - 0.5) * 300}px, ${(1 - p) * (pseudo(i + 3) - 0.3) * 260}px) rotate(${(1 - p) * (pseudo(i + 5) - 0.5) * 60}deg) scale(${0.6 + 0.4 * p})`, opacity: clamp01(p * 2.5) };
              }
              const word = wordAt(ln, ci);
              const isAcc = !isDot && accentWords.some((x) => strip(x) === strip(word));
              if (isDot) st.color = accent;
              else if (isAcc) st.color = accent;
              return (
                <span key={ci} style={st}>
                  {glyph === " " ? " " : glyph}
                </span>
              );
            })}
            {mode === "type" && isLastLine && <Cursor t={t} t0={t0} n={total + (dot ? 1 : 0)} size={size} />}
          </div>
        );
      })}
    </div>
  );
};

const Cursor: React.FC<{ t: number; t0: number; n: number; size: number }> = ({ t, t0, n, size }) => {
  const done = (t - t0) / 0.06 > n + 6;
  const blink = Math.floor(t * 3) % 2 === 0;
  if (t < t0 || done) return null;
  return <span style={{ display: "inline-block", width: size * 0.45, height: size * 0.08, background: "currentColor", marginLeft: size * 0.05, opacity: blink ? 1 : 0.2 }} />;
};

const wordAt = (ln: string, ci: number) => {
  const s = ln.lastIndexOf(" ", ci - 1) + 1;
  const e = ln.indexOf(" ", ci);
  return ln.slice(s, e < 0 ? undefined : e);
};

const renderWords = (words: string[], accentWords: string[], accent: string, strip: (x: string) => string, size: number) =>
  words.map((w, wi) => (
    <span key={wi} style={{ color: accentWords.some((x) => strip(x) === strip(w)) ? accent : undefined }}>
      {w}
      {wi < words.length - 1 ? " " : ""}
    </span>
  ));

const hex = (c: string) => {
  const m = c.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
};
export const mixColor = (a: string, b: string, p: number) => {
  if (!a.startsWith("#") || !b.startsWith("#")) return p < 0.5 ? a : b;
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(",")})`;
};

/** Rótulo de capítulo mono: "01 — ROTINA" (referência do cliente). */
export const Chapter: React.FC<{ n: string; label: string; t: number; t0: number; color?: string; style?: React.CSSProperties }> = ({ n, label, t, t0, color = "rgba(244,242,238,0.62)", style }) => {
  const p = prog(t, t0, 0.5, EASE.out);
  return (
    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 24, letterSpacing: "0.22em", color, display: "flex", alignItems: "center", gap: 16, opacity: p, ...style }}>
      <span style={{ color: C.terracottaNight }}>{n}</span>
      <span style={{ display: "inline-block", width: 70 * p, height: 1.5, background: color }} />
      <span>{label}</span>
    </div>
  );
};

/** Linha de apoio leve ("o sistema de", "cada dia") acima do título pesado. */
export const Kicker: React.FC<{ text: string; t: number; t0: number; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, t, t0, color = C.nightText, size = 52, style }) => {
  const p = prog(t, t0, 0.5, EASE.out);
  return <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: size, letterSpacing: "-0.02em", color, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, ...style }}>{text}</div>;
};
