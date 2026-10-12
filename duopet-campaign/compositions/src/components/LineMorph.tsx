import React, { useMemo } from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { EASE } from "../theme";
import { prog } from "../lib/anim";

/**
 * Transformação de linha contínua (assinatura do vídeo de referência do cliente: linha → pata → sino → batimento → logo).
 * Aqui: ponto → linha → pata → batimento (saúde) → check (rotina) → anel de progresso do app.
 * Cada forma é amostrada em N pontos pelo comprimento do traço; a transição interpola ponto a ponto.
 * Caixa de desenho: 400×400.
 */
export const SHAPES: Record<string, string> = {
  line: "M 0 200 L 400 200", // y=200: centro exato do canvas, onde termina o ponto do caos
  paw:
    "M 0 300 L 128 300 C 118 255 158 214 200 214 C 242 214 282 255 272 300 C 264 334 228 322 200 322 C 172 322 136 334 128 300 " +
    "L 112 212 A 22 27 -20 1 1 112.5 212.5 L 162 160 A 22 27 -6 1 1 162.5 160.5 L 238 160 A 22 27 6 1 1 238.5 160.5 L 288 212 A 22 27 20 1 1 288.5 212.5 L 400 300",
  pulse: "M 0 220 L 140 220 L 165 160 L 195 300 L 222 110 L 248 245 L 266 220 L 400 220",
  check: "M 0 250 L 120 250 L 175 305 L 290 160 L 400 160",
  ring: "M 200 80 A 120 120 0 1 1 199.9 80",
};

const N = 220;
const sample = (d: string) => {
  const L = getLength(d);
  return Array.from({ length: N }, (_, i) => getPointAtLength(d, (L * i) / (N - 1)));
};

export type MorphKey = { shape: keyof typeof SHAPES; at: number; dur?: number };

export const LineMorph: React.FC<{
  t: number;
  keys: MorphKey[]; // sequência de formas com instante de chegada
  drawOn?: [number, number]; // desenho inicial da 1ª forma (início, duração)
  size?: number; // lado do quadrado no canvas
  x: number;
  y: number;
  stroke?: string;
  width?: number;
  opacity?: number;
  ringFill?: number; // 0..1 preenche o anel como progresso (terracota)
}> = ({ t, keys, drawOn, size = 560, x, y, stroke = "#f4f2ee", width = 5, opacity = 1, ringFill = 0 }) => {
  const pts = useMemo(() => keys.map((k) => sample(SHAPES[k.shape])), [keys.map((k) => k.shape).join(",")]);
  // forma atual = interpolação entre a última chegada e a próxima
  let a = 0;
  for (let i = 0; i < keys.length; i++) if (t >= keys[i].at) a = i;
  const next = Math.min(keys.length - 1, a + 1);
  const p = next === a ? 0 : prog(t, keys[next].at - (keys[next].dur ?? 0.32), keys[next].dur ?? 0.32, EASE.inOut);
  const cur = pts[a].map((q, i) => ({ x: q.x + (pts[next][i].x - q.x) * p, y: q.y + (pts[next][i].y - q.y) * p }));
  const d = "M " + cur.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L ");
  const draw = drawOn ? prog(t, drawOn[0], drawOn[1], EASE.inOut) : 1;
  // cabeça luminosa no ponto de desenho
  const head = cur[Math.max(0, Math.min(N - 1, Math.round(draw * (N - 1))))];
  const s = size / 400;
  const isRing = keys[a].shape === "ring" && p === 0;
  const ringLen = 2 * Math.PI * 120;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", opacity }}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={width / s} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      {isRing && ringFill > 0 && (
        <circle cx={200} cy={200} r={120} fill="none" stroke="#e69a7f" strokeWidth={(width * 1.6) / s} strokeLinecap="round" transform="rotate(-90 200 200)" strokeDasharray={`${ringLen * ringFill} ${ringLen}`} />
      )}
      {draw < 0.999 && (
        <circle cx={head.x} cy={head.y} r={7 / s} fill="#e69a7f" style={{ filter: "drop-shadow(0 0 8px rgba(230,154,127,0.9))" }} />
      )}
    </svg>
  );
};
