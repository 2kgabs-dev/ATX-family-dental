import React, { createContext, useContext, useMemo } from "react";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { measureText } from "@remotion/layout-utils";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Legenda palavra a palavra (v3), no formato Caption do @remotion/captions.
 * - Páginas de 1 a 3 palavras: quebras editoriais vêm de build_timeline.py (pageBreakAfter) e
 *   createTikTokStyleCaptions agrupa o resto.
 * - Pílula terracota desliza com mola de uma palavra para a próxima (posições medidas com measureText).
 * - O texto fica branco exatamente onde a pílula passa (camada recortada com clip-path), sem salto de cor.
 * - Placa escura (cenas escuras) ou clara (cenas creme) atrás da página: leitura sobre o celular branco e sobre fotos.
 * - Palavras ainda não ditas ficam esmaecidas; a página entra com "pop" curto.
 * Renderizada dentro da Sequence de cada cena (regra display-captions da skill Remotion).
 */

/** Só mede texto depois que as fontes carregaram (senão measureText guarda larguras erradas no cache). */
export const FontsReady = createContext(false);

const STYLE = { fontFamily: FONT, fontSize: 66, fontWeight: 800 as const, letterSpacing: "-0.025em" };
const GAP = 17; // espaço entre palavras (px)
const PAD_X = 16;
const LEAD_MS = 70; // a página aparece um pouco antes da voz
const HOLD_MS = 380; // a última página da cena fica um pouco depois da última palavra

export type CaptionTheme = "dark" | "light";

// Placa atrás da página: garante leitura sobre o celular branco, fotos e fundos creme
const THEMES: Record<CaptionTheme, { text: string; dim: string; plate: string; plateShadow: string }> = {
  dark: { text: "#f7f5f1", dim: "rgba(247,245,241,0.45)", plate: "rgba(17,33,26,0.86)", plateShadow: "0 18px 40px -18px rgba(0,0,0,0.7)" },
  light: { text: C.forest, dim: "rgba(32,59,45,0.38)", plate: "rgba(255,255,255,0.94)", plateShadow: "0 18px 40px -20px rgba(20,26,22,0.45)" },
};
const PLATE_X = 26;
const H = 96; // altura da linha
const PILL_Y = 10;
const PILL_H = H - PILL_Y * 2;

export const PageCaptions: React.FC<{ captions: Caption[]; t: number; theme: CaptionTheme; y: number }> = ({ captions, t, theme, y }) => {
  const ready = useContext(FontsReady);
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1400, breakOnSilenceAfterMilliseconds: 450 }).pages,
    [captions],
  );
  if (!ready || pages.length === 0) return null;
  const ms = t * 1000;
  const idx = pages.findIndex((p, i) => {
    const last = i === pages.length - 1;
    const end = p.startMs + p.durationMs + (last ? HOLD_MS : 0);
    return ms >= p.startMs - LEAD_MS && ms < end - (last ? 0 : LEAD_MS);
  });
  if (idx < 0) return null;
  const page = pages[idx];
  const isLast = idx === pages.length - 1;
  const th = THEMES[theme];

  // layout medido (mesma fonte, peso e espaçamento do texto renderizado)
  const widths = page.tokens.map((tk) => measureText({ text: tk.text.trim(), ...STYLE }).width);
  const xs: number[] = [];
  widths.reduce((acc, w) => (xs.push(acc), acc + w + GAP), 0);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1);
  const left = 540 - total / 2;

  // palavra ativa = última que já começou
  let act = -1;
  page.tokens.forEach((tk, i) => {
    if (ms >= tk.fromMs - 30) act = i;
  });
  const sp = (fromMs: number, cfg = { damping: 17, stiffness: 260, mass: 0.5 }) =>
    spring({ frame: Math.max(0, ((ms - fromMs) / 1000) * fps), fps, config: cfg });
  const pIn = sp(page.startMs - LEAD_MS, { damping: 14, stiffness: 260, mass: 0.6 });
  const endMs = page.startMs + page.durationMs + HOLD_MS;
  const out = isLast ? interpolate(ms, [endMs - 160, endMs], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  // pílula: desliza da palavra anterior para a ativa; o texto fica branco exatamente onde a pílula está (clip)
  let pill: { x: number; w: number; o: number } | null = null;
  if (act >= 0) {
    const p = sp(page.tokens[act].fromMs - 30);
    const from = act > 0 ? act - 1 : act;
    const grow = act === 0 ? interpolate(p, [0, 1], [0.4, 1]) : 1;
    const w = (interpolate(p, [0, 1], [widths[from], widths[act]]) + PAD_X * 2) * grow;
    const cx = interpolate(p, [0, 1], [xs[from] + widths[from] / 2, xs[act] + widths[act] / 2]);
    pill = { x: left + cx - w / 2, w, o: act === 0 ? Math.min(1, p * 3) : 1 };
  }
  const popScale = act >= 0 ? 1 + 0.06 * (1 - sp(page.tokens[act].fromMs - 30, { damping: 10, stiffness: 320, mass: 0.45 })) : 1;
  const words = (color: string | ((i: number) => string)) =>
    page.tokens.map((tk, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: left + xs[i],
          top: 0,
          height: H,
          lineHeight: `${H}px`,
          whiteSpace: "pre",
          ...STYLE,
          color: typeof color === "string" ? color : color(i),
          scale: String(i === act ? popScale : 1),
          transformOrigin: `${widths[i] / 2}px ${H / 2}px`,
        }}
      >
        {tk.text.trim()}
      </div>
    ));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1080,
        height: H,
        pointerEvents: "none",
        opacity: Math.min(1, pIn * 1.6) * out,
        translate: `0px ${(1 - pIn) * 18}px`,
        scale: String(0.9 + 0.1 * pIn),
        transformOrigin: `540px ${H / 2}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: left - PLATE_X,
          top: -6,
          width: total + PLATE_X * 2,
          height: H + 12,
          borderRadius: 30,
          background: th.plate,
          boxShadow: th.plateShadow,
        }}
      />
      {pill && (
        <div style={{ position: "absolute", left: pill.x, top: PILL_Y, width: pill.w, height: PILL_H, borderRadius: 20, background: C.terracotta, opacity: pill.o }} />
      )}
      {words((i) => (i <= act ? th.text : th.dim))}
      {pill && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: pill.o,
            clipPath: `inset(${PILL_Y}px ${1080 - pill.x - pill.w}px ${H - PILL_Y - PILL_H}px ${pill.x}px round 20px)`,
          }}
        >
          {words("#ffffff")}
        </div>
      )}
    </div>
  );
};
