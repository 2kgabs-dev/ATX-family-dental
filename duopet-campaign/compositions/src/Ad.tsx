import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FPS, sec } from "./lib/anim";
import { Scene, TIMELINE } from "./lib/timeline";
import { Captions, SafeZone } from "./components/Kit";
import { Hook, HookDemo, HookList, HookMulti, HookPill } from "./scenes/Hooks";
import { Benefits, Chaos, CTA, Demo, Emotion, MultiPet, Reveal } from "./scenes/Story";

const FONTS: [string, string, string][] = [
  ["Geist", "fonts/Geist-Variable.woff2", "100 900"],
  ["Geist Mono", "fonts/GeistMono-Variable.woff2", "100 900"],
  ["Caveat", "fonts/Caveat-600-latin.woff2", "600"],
];

export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) => {
        const f = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight });
        return f.load().then((ff) => (document.fonts as any).add(ff));
      }),
    )
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const LIGHT = new Set(["Hook", "CTA", "CTA15"]);

const renderScene = (s: Scene, version: string, prev?: Scene) => {
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
      return <Reveal scene={s} />;
    case "Demo":
      return <Demo scene={s} />;
    case "Demo15":
      return <Demo scene={s} compact />;
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

export const Ad: React.FC<AdProps> = ({ version, captions, audio, safe }) => {
  useFonts();
  const v = TIMELINE.versions[version];
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cur = v.scenes.find((s) => t >= s.start && t < s.end) ?? v.scenes[v.scenes.length - 1];
  return (
    <AbsoluteFill style={{ background: "#0e1311" }}>
      {v.scenes.map((s, i) => (
        <Sequence key={s.id} from={sec(s.start)} durationInFrames={sec(s.end) - sec(s.start)} name={s.id}>
          {renderScene(s, version, v.scenes[i - 1])}
        </Sequence>
      ))}
      {captions && <Captions words={v.words} t={t} theme={LIGHT.has(cur.type) ? "light" : "dark"} y={1290} />}
      {audio && <Audio src={staticFile(audio)} />}
      {safe && <SafeZone />}
    </AbsoluteFill>
  );
};
