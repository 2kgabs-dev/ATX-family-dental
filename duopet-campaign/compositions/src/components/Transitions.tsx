import React from "react";
import { AbsoluteFill, interpolate, Solid, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, springTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { lightLeak } from "@remotion/effects/light-leak";
import type { Scene } from "../lib/timeline";
import { C, EASE } from "../theme";

/**
 * Transições entre cenas (v3), montadas com <TransitionSeries> (regras transitions + light-leaks da skill Remotion).
 * Só usa efeitos de CSS/canvas que renderizam no Chromium headless com SwiftShader: as apresentações WebGL do pacote
 * (zoomBlur, crossZoom…) exigem HTML-in-canvas (Chrome 149+) e não estão disponíveis aqui.
 * O tipo de transição de cada corte vem de timeline.json (build_timeline.py), que também posiciona os efeitos sonoros.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type P<T extends Record<string, unknown>> = TransitionPresentationComponentProps<T>;

/* ---------- zoom através de um ponto (ex.: o "?" do gancho) ---------- */
type ZoomThroughProps = { x: number; y: number; color: string };
const ZoomThrough: React.FC<P<ZoomThroughProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { x, y, color } = passedProps;
  if (presentationDirection === "exiting") {
    // a cena que sai acelera para dentro do ponto até a cor dele tomar a tela
    const z = EASE.snap(Math.min(1, p / 0.55));
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill style={{ scale: String(1 + 11 * z), transformOrigin: `${x}px ${y}px` }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ background: color, opacity: interpolate(p, [0.3, 0.52], [0, 1], clamp) }} />
      </AbsoluteFill>
    );
  }
  // a cena que entra abre em círculo a partir do mesmo ponto
  const o = EASE.out(interpolate(p, [0.5, 1], [0, 1], clamp));
  if (p < 0.5) return null;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${o * 2300}px at ${x}px ${y}px)` }}>
      <AbsoluteFill style={{ scale: String(1.18 - 0.18 * o), transformOrigin: `${x}px ${y}px` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
export const zoomThrough = (props: ZoomThroughProps): TransitionPresentation<ZoomThroughProps> => ({ component: ZoomThrough, props });

/* ---------- whip pan com desfoque direcional (filtro SVG só nos quadros da transição) ---------- */
type WhipProps = { dir: "left" | "right" | "up" | "down" };
const Whip: React.FC<P<WhipProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { dir } = passedProps;
  const e = EASE.inOut(p);
  const horiz = dir === "left" || dir === "right";
  const sign = dir === "left" || dir === "up" ? -1 : 1;
  const size = horiz ? 1080 : 1920;
  const off = presentationDirection === "exiting" ? sign * e * size : -sign * (1 - e) * size;
  const blur = Math.sin(Math.PI * p) * 46;
  const id = `whip-${presentationDirection}`;
  return (
    <AbsoluteFill style={{ translate: horiz ? `${off}px 0px` : `0px ${off}px`, filter: blur > 1 ? `url(#${id})` : undefined }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={horiz ? `${blur} 0` : `0 ${blur}`} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};
export const whip = (props: WhipProps): TransitionPresentation<WhipProps> => ({ component: Whip, props });

/* ---------- folha que sobe (verde → creme): a cena nova chega como uma página por cima ---------- */
type SheetProps = Record<string, never>;
const Sheet: React.FC<P<SheetProps>> = ({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill style={{ translate: `0px ${-p * 260}px`, scale: String(1 - 0.06 * p), transformOrigin: "50% 0%" }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ background: "#000", opacity: 0.45 * p }} />
      </AbsoluteFill>
    );
  }
  const r = (1 - p) * 70;
  return (
    <AbsoluteFill
      style={{
        translate: `0px ${(1 - p) * 1920}px`,
        borderTopLeftRadius: r,
        borderTopRightRadius: r,
        overflow: "hidden",
        boxShadow: p < 1 ? "0 -40px 80px -20px rgba(0,0,0,0.55)" : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const sheet = (): TransitionPresentation<SheetProps> => ({ component: Sheet, props: {} });


/* ---------- portal de tela: a tela do celular vira o mundo da próxima cena ----------
 * A cena que sai empurra a câmera para dentro da tela; a que entra aparece recortada exatamente no retângulo
 * da tela e cresce junto até cobrir o quadro (creme da interface → papel creme). */
type PortalProps = { x: number; y: number; w: number; h: number; r: number };
const Portal: React.FC<P<PortalProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { x, y, w, h, r } = passedProps;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const maxS = Math.max(1080 / w, 1920 / h) * 1.04;
  const e = EASE.inOut(p);
  const s = 1 + (maxS - 1) * e;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ scale: String(s), transformOrigin: `${cx}px ${cy}px` }}>{children}</AbsoluteFill>;
  }
  const L = cx - (w / 2) * s;
  const T = cy - (h / 2) * s;
  const R = 1080 - (cx + (w / 2) * s);
  const B = 1920 - (cy + (h / 2) * s);
  const rad = r * s * (1 - e);
  return (
    <AbsoluteFill style={{ clipPath: `inset(${Math.max(0, T)}px ${Math.max(0, R)}px ${Math.max(0, B)}px ${Math.max(0, L)}px round ${rad}px)`, opacity: interpolate(p, [0, 0.28], [0, 1], clamp) }}>
      {children}
    </AbsoluteFill>
  );
};
export const screenPortal = (props: PortalProps): TransitionPresentation<PortalProps> => ({ component: Portal, props });

