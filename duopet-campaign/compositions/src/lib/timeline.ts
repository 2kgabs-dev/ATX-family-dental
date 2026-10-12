import type { Caption } from "@remotion/captions";
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import data from "../data/timeline.json";
import { FPS } from "./anim";

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
