import type { Caption } from "@remotion/captions";
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import data from "../data/timeline.json";
import { FPS, sec } from "./anim";

export type Word = { w: string; start: number; end: number };
export type Scene = {
  id: string;
  type: string;
  line: string;
  start: number;
  end: number;
  voStart: number;
  voEnd: number;
  words: Word[];
  caption: string;
  cues: Record<string, any>;
  captions: Caption[];
};
export type Version = { duration: number; frames: number; scenes: Scene[]; vo: any[]; words: Word[]; sfx: any[]; music: any[] };

export const TIMELINE = data as unknown as { fps: number; width: number; height: number; voice: string; versions: Record<string, Version> };

/**
 * Tempo absoluto da versão (s) no quadro 0 da Sequence da cena. Com TransitionSeries a cena que entra começa
 * metade da transição antes do corte; com esta origem o tempo das animações (e a sincronia com a voz) não muda.
 * null = Sequence montada exatamente em scene.start (ex.: modelos do criador).
 */
export const SceneOrigin = createContext<number | null>(null);

/** Tempo absoluto (s) da versão dentro da Sequence/TransitionSeries.Sequence de uma cena. */
export const useSceneTime = (scene: Scene) => {
  const f = useCurrentFrame();
  const origin = useContext(SceneOrigin);
  const t = (origin ?? scene.start) + f / FPS;
  return { t, local: t - scene.start, dur: scene.end - scene.start, frame: f };
};

/** Tempo absoluto (s) para fundos e texturas contínuos entre cortes (partículas, órbitas, granulação). */
export const useAbsTime = () => {
  const f = useCurrentFrame();
  const origin = useContext(SceneOrigin);
  return (origin ?? 0) + f / FPS;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0→1 entre os quadros (corte+a) e (corte+b), com corte = sec(s.end). Em quadros: meio quadro (x,25/x,75) não deixa rampa incompleta. */
export const cutRamp = (t: number, s: Scene, a: number, b: number) => clamp01((Math.round(t * FPS) - (sec(s.end) + a)) / (b - a));
/** 0→1 nos n primeiros quadros da cena (vale 0 no quadro do corte). */
export const enterRamp = (t: number, s: Scene, n: number) => clamp01((Math.round(t * FPS) - sec(s.start)) / n);
