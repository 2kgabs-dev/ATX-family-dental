import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { sec } from "./lib/anim";
import { Scene, SceneOrigin, TIMELINE } from "./lib/timeline";
import { cutBetween } from "./components/Transitions";
import { GlobalGrain, Grain, SafeZone } from "./components/Kit";
import { CaptionTheme, FontsReady, PageCaptions } from "./components/Captions";
import { Hook, HookDemo, HookList, HookMulti, HookPill } from "./scenes/Hooks";
import { Benefits, Chaos, CTA, Demo, Emotion, MultiPet, Reveal } from "./scenes/Story";

const FONTS: [string, string, string][] = [
  ["Geist", "fonts/Geist-Variable.woff2", "100 900"],
  ["Geist Mono", "fonts/GeistMono-Variable.woff2", "100 900"],
  ["Caveat", "fonts/Caveat-600-latin.woff2", "600"],
];

/** Carrega as fontes locais. Devolve `ready`; o render só continua depois que a árvore re-renderizou com as fontes
 * (as legendas medem texto com measureText e não podem medir com a fonte de reserva). */
export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) => {
        const f = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight });
        return f.load().then((ff) => (document.fonts as any).add(ff));
      }),
    )
      .then(() => setReady(true))
      .catch((e) => {
        console.error(e);
        setReady(true);
      });
  }, [handle]);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

// tema e altura da legenda por cena (fundo creme → texto verde; fundo escuro/verde → texto claro)
const LIGHT = new Set(["Hook", "Emotion", "CTA", "CTA15"]);
const captionTheme = (s: Scene): CaptionTheme => (LIGHT.has(s.type) ? "light" : "dark");
const CAPTION_Y: Record<string, number> = {};
const captionY = (s: Scene) => CAPTION_Y[s.type] ?? 1262;

// No cartão final a locução repete o texto da tela (oferta e endereço): a legenda sairia duplicada, então não aparece.
const NO_CAPTIONS = new Set(["CTA", "CTA15"]);

/**
 * Faixa de legenda ÚNICA, acima da TransitionSeries: as transições (mergulho, portal, whip) nunca escalam, desfocam
 * ou duplicam a legenda. As páginas continuam quebradas por cena (pageBreakAfter no fim de cada fala) e a última
 * página de uma cena fica até a primeira da cena seguinte. Tema e altura seguem a cena ativa no quadro.
 */
const CaptionTrack: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const caps = React.useMemo(() => scenes.filter((s) => !NO_CAPTIONS.has(s.type)).flatMap((s) => s.captions), [scenes]);
  const cur = scenes.find((s) => t >= s.start && t < s.end) ?? scenes[scenes.length - 1];
  return <PageCaptions captions={caps} t={t} theme={captionTheme(cur)} y={captionY(cur)} />;
};

// granulação por cena (mesmos valores que as cenas usavam), desenhada uma vez só no topo
const GRAIN: Record<string, number> = { Hook: 0.035, HookDemo: 0.04, Reveal: 0.05, Reveal15: 0.05, Demo: 0.05, Demo15: 0.05, Benefits: 0.05, MultiPet: 0.05, Emotion: 0.05, CTA: 0.035, CTA15: 0.035 };
const GrainTrack: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const t = useCurrentFrame() / 30;
  const cur = scenes.find((s) => t >= s.start && t < s.end) ?? scenes[scenes.length - 1];
  return <Grain opacity={GRAIN[cur.type] ?? 0.07} global />;
};

const renderScene = (s: Scene, version: string, prev?: Scene, next?: Scene) => {
  switch (s.type) {
    case "Hook":
      return <Hook scene={s} />;
    case "HookList":
      return <HookList scene={s} />;
    case "HookDemo":
      return <HookDemo scene={s} />;
    case "HookMulti":
      return <HookMulti scene={s} />;
    case "HookPill":
      return <HookPill scene={s} />;
    case "Chaos":
      return <Chaos scene={s} pre="none" />;
    case "ChaosShort":
      return <Chaos scene={s} pre={prev?.type === "HookList" ? "static" : "fly"} />;
    case "ChaosContrast":
      return <Chaos scene={s} pre="fly" />;
    case "Chaos15":
      return <Chaos scene={s} pre="none" />;
    case "Reveal":
    case "Reveal15":
      return <Reveal scene={s} exitTitle={!!next} />;
    case "Demo":
      return <Demo scene={s} exitClean={!!next} />;
    case "Demo15":
      return <Demo scene={s} compact exitClean={!!next} />;
    case "Benefits":
      return <Benefits scene={s} />;
    case "MultiPet":
      return <MultiPet scene={s} />;
    case "Emotion":
      return <Emotion scene={s} />;
    case "CTA":
      return <CTA scene={s} short={prev?.type !== "Emotion"} />;
    case "CTA15":
      return <CTA scene={s} short />;
    default:
      return null;
  }
};

export type AdProps = { version: string; captions: boolean; audio?: string; safe?: boolean };

/**
 * Montagem com <TransitionSeries> (regra transitions da skill Remotion).
 * A sincronia com a voz não muda: numa Transition de D quadros a cena que sai é estendida em ⌈D/2⌉ e a que entra
 * começa ⌊D/2⌋ antes do seu início (SceneOrigin dá o tempo absoluto do quadro 0 de cada cena). Overlays não mexem na duração.
 */
export const Ad: React.FC<AdProps> = ({ version, captions, audio, safe }) => {
  const ready = useFonts();
  const { fps } = useVideoConfig();
  const v = TIMELINE.versions[version];
  const cuts = v.scenes.map((s, i) => (i < v.scenes.length - 1 ? cutBetween(s, v.scenes[i + 1], version) : null));
  const tDur = cuts.map((c) => (c && c.kind === "transition" ? c.frames : 0));
  const items: React.ReactNode[] = [];
  v.scenes.forEach((s, i) => {
    const pre = i > 0 ? Math.floor(tDur[i - 1] / 2) : 0;
    const begin = sec(s.start) - pre;
    const end = sec(s.end) + (i < v.scenes.length - 1 ? Math.ceil(tDur[i] / 2) : 0);
    items.push(
      <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={end - begin} premountFor={fps}>
        <SceneOrigin.Provider value={begin / fps}>
          {renderScene(s, version, v.scenes[i - 1], v.scenes[i + 1])}
        </SceneOrigin.Provider>
      </TransitionSeries.Sequence>,
    );
    const c = cuts[i];
    if (c?.kind === "transition") {
      items.push(<TransitionSeries.Transition key={`${s.id}-t`} presentation={c.presentation} timing={c.timing} />);
    } else if (c?.kind === "overlay") {
      items.push(
        <TransitionSeries.Overlay key={`${s.id}-o`} durationInFrames={c.frames} offset={c.offset ?? 0} premountFor={fps}>
          {c.render()}
        </TransitionSeries.Overlay>,
      );
    }
  });
  return (
    <FontsReady.Provider value={ready}>
      <AbsoluteFill style={{ background: "#0e1311" }}>
        <GlobalGrain.Provider value={true}>
          <TransitionSeries name={`${version} cenas`}>{items}</TransitionSeries>
        </GlobalGrain.Provider>
        <GrainTrack scenes={v.scenes} />
        {captions && <CaptionTrack scenes={v.scenes} />}
        {audio && <Audio src={staticFile(audio)} />}
        {safe && <SafeZone />}
      </AbsoluteFill>
    </FontsReady.Provider>
  );
};
