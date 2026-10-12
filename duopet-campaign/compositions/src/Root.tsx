import React from "react";
import { Composition } from "remotion";
import { Ad, AdProps } from "./Ad";
import { TIMELINE } from "./lib/timeline";
import { CreatorCutA, CreatorCutB, CREATOR_A_FRAMES, CREATOR_B_FRAMES } from "./scenes/Creator";
import { FontLoader } from "./FontLoader";

// Uma composição por versão × legenda (com/sem). IDs: master-leg, master-sem, perf-h1-leg, ...
export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(TIMELINE.versions).flatMap(([name, v]) =>
      [true, false].map((cap) => {
        const id = `${name.replace("_", "-")}-${cap ? "leg" : "sem"}`;
        return (
          <Composition<any, AdProps>
            key={id}
            id={id}
            component={Ad}
            durationInFrames={v.frames}
            fps={TIMELINE.fps}
            width={TIMELINE.width}
            height={TIMELINE.height}
            defaultProps={{ version: name, captions: cap, audio: undefined, safe: false }}
          />
        );
      }),
    )}
    {/* Modelos com o criador (Japa Dorama): animatic com marcações até haver gravação autorizada */}
    <Composition id="criador-a" component={() => (<><FontLoader /><CreatorCutA /></>)} durationInFrames={CREATOR_A_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="criador-b" component={() => (<><FontLoader /><CreatorCutB /></>)} durationInFrames={CREATOR_B_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
