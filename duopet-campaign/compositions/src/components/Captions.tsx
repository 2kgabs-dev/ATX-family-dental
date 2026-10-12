import React, { createContext, useContext, useMemo } from "react";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { measureText } from "@remotion/layout-utils";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Legenda cinética (v3.1), no estilo das referências enviadas pelo cliente (anúncios de app em motion design):
 * em vez de uma placa de legenda, as palavras faladas APARECEM uma a uma (desfoque → nítido, subindo um pouco),
 * em peso médio, e só a palavra-chave da página ganha destaque: terracota, mais pesada e com um sublinhado
 * desenhado à mão que se traça quando ela é dita.
 * - Formato Caption do @remotion/captions; páginas de 1 a 3 palavras (pageBreakAfter de build_timeline.py) agrupadas
 *   com createTikTokStyleCaptions.
 * - Leitura sem placa: um halo difuso (gradiente radial) atrás da página, escuro nas cenas escuras e claro nas creme.
 * - Posições medidas com measureText do @remotion/layout-utils, só depois de as fontes carregarem.
 */

/** Só mede texto depois que as fontes carregaram (senão measureText guarda larguras erradas no cache). */
export const FontsReady = createContext(false);

const BASE = { fontFamily: FONT, fontSize: 68, letterSpacing: "-0.03em" };
const W_NORMAL = 560;
const W_KEY = 800;
const GAP = 18; // espaço entre palavras (px)
const LEAD_MS = 60; // a palavra aparece um pouco antes da voz
const HOLD_MS = 380; // a última página fica um pouco depois da última palavra
const H = 96;

export type CaptionTheme = "dark" | "light";

const THEMES: Record<CaptionTheme, { text: string; key: string; halo: string; shadow: string }> = {
  dark: { text: "#f7f5f1", key: "#ef9070", halo: "rgba(9,16,12,0.8)", shadow: "0 2px 6px rgba(0,0,0,0.75), 0 0 26px rgba(0,0,0,0.6)" },
  light: { text: C.forest, key: C.terracottaText, halo: "rgba(255,255,255,0.92)", shadow: "0 1px 12px rgba(255,255,255,0.95)" },
};

const STOP = new Set("a o as os e de do da dos das no na nos nas em um uma que seu sua pra com ou é até ao à num se você".split(" "));
const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}.]/gu, "");

/** Palavra-chave da página: a palavra de conteúdo mais longa (empate → a última). */
const keyIndex = (words: string[]) => {
  let best = -1;
  let len = 0;
  words.forEach((w, i) => {
    const c = clean(w);
    if (STOP.has(c) || c.length < 4) return;
    if (c.length >= len) {
      best = i;
      len = c.length;
    }
  });
  return best;
};

/** Sublinhado "feito à mão": curva leve sob a palavra, traçada da esquerda para a direita. */
const Swoosh: React.FC<{ x: number; w: number; y: number; p: number; color: string }> = ({ x, w, y, p, color }) => {
  const d = `M ${x - 6} ${y + 4} C ${x + w * 0.3} ${y - 6}, ${x + w * 0.7} ${y + 10}, ${x + w + 8} ${y - 2}`;
  return (
    <svg width={1080} height={H + 40} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

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
  const th = THEMES[theme];
  const words = page.tokens.map((tk) => tk.text.trim());
  const key = keyIndex(words);

  // layout medido: a página é centrada pelo seu tamanho final (as palavras entram no lugar, sem empurrar as outras)
  const widths = words.map((w, i) => measureText({ text: w, ...BASE, fontWeight: String(i === key ? W_KEY : W_NORMAL) }).width);
  const xs: number[] = [];
  widths.reduce((acc, w) => (xs.push(acc), acc + w + GAP), 0);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1);
  const left = 540 - total / 2;

  const isLast = idx === pages.length - 1;
  const endMs = page.startMs + page.durationMs + HOLD_MS;
  const out = isLast ? interpolate(ms, [endMs - 180, endMs], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const sp = (fromMs: number, cfg: { damping: number; stiffness: number; mass: number }) =>
    spring({ frame: Math.max(0, ((ms - fromMs) / 1000) * fps), fps, config: cfg });
  const haloIn = sp(page.startMs - LEAD_MS, { damping: 20, stiffness: 160, mass: 0.6 });

  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: H, pointerEvents: "none", opacity: out }}>
      {/* halo difuso para leitura (sem placa) */}
      <div
        style={{
          position: "absolute",
          left: left - 150,
          top: -70,
          width: total + 300,
          height: H + 140,
          background: `radial-gradient(closest-side, ${th.halo}, rgba(0,0,0,0))`,
          opacity: haloIn,
        }}
      />
      {page.tokens.map((tk, i) => {
        const start = tk.fromMs - LEAD_MS;
        if (ms < start) return null; // a palavra só existe depois de dita
        const p = sp(start, { damping: 16, stiffness: 220, mass: 0.55 });
        const isKey = i === key;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: left + xs[i],
              top: 0,
              height: H,
              lineHeight: `${H}px`,
              whiteSpace: "pre",
              ...BASE,
              fontWeight: isKey ? W_KEY : W_NORMAL,
              color: isKey ? th.key : th.text,
              textShadow: th.shadow,
              opacity: Math.min(1, p * 1.4),
              translate: `0px ${(1 - p) * 22}px`,
              filter: p < 0.97 ? `blur(${(1 - p) * 9}px)` : undefined,
            }}
          >
            {words[i]}
          </div>
        );
      })}
      {key >= 0 && ms >= page.tokens[key].fromMs && (
        <Swoosh
          x={left + xs[key]}
          w={widths[key]}
          y={H - 10}
          p={interpolate(ms, [page.tokens[key].fromMs, page.tokens[key].fromMs + 320], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          color={th.key}
        />
      )}
    </div>
  );
};
