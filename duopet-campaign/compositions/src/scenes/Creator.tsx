import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, EASE, FONT, MONO } from "../theme";
import { FPS, prog, sec } from "../lib/anim";
import { Scene, TIMELINE } from "../lib/timeline";
import { Demo, MultiPet, Reveal, CTA } from "./Story";
import { HojeScreen } from "../components/AppUI";
import { Phone } from "../components/Phone";
import { Grain, NightBG } from "../components/Kit";

/**
 * Modelos de edição com o criador (Japa Dorama). Sem gravação autorizada, mostra um quadro de marcação
 * com a orientação de fala; com `creatorSrc` (arquivo em public/footage/), usa o vídeo real.
 * Nunca inventa fala: o texto do quadro é só orientação, e o criador fala com as próprias palavras.
 */

const Placeholder: React.FC<{ label: string; guide: string; t: number }> = ({ label, guide, t }) => (
  <AbsoluteFill>
    <NightBG hue="#2b3a33" />
    <AbsoluteFill style={{ border: "6px dashed rgba(244,242,238,0.25)", margin: 40, borderRadius: 40 }} />
    <div style={{ position: "absolute", left: 90, right: 90, top: 640, fontFamily: FONT, color: C.nightText }}>
      <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: "0.2em", color: C.terracottaNight }}>{label}</div>
      <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.1, marginTop: 24, letterSpacing: "-0.02em" }}>{guide}</div>
      <div style={{ fontSize: 30, marginTop: 30, opacity: 0.6 }}>Substituir por gravação autorizada do criador (public/footage/). Falas com as palavras dele; sem depoimento inventado.</div>
    </div>
    <Grain />
  </AbsoluteFill>
);

const ARoll: React.FC<{ src?: string; from: number; label: string; guide: string }> = ({ src, from, label, guide }) => {
  const f = useCurrentFrame();
  return src ? <OffthreadVideo src={staticFile(src)} startFrom={sec(from)} style={{ width: 1080, height: 1920, objectFit: "cover" }} /> : <Placeholder label={label} guide={guide} t={f / FPS} />;
};

/** Selo de publicidade: visível desde o 1º frame (Guia CONAR de Influenciadores, 2026). */
const PubliTag: React.FC = () => (
  <div style={{ position: "absolute", left: 60, top: 280, padding: "10px 20px", borderRadius: 14, background: "rgba(14,19,17,0.72)", color: "#fff", fontFamily: FONT, fontWeight: 650, fontSize: 30, letterSpacing: "0.02em" }}>
    Publicidade · DuoPet
  </div>
);

/** Cria uma "cena" sintética para reaproveitar as cenas de produto com tempos próprios. */
const mkScene = (type: string, start: number, end: number, cues: Record<string, any>): Scene => ({
  id: type, type, line: "", start, end, voStart: start, voEnd: end, words: [{ w: "duopet", start: start + 0.5, end: start + 0.9 }], caption: "", cues, captions: [],
});

export const CREATOR_A_FRAMES = sec(30);
export const CREATOR_B_FRAMES = sec(26);

/** Corte A — "Conversa + demonstração": o criador abre e fecha; o produto entra como inserto produzido. */
export const CreatorCutA: React.FC<{ creatorSrc?: string }> = ({ creatorSrc }) => {
  const segs: [number, number, React.ReactNode][] = [
    [0, 4, <ARoll src={creatorSrc} from={0} label="A-ROLL 1 · 0–4 s" guide="Situação do dia a dia com o pet (ex.: a dúvida se alguém já deu o remédio)." />],
    [4, 8.5, <Reveal scene={mkScene("Reveal", 4, 8.5, { impact: 4, brand: 4.7, place: 7.5 })} />],
    [8.5, 12, <ARoll src={creatorSrc} from={4} label="A-ROLL 2 · 8,5–12 s" guide="O que chamou a atenção dele no app (opinião real, depois de usar)." />],
    [12, 18, <Demo scene={mkScene("Demo", 12, 18, { see: 12.2, tap: 14.0, left: 16.6 })} />],
    [18, 21.5, <ARoll src={creatorSrc} from={7.5} label="A-ROLL 3 · 18–21,5 s" guide="Cão e gato? Mostra os pets dele, se tiver." />],
    [21.5, 25, <MultiPet scene={mkScene("MultiPet", 21.5, 25, { switch: 22.4, routine: 23.6 })} />],
    [25, 30, <CTA scene={mkScene("CTA", 25, 30, { logo: 25.2, offer: 26.0, url: 27.0 })} short />],
  ];
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {segs.map(([a, b, node], i) => (
        <Sequence key={i} from={sec(a)} durationInFrames={sec(b) - sec(a)}>
          {node}
        </Sequence>
      ))}
      <PubliTag />
    </AbsoluteFill>
  );
};

/** Corte B — "Tela dividida": o criador em cima o tempo todo (linguagem nativa), o app embaixo. */
export const CreatorCutB: React.FC<{ creatorSrc?: string }> = ({ creatorSrc }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const tap = 9.0;
  const ck = prog(t, tap, 0.42, EASE.satisfying);
  const ring = 0.6 + 0.2 * prog(t, tap + 0.12, 0.7, EASE.out);
  const cta = t >= 21;
  return (
    <AbsoluteFill style={{ background: C.page }}>
      {!cta && (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden" }}>
            {creatorSrc ? (
              <OffthreadVideo src={staticFile(creatorSrc)} style={{ width: 1080, height: 960, objectFit: "cover" }} />
            ) : (
              <div style={{ transform: "scale(0.5)", transformOrigin: "0 0", width: 2160, height: 1920 }}>
                <Placeholder label="A-ROLL CONTÍNUO · 0–21 s" guide="Criador comenta, com as próprias palavras, enquanto usa o app (rotina, check, troca de pet)." t={t} />
              </div>
            )}
          </div>
          <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden", background: C.page }}>
            <div style={{ position: "absolute", left: 300, top: 40 }}>
              <Phone width={480}>
                <HojeScreen doneP={[1, 1, 1, ck, 0]} ring={ring} next={ck > 0.5 ? "Próximo: 21:00 · Escovação" : "Próximo: 18:00 · Passeio"} />
              </Phone>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 940, height: 40, background: C.page, borderTop: `4px solid ${C.terracotta}` }} />
        </>
      )}
      {cta && (
        <Sequence from={sec(21)}>
          <CTA scene={mkScene("CTA", 21, 26, { logo: 21.2, offer: 22.0, url: 23.0 })} short />
        </Sequence>
      )}
      <PubliTag />
    </AbsoluteFill>
  );
};

export { TIMELINE };