/* ---------- varredura de cor (abre o cartão final, como na referência do cliente) ----------
 * 1ª metade: um painel terracota sobe e cobre a cena que sai. No corte, a cena que entra (CTA) começa com o
 * próprio painel cheio e continua a varredura para cima: a emenda é invisível. */
type WipeProps = { color: string };
const ColorWipe: React.FC<P<WipeProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "entering") return p < 0.5 ? null : <AbsoluteFill>{children}</AbsoluteFill>;
  // acelera (quadrática) até cobrir no corte; o CTA continua a subida desacelerando: velocidade casada nos dois lados
  const k = Math.min(1, p / 0.5);
  const up = k * k;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ translate: `0px ${-up * 120}px` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ translate: `0px ${(1 - up) * 2080}px` }}>
        {/* borda de ataque em degradê: faz o papel do desfoque de movimento, sem filtro */}
        <div style={{ position: "absolute", left: 0, right: 0, top: -160, height: 160, background: `linear-gradient(180deg, rgba(201,104,74,0) 0%, ${passedProps.color} 100%)` }} />
        <AbsoluteFill style={{ background: passedProps.color }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const colorWipe = (props: WipeProps): TransitionPresentation<WipeProps> => ({ component: ColorWipe, props });

/* ---------- light leak (overlay no corte; não muda a duração) ---------- */
export const LightLeakOverlay: React.FC<{ seed?: number; hueShift?: number; strength?: number }> = ({ seed = 0, hueShift = 0, strength = 0.6 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: strength, pointerEvents: "none" }}>
      <Solid
        width={width}
        height={height}
        premountFor={fps}
        effects={[lightLeak({ seed, hueShift, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp) })]}
      />
    </AbsoluteFill>
  );
};

/* ---------- registro: corte descrito em timeline.json → Transition / Overlay ---------- */
export type CutSpec = { preset: string; frames: number; params?: Record<string, any> };

export type Cut =
  | { kind: "transition"; frames: number; presentation: TransitionPresentation<any>; timing: TransitionTiming }
  | { kind: "overlay"; frames: number; offset?: number; render: () => React.ReactNode }
  | null;

export const cutBetween = (a: Scene & { cutAfter?: CutSpec | null }, _b: Scene, _version: string): Cut => {
  const c = a.cutAfter;
  if (!c) return null;
  const q = c.params ?? {};
  const lin = linearTiming({ durationInFrames: c.frames });
  switch (c.preset) {
    case "zoomThrough":
      return { kind: "transition", frames: c.frames, presentation: zoomThrough({ x: q.x, y: q.y, color: q.color ?? C.terracotta }), timing: lin };
    case "whip":
      return { kind: "transition", frames: c.frames, presentation: whip({ dir: q.dir ?? "left" }), timing: lin };
    case "portal":
      return { kind: "transition", frames: c.frames, presentation: screenPortal({ x: q.x, y: q.y, w: q.w, h: q.h, r: q.r }), timing: lin };
    case "sheet":
      return { kind: "transition", frames: c.frames, presentation: sheet(), timing: springTiming({ config: { damping: 200 }, durationInFrames: c.frames }) };
    case "colorWipe":
      return { kind: "transition", frames: c.frames, presentation: colorWipe({ color: q.color ?? C.terracotta }), timing: lin };
    case "fade":
      return { kind: "transition", frames: c.frames, presentation: fade(), timing: lin };
    case "lightLeak":
      return { kind: "overlay", frames: c.frames, offset: q.offset ?? 0, render: () => <LightLeakOverlay seed={q.seed ?? 0} hueShift={q.hueShift ?? 0} strength={q.strength ?? 0.6} /> };
    default:
      return null;
  }
};
