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
};
export type Version = { duration: number; frames: number; scenes: Scene[]; vo: any[]; words: Word[]; sfx: any[]; music: any[] };

export const TIMELINE = data as unknown as { fps: number; width: number; height: number; voice: string; versions: Record<string, Version> };

/** Tempo absoluto (s) da versão dentro de uma cena montada com <Sequence from={start}>. */
export const useSceneTime = (scene: Scene) => {
  const f = useCurrentFrame();
  const t = scene.start + f / FPS;
  return { t, local: t - scene.start, dur: scene.end - scene.start, frame: f };
};
