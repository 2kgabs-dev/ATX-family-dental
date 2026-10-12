import { interpolate, spring, SpringConfig } from "remotion";
import { EASE } from "../theme";

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

/** Progresso 0..1 entre t0 e t0+dur (em segundos), com curva. */
export const prog = (t: number, t0: number, dur: number, ease: (x: number) => number = EASE.out) =>
  ease(Math.min(1, Math.max(0, (t - t0) / dur)));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const mix = (p: number, from: number[], to: number[]) => from.map((v, i) => lerp(v, to[i], p));

/** Mola com início em segundos. */
export const springAt = (frame: number, t0: number, config: Partial<SpringConfig> = {}, fps = FPS) =>
  spring({ frame: frame - t0 * fps, fps, config: { damping: 14, stiffness: 140, mass: 0.9, ...config } });

/** Ruído suave determinístico (soma de senos) para câmera na mão. */
export const wobble = (t: number, seed = 1, amp = 1) =>
  amp *
  (Math.sin(t * 1.7 + seed * 12.9898) * 0.5 +
    Math.sin(t * 3.1 + seed * 78.233) * 0.3 +
    Math.sin(t * 7.3 + seed * 37.719) * 0.2);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Velocidade aproximada (px/frame) de uma função posição(t) para desfoque de movimento. */
export const velocity = (f: (t: number) => number, t: number) => Math.abs(f(t + 1 / FPS) - f(t));

export const fadeInOut = (t: number, inT: number, outT: number, d = 0.25) =>
  interpolate(t, [inT, inT + d, outT - d, outT], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const pseudo = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
