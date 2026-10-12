import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, EASE, FONT, MONO } from "../theme";
import { clamp01, lerp, prog, springAt, wobble } from "../lib/anim";
import { Scene, useSceneTime } from "../lib/timeline";
import { CalendarCard, ChatCard, Cutout, Eyebrow, Grain, NightBG, PaperBG, ReceiptCard } from "../components/Kit";
import { Icon } from "../components/Icon";
import { GastosScreen, HojeScreen, PerfilScreen, PlayScreen, SaudeScreen } from "../components/AppUI";
import { Phone, phonePt, phoneHeight } from "../components/Phone";
import { ForestBG } from "../components/World";
import { Chapter, Kicker, KText } from "../components/Kinetic";
import { LineMorph } from "../components/LineMorph";
import { LightLeakOverlay } from "../components/Transitions";
import { ChaosObject, Finger, FlyIn, ITEM_LAYOUT } from "./Hooks";

/** Posição do telefone "herói" (revelação → demonstração → benefícios). */
export const PH = { left: 260, top: 470, width: 560 };
export const PH_CX = PH.left + PH.width / 2;
export const PH_CY = PH.top + phoneHeight(PH.width) / 2;
const CENTER: [number, number] = [540, 900];
const PHONE_SHADOW = "0 90px 150px -40px rgba(0,0,0,0.75), 0 30px 60px -30px rgba(0,0,0,0.55)";

/* ============ CAOS: objetos espalhados que convergem para um ponto ============ */
const EXTRA_LAYOUT: Record<string, { x: number; y: number; r: number; from: [number, number] }> = {
  calendário: { x: 330, y: 600, r: -4, from: [200, -1200] },
  whatsapp: { x: 310, y: 860, r: 4, from: [1100, 300] },
  recibo: { x: 70, y: 1180, r: -7, from: [-900, 600] },
};

export const Chaos: React.FC<{ scene: Scene; pre?: "static" | "fly" | "none" }> = ({ scene, pre = "none" }) => {
  const { t } = useSceneTime(scene);
  const keys: Record<string, number> = scene.cues.keys ?? {};
  const conv = scene.cues.converge;
  const list = ["ração", "remédio", "vacina", "consulta"];
  const listT = (k: string, i: number) => {
    if (keys[k] !== undefined) return keys[k];
    if (pre === "static") return scene.start - 2;
    if (pre === "fly" || keys["espalhados"] !== undefined || keys["cuidados"] !== undefined) return scene.start + 0.05 + i * 0.16;
    return Infinity;
  };
  const extraT: Record<string, number> = {
    calendário: keys["calendário"] ?? (keys["espalhados"] !== undefined ? keys["espalhados"] : Infinity),
    whatsapp: keys["whatsapp"] ?? (keys["espalhados"] !== undefined ? keys["espalhados"] + 0.18 : Infinity),
    recibo: keys["whatsapp"] !== undefined ? keys["whatsapp"] + 0.55 : keys["espalhados"] !== undefined ? keys["espalhados"] + 0.36 : Infinity,
  };
  const head = keys["cabeça"];
  const agitation = head !== undefined ? prog(t, head, 0.6) : 0;
  const shake = 6 + 14 * agitation;
  const out = (k: string) => ({ t0: conv + (k.length % 3) * 0.04, to: CENTER });
  const wordCues: [string, number, string][] = [];
  list.forEach((k, i) => keys[k] !== undefined && wordCues.push([k, keys[k], i < 3 ? "," : "…"]));
  const where: [string, number][] = [];
  if (keys["calendário"] !== undefined) where.push(["Calendário", keys["calendário"]]);
  if (keys["whatsapp"] !== undefined) where.push(["Mensagens", keys["whatsapp"]]);
  if (head !== undefined) where.push(["Memória", head]);
  const curWord = [...wordCues].reverse().find(([, tt]) => t >= tt - 0.06);
  const curWhere = [...where].reverse().find(([, tt]) => t >= tt - 0.06);
  const textOut = conv - 0.1;
  const dot = prog(t, conv + 0.5, 0.25, EASE.out) * (1 + 0.12 * Math.sin((t - conv) * 18) * prog(t, conv + 0.6, 0.2));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBG />
      <AbsoluteFill style={{ transform: `translate(${wobble(t, 2, shake)}px, ${wobble(t, 4, shake)}px) rotate(${wobble(t, 6, 0.4 + agitation)}deg)` }}>
        {list.map((k, i) => {
          const L = ITEM_LAYOUT[k];
          const orbit = agitation * 40;
          return (
            <FlyIn key={k} id={`c-${k}`} t={t} t0={listT(k, i)} x={L.x + wobble(t, i + 11, orbit)} y={L.y + wobble(t, i + 21, orbit)} r={L.r} from={L.from} out={out(k)}>
              <ChaosObject k={k} />
            </FlyIn>
          );
        })}
        {(["calendário", "whatsapp", "recibo"] as const).map((k, i) => {
          const L = EXTRA_LAYOUT[k];
          const orbit = agitation * 50;
          return (
            <FlyIn key={k} id={`c-${k}`} t={t} t0={extraT[k]} x={L.x + wobble(t, i + 31, orbit)} y={L.y + wobble(t, i + 41, orbit)} r={L.r} from={L.from} out={out(k)}>
              {k === "calendário" && <CalendarCard w={440} marks={[3, 9, 12, 15, 23, 28]} />}
              {k === "whatsapp" && (
                <ChatCard
                  w={480}
                  msgs={[
                    { text: "Alguém deu o remédio do Thor?", time: "19:02", me: true },
                    { text: "acho que sim", time: "19:10" },
                    { text: "e a vacina, é quando?", time: "19:11", me: true },
                    { text: "tá na carteirinha… acho", time: "19:30" },
                  ]}
                />
              )}
              {k === "recibo" && <ReceiptCard w={300} />}
            </FlyIn>
          );
        })}
      </AbsoluteFill>
      {head !== undefined && (
        <div style={{ position: "absolute", left: 640, top: 520, fontFamily: FONT, fontWeight: 800, fontSize: 420, color: C.terracotta, opacity: agitation * (1 - prog(t, conv, 0.3)), transform: `rotate(${14 + wobble(t, 8, 8)}deg) scale(${0.7 + 0.3 * agitation})` }}>?</div>
      )}
      {/* tipografia: palavras do caos caem letra a letra (referência do cliente: "REMÉDIO") */}
      <div style={{ position: "absolute", left: 80, top: 300, opacity: 1 - prog(t, textOut, 0.25) }}>
        {curWhere ? (
          <>
            <Eyebrow text="ESPALHADO EM" t={t} t0={where[0][1] - 0.1} />
            <div style={{ marginTop: 18 }}>
              <KText key={curWhere[0]} lines={[curWhere[0]]} mode="cascade" t={t} t0={curWhere[1] - 0.06} size={140} dot={curWhere[0] === "Memória" ? "." : ","} />
            </div>
          </>
        ) : curWord ? (
          <KText key={curWord[0]} lines={[curWord[0]]} mode="cascade" t={t} t0={curWord[1] - 0.06} size={170} dot={curWord[2]} />
        ) : pre !== "none" && keys["espalhados"] === undefined ? (
          <Eyebrow text="ESPALHADO EM" t={t} t0={scene.start} />
        ) : keys["espalhados"] !== undefined ? (
          t >= keys["espalhados"] - 0.06 ? (
            <KText lines={["Tudo", "espalhado"]} mode="scatter" t={t} t0={keys["espalhados"] - 0.1} size={160} dot="?" />
          ) : (
            <KText lines={["Os cuidados", "do seu pet…"]} mode="mask" t={t} t0={scene.start - 0.3} size={120} dot={false} />
          )
        ) : null}
      </div>
      {dot > 0 && (
        <div style={{ position: "absolute", left: CENTER[0] - 40, top: CENTER[1] - 40, width: 80, height: 80, borderRadius: 80, background: C.page, transform: `scale(${dot})`, boxShadow: `0 0 ${80 * dot}px ${30 * dot}px rgba(244,242,238,0.45)` }} />
      )}
      <Grain />
    </AbsoluteFill>
  );
};

const STRETCH = 0.28; // ponto → linha
const DOT_R = 35; // raio do ponto no último quadro do caos (40 px × escala ~0,88)

/* ============ REVELAÇÃO (transição-assinatura) ============
 * ponto → linha → pata → batimento → anel com o logo (referência do cliente) → íris → o app sobe no mundo verde */
export const Reveal: React.FC<{ scene: Scene; exitTitle?: boolean }> = ({ scene, exitTitle }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const kickerT: number = scene.cues.kicker ?? t0 + 1.8;
  const placeT: number = scene.cues.place ?? t0 + 3.2;
  const text: [string, string] = scene.cues.text ?? ["cada cuidado", "No lugar certo"];
  const green = prog(t, t0, 0.55, EASE.inOut);
  const badgeT = t0 + 0.84;
  const badge = springAt(t * 30, badgeT, { damping: 12, stiffness: 160 }, 30);
  const iris = prog(t, t0 + 1.5, 0.7, EASE.camera);
  const rise = springAt(t * 30, t0 + 1.55, { damping: 17, stiffness: 70, mass: 1.1 }, 30);
  const rowsIn = [0, 1, 2, 3, 4].map((i) => prog(t, t0 + 1.9 + i * 0.08, 0.45));
  const glint = prog(t, placeT - 0.2, 1.0, EASE.inOut);
  const stretch = prog(t, t0, STRETCH, EASE.inOut);
  // corte seco para a demonstração: o celular é idêntico dos dois lados; só o título sai antes, por máscara (6 quadros)
  const titleOut = exitTitle ? prog(t, scene.end - 0.2, 0.2, EASE.inOut) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBG />
      <AbsoluteFill style={{ opacity: green }}>
        <ForestBG cy={1100} orbits={iris} particles={0.4 + 0.6 * green} />
      </AbsoluteFill>
      {/* onda de choque fina no impacto (som "impact" no mesmo quadro) */}
      {t < t0 + 0.4 && (
        <div
          style={{
            position: "absolute",
            left: CENTER[0] - lerp(DOT_R, 300, prog(t, t0, 0.4, EASE.out)),
            top: CENTER[1] - lerp(DOT_R, 300, prog(t, t0, 0.4, EASE.out)),
            width: 2 * lerp(DOT_R, 300, prog(t, t0, 0.4, EASE.out)),
            height: 2 * lerp(DOT_R, 300, prog(t, t0, 0.4, EASE.out)),
            borderRadius: 600,
            border: `${lerp(5, 1, prog(t, t0, 0.4))}px solid rgba(244,242,238,${0.55 * (1 - prog(t, t0, 0.4))})`,
          }}
        />
      )}
      {/* match cut com o fim do caos: o mesmo ponto creme (540,900) se estica e vira a linha */}
      {t < t0 + STRETCH && (
        <div
          style={{
            position: "absolute",
            left: CENTER[0] - lerp(DOT_R, 280, stretch),
            top: CENTER[1] - lerp(DOT_R, 2.5, stretch),
            width: lerp(DOT_R * 2, 560, stretch),
            height: lerp(DOT_R * 2, 5, stretch),
            borderRadius: 80,
            background: C.page,
            boxShadow: `0 0 ${lerp(70, 18, stretch)}px ${lerp(26, 4, stretch)}px rgba(244,242,238,${lerp(0.45, 0.25, stretch)})`,
          }}
        />
      )}
      {iris < 1 && t >= t0 + STRETCH && (
        <LineMorph
          t={t}
          x={CENTER[0]}
          y={CENTER[1]}
          size={560}
          opacity={1 - iris}
          keys={[
            { shape: "line", at: t0 },
            { shape: "paw", at: t0 + 0.5, dur: 0.24 },
            { shape: "pulse", at: t0 + 0.68, dur: 0.18 },
            { shape: "ring", at: t0 + 0.84, dur: 0.2 },
          ]}
        />
      )}
      {t > badgeT - 0.02 && iris < 1 && (
        <div style={{ position: "absolute", left: CENTER[0] - 150, top: CENTER[1] - 150, width: 300, height: 300, borderRadius: 300, background: C.page, display: "grid", placeItems: "center", transform: `scale(${badge * (1 + iris * 6)})`, opacity: 1 - iris, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)" }}>
          <Img src={staticFile("img/logo-mark.png")} style={{ height: 170, transform: `rotate(${(1 - badge) * -25}deg)` }} />
        </div>
      )}
      {iris > 0 && iris < 1 && (
        <div style={{ position: "absolute", left: CENTER[0] - lerp(150, 2300, iris), top: CENTER[1] - lerp(150, 2300, iris), width: 2 * lerp(150, 2300, iris), height: 2 * lerp(150, 2300, iris), borderRadius: 4600, border: `${lerp(10, 3, iris)}px solid rgba(244,242,238,${0.85 * (1 - iris)})`, boxSizing: "border-box" }} />
      )}
      {iris > 0 && (
        <AbsoluteFill style={{ clipPath: `circle(${lerp(150, 2300, iris)}px at ${CENTER[0]}px ${CENTER[1]}px)` }}>
          {/* pose final idêntica à do 1º quadro da demonstração (mesma perspectiva e origem): a fusão do corte não "fantasma" */}
          <div style={{ position: "absolute", left: PH.left, top: PH.top, transform: "perspective(2600px) rotateY(0deg) rotateX(3deg)", transformOrigin: "50% 40%" }}>
            <div style={{ transform: `perspective(2200px) translateY(${(1 - rise) * 820}px) rotateX(${(1 - rise) * 32}deg) rotateZ(${(1 - rise) * -6}deg)`, transformOrigin: "50% 100%" }}>
              <Phone width={PH.width} shadow={PHONE_SHADOW} glare={lerp(0.1, 0.9, glint)}>
                <HojeScreen doneP={[1, 1, 1, 0, 0]} ring={0.6 * clamp01(rise)} next="Próximo: 18:00 · Passeio" rowsIn={rowsIn} summaryIn={prog(t, t0 + 1.8, 0.4)} />
              </Phone>
            </div>
          </div>
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", clipPath: `inset(-60px -60px ${titleOut * 100}% -60px)`, translate: `0px ${-titleOut * 36}px` }}>
        {t > kickerT - 0.1 && <Kicker text={text[0]} t={t} t0={kickerT} size={50} />}
        {t > placeT - 0.45 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <KText lines={[text[1]]} mode="mask" t={t} t0={placeT - 0.4} size={96} align="center" />
          </div>
        )}
      </div>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ============ DEMONSTRAÇÃO: 01 — ROTINA · ver → marcar → saber o que falta ============ */
export const Demo: React.FC<{ scene: Scene; compact?: boolean; exitClean?: boolean }> = ({ scene, compact, exitClean }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const see = scene.cues.see;
  const tap = scene.cues.tap;
  const left = scene.cues.left;
  const ck = prog(t, tap, 0.42, EASE.satisfying);
  const ring = lerp(0.6, 0.8, prog(t, tap + 0.12, 0.7, EASE.out));
  const press = interpolate(t, [tap - 0.12, tap, tap + 0.16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hlNext = interpolate(t, [tap - 1.2, tap - 0.8, tap - 0.1, tap + 0.1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clean = exitClean ? prog(t, scene.end - 0.2, 0.2, EASE.inOut) : 0;
  const hlLeft = prog(t, left, 0.4) * (0.75 + 0.25 * Math.sin((t - left) * 8)) * (1 - clean);
  const zIn = prog(t, Math.max(t0 + 0.2, tap - 1.3), 0.8, EASE.camera) * (1 - prog(t, left - 0.5, 0.6, EASE.camera));
  const zoomO = { x: PH_CX, y: 650 }; // origem calculada: título, anel e linha tocada visíveis acima das legendas
  const tilt = prog(t, t0, scene.end - t0, EASE.soft);
  const words: [string, number][] = compact
    ? [
        ["Marque", see - 0.25],
        ["Veja o que falta", left - 0.1],
      ]
    : [
        ["Veja", see - 0.2],
        ["Marque", tap - 0.45],
        ["Saiba o que falta", left - 0.15],
      ];
  const cur = [...words].reverse().find(([, tt]) => t >= tt);
  const tapPt = phonePt(PH.left, PH.top, PH.width, 337, 482);
  const toastIn = springAt(t * 30, tap + 0.45, { damping: 14 }, 30);
  const toastOut = prog(t, Math.min(tap + 2.0, left - 0.4), 0.3, EASE.inOut);
  const toastVis = t > tap + 0.35 ? clamp01(toastIn * 1.5) * (1 - toastOut) : 0;
  const chip = springAt(t * 30, left + 0.1, { damping: 13 }, 30);
  const leftPt = phonePt(PH.left, PH.top, PH.width, 367, 550);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ForestBG cy={1100} />
      <AbsoluteFill style={{ transform: `scale(${1 + zIn * 0.18})`, transformOrigin: `${zoomO.x}px ${zoomO.y}px` }}>
        <div style={{ position: "absolute", left: PH.left, top: PH.top, transform: `perspective(2600px) rotateY(${-9 * tilt}deg) rotateX(${3 + 3 * tilt}deg)`, transformOrigin: "50% 40%" }}>
          <Phone width={PH.width} shadow={PHONE_SHADOW} glare={0.9 - tilt * 0.4}>
            <HojeScreen doneP={[1, 1, 1, ck, 0]} ring={ring} next={ck > 0.5 ? "Próximo: 21:00 · Escovação" : "Próximo: 18:00 · Passeio"} press={[0, 0, 0, press, 0]} highlight={[0, 0, 0, hlNext, hlLeft]} />
          </Phone>
        </div>
        <Finger t={t} tapT={tap} x={tapPt.x} y={tapPt.y} />
        {t > left && (
          <div style={{ position: "absolute", left: leftPt.x - 40, top: leftPt.y - 42, transform: `scale(${chip * (1 - clean)})`, transformOrigin: "0% 50%" }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: "#fff", background: C.terracotta, padding: "12px 24px", borderRadius: 40, boxShadow: "0 18px 36px -14px rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>Falta 1 · 21:00</div>
          </div>
        )}
      </AbsoluteFill>
      {/* pílula branca de conclusão (estilo da referência; texto do toast real do app) */}
      {toastVis > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", transform: `translateY(${(1 - toastIn) * -50 - toastOut * 30}px) scale(${0.9 + 0.1 * toastIn})`, opacity: toastVis }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 30px 18px 18px", borderRadius: 70, background: "#fff", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)", fontFamily: FONT }}>
            <div style={{ width: 52, height: 52, borderRadius: 52, background: C.forest, display: "grid", placeItems: "center" }}>
              <Icon name="check" size={30} color="#fff" stroke={3} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.text }}>Passeio concluído</div>
              <div style={{ fontSize: 22, color: C.text2, marginTop: 3 }}>Agora · Thor · 4 de 5</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 80, right: 60, top: 284, opacity: 1 - toastVis, clipPath: `inset(-60px -60px ${clean * 100}% -60px)`, translate: `0px ${-clean * 36}px` }}>
        <Chapter n="01" label="ROTINA" t={t} t0={t0 + 0.05} />
        {cur && (
          <div style={{ marginTop: 14 }}>
            <KText key={cur[0]} lines={[cur[0]]} mode="type" t={t} t0={cur[1]} size={cur[0].length > 8 ? 86 : 120} />
          </div>
        )}
      </div>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ============ BENEFÍCIOS: capítulos 02/03/04 com giro "chicote" entre telas ============ */
const WhipFlip: React.FC<{ faces: React.ReactNode[]; switches: number[]; t: number; width: number }> = ({ faces, switches, t, width }) => {
  let idx = 0;
  for (let i = 0; i < switches.length; i++) if (t >= switches[i]) idx = i + 1;
  const prevSwitch = idx > 0 ? switches[idx - 1] : -Infinity;
  const p = idx > 0 ? prog(t, prevSwitch, 0.42, EASE.inOut) : 1;
  const half = width / 2;
  const inTrans = idx > 0 && p < 1;
  const blur = inTrans ? Math.sin(Math.PI * p) * 14 : 0;
  const render = (i: number, angle: number) => (
    <div key={i} style={{ position: "absolute", inset: 0, transform: `rotateY(${angle}deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}>
      {faces[i]}
    </div>
  );
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", perspective: 2400, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
      <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `translateZ(${-half}px) rotateY(${inTrans ? -90 * p : 0}deg)` }}>
        {inTrans ? (
          <>
            {render(idx - 1, 0)}
            {render(idx, 90)}
          </>
        ) : (
          render(idx, 0)
        )}
      </div>
    </div>
  );
};

const PhoneFace: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Phone width={PH.width} shadow={PHONE_SHADOW}>
    {children}
  </Phone>
);

const CHAPTERS: { n: string; label: string; verb: string; mode: "rotate3d" | "cascade" | "scatter"; sub: string }[] = [
  { n: "02", label: "SAÚDE", verb: "Cuide", mode: "rotate3d", sub: "Vacinas, remédios e documentos no pet certo." },
  { n: "03", label: "GASTOS", verb: "Controle", mode: "cascade", sub: "Por categoria e por pet." },
  { n: "04", label: "BRINCADEIRAS", verb: "Brinque", mode: "scatter", sub: "Brincadeiras guiadas e sons de brinquedo." },
];

export const Benefits: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const { health, money, play, pets, switch: sw } = scene.cues;
  const phoneH = phoneHeight(PH.width);
  const faces = [
    <PhoneFace key="h">
      <HojeScreen doneP={[1, 1, 1, 1, 0]} ring={0.8} next="Próximo: 21:00 · Escovação" />
    </PhoneFace>,
    <PhoneFace key="s">
      <SaudeScreen inP={[0, 1, 2, 3].map((i) => prog(t, health + 0.3 + i * 0.08, 0.4))} />
    </PhoneFace>,
    <PhoneFace key="g">
      <GastosScreen grow={prog(t, money + 0.3, 0.9, EASE.out)} />
    </PhoneFace>,
    <PhoneFace key="p">
      <PlayScreen eq={t} active={1} inP={prog(t, play + 0.3, 0.4)} />
    </PhoneFace>,
  ];
  const photoP = prog(t, pets, 0.55, EASE.camera);
  const photoOut = prog(t, sw - 0.75, 0.5, EASE.camera);
  const showPhoto = t >= pets && photoOut < 1;
  const pill = prog(t, sw, 0.45, EASE.satisfying);
  const chapterIdx = t >= play ? 2 : t >= money ? 1 : t >= health ? 0 : -1;
  const chT = [health, money, play];
  const perfilPhase = t >= sw - 0.75;
  const card = springAt(t * 30, health + 0.45, { damping: 14, stiffness: 120 }, 30) * (1 - prog(t, money - 0.1, 0.25));
  const orbitP = prog(t, play + 0.2, 0.5);
  const ballP = prog(t, play + 0.35, 1.1, EASE.soft);
  const sc = 1.1;
  const settle = prog(t, scene.start, 0.5, EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ForestBG cy={lerp(1100, 1150, settle)} />
      {!perfilPhase ? (
        <>
          {/* continuidade com o fim da demonstração: o telefone parte da mesma pose (inclinado, escala 1) e assenta durante o 1º giro */}
          <div style={{ position: "absolute", left: PH.left, top: PH.top + 20 * settle, width: PH.width, height: phoneH, transform: `scale(${lerp(1, sc, settle)})`, transformOrigin: "50% 0%" }}>
            <div style={{ position: "absolute", inset: 0, perspective: 2400, transform: `perspective(2600px) rotateY(${-9 * (1 - settle)}deg) rotateX(${6 * (1 - settle)}deg)`, transformOrigin: "50% 40%" }}>
              <WhipFlip t={t} switches={[health, money, play]} width={PH.width} faces={faces} />
            </div>
          </div>
          {card > 0.01 && (
            <div style={{ position: "absolute", left: 90, top: 880, transform: `perspective(1400px) translate(${(1 - card) * 200}px, ${(1 - card) * 60}px) rotateY(${(1 - card) * 40 + 12}deg) scale(${0.7 + 0.3 * card})`, opacity: clamp01(card * 1.5) }}>
              <div style={{ width: 400, padding: "22px 26px", borderRadius: 28, background: "rgba(255,255,255,0.96)", boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7)", fontFamily: FONT }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: C.warningSurface, display: "grid", placeItems: "center" }}>
                    <Icon name="syringe" size={28} color={C.warning} />
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.14em", color: C.text2 }}>PRÓXIMO REFORÇO</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: C.text }}>V10 · Thor</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 26, color: C.terracottaText, fontWeight: 600 }}>Em 12 dias · 12 out</div>
              </div>
            </div>
          )}
          {chapterIdx === 2 &&
            ["volume", "paw", "ball", "heart"].map((ic, i) => {
              const a = t * 0.9 + (i * Math.PI) / 2;
              return (
                <div key={ic} style={{ position: "absolute", left: PH_CX + Math.cos(a) * 420 * orbitP - 46, top: 1080 + Math.sin(a) * 520 * orbitP - 46, width: 92, height: 92, borderRadius: 26, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 20px 40px -18px rgba(0,0,0,0.6)", opacity: orbitP }}>
                  <Icon name={ic} size={42} color={i === 2 ? C.terracotta : C.forest} />
                </div>
              );
            })}
          {chapterIdx === 2 && ballP > 0 && ballP < 1 && (
            <div style={{ position: "absolute", left: lerp(1100, 640, ballP), top: 1460 - Math.abs(Math.sin(ballP * Math.PI * 3)) * 260 * (1 - ballP * 0.6), width: 96, height: 96, borderRadius: 96, background: "radial-gradient(circle at 35% 30%, #f08a62, #c9684a 60%, #9c4a31)", boxShadow: "0 20px 30px -10px rgba(0,0,0,0.5)", transform: `rotate(${ballP * 720}deg)` }}>
              <div style={{ position: "absolute", inset: 10, borderRadius: 96, border: "4px solid rgba(255,255,255,0.75)", borderLeftColor: "transparent", borderRightColor: "transparent" }} />
            </div>
          )}
          {chapterIdx === 2 && (
            <div style={{ position: "absolute", left: 70, top: 1205, transform: `translateY(${(1 - prog(t, play + 0.6, 0.4)) * 40}px)`, opacity: prog(t, play + 0.6, 0.4) * (1 - prog(t, pets - 0.15, 0.2)) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px 14px 14px", borderRadius: 22, background: "#fff", boxShadow: "0 24px 50px -20px rgba(0,0,0,0.6)", fontFamily: FONT }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: C.terracotta, display: "grid", placeItems: "center" }}>
                  <Icon name="paw" size={26} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.14em", color: C.text2 }}>BRINCADEIRA GUIADA</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>Caça ao petisco · 5 min</div>
                </div>
              </div>
            </div>
          )}
          {chapterIdx >= 0 && (
            <div style={{ position: "absolute", left: 80, right: 60, top: 284, opacity: 1 - prog(t, pets - 0.15, 0.2) }}>
              <Chapter key={"c" + chapterIdx} n={CHAPTERS[chapterIdx].n} label={CHAPTERS[chapterIdx].label} t={t} t0={chT[chapterIdx]} />
              <div style={{ marginTop: 12 }}>
                <KText key={"v" + chapterIdx} lines={[CHAPTERS[chapterIdx].verb]} mode={CHAPTERS[chapterIdx].mode} t={t} t0={chT[chapterIdx] - 0.05} size={124} />
              </div>
              <div key={"s" + chapterIdx} style={{ fontFamily: FONT, fontSize: 30, color: "rgba(244,242,238,0.78)", marginTop: 4, opacity: prog(t, chT[chapterIdx] + 0.2, 0.4) }}>
                {CHAPTERS[chapterIdx].sub}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: PH.left, top: PH.top, transform: `scale(${lerp(0.9, 1, photoOut)})`, transformOrigin: "50% 50%" }}>
            <Phone width={PH.width} shadow={PHONE_SHADOW}>
              <PerfilScreen pet={pill > 0.5 ? "mia" : "thor"} pill={pill} />
            </Phone>
          </div>
          {/* CÃO OU GATO. — o terracota passa de CÃO para GATO junto com a troca de pet (referência do cliente) */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 296, display: "flex", justifyContent: "center" }}>
            <KText lines={["Cão ou gato"]} mode="swap" t={t} t0={sw - 0.75} swapAt={sw} size={120} align="center" accentWords={["Cão", "gato"]} />
          </div>
        </>
      )}
      {showPhoto && (
        <AbsoluteFill
          style={{
            clipPath: `inset(${lerp(PH.top + 20, 0, photoP) + photoOut * 600}px ${lerp(1080 - PH.left - PH.width + 20, 0, photoP) + photoOut * 300}px ${lerp(1920 - PH.top - phoneH + 20, 0, photoP) + photoOut * 700}px ${lerp(PH.left + 20, 0, photoP) + photoOut * 300}px round ${lerp(70, 0, photoP) + photoOut * 60}px)`,
          }}
        >
          <PaperBG />
          <Img src={staticFile("img/family.jpg")} style={{ position: "absolute", width: 1990, left: -455, top: 610, mixBlendMode: "multiply", transform: `scale(${1.08 - 0.08 * prog(t, pets, 1.8, EASE.soft)})`, transformOrigin: "50% 40%" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 296, display: "flex", justifyContent: "center" }}>
            <KText lines={["Cada pet", "da casa"]} mode="mask" t={t} t0={pets + 0.1} size={118} color={C.forest} align="center" />
          </div>
        </AbsoluteFill>
      )}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ============ MULTI-PET (performance): "Cão e gato na mesma conta… cada um com a sua rotina." ============ */
export const MultiPet: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const { switch: sw, routine } = scene.cues;
  const pill = prog(t, sw, 0.45, EASE.satisfying);
  const enter = springAt(t * 30, scene.start, { damping: 14 }, 30);
  const phoneH = phoneHeight(PH.width);
  // continuidade com o fim da demonstração: mesma pose e mesma tela; o giro leva ao Perfil
  const settle = prog(t, scene.start, 0.5, EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ForestBG cy={lerp(1100, 1150, settle)} />
      <div style={{ position: "absolute", left: PH.left, top: PH.top, width: PH.width, height: phoneH, perspective: 2400, transform: `perspective(2600px) rotateY(${-9 * (1 - settle)}deg) rotateX(${6 * (1 - settle)}deg)`, transformOrigin: "50% 40%" }}>
        <WhipFlip
          t={t}
          switches={[scene.start + 0.04, routine - 0.1]}
          width={PH.width}
          faces={[
            <PhoneFace key="d">
              <HojeScreen doneP={[1, 1, 1, 1, 0]} ring={0.8} next="Próximo: 21:00 · Escovação" />
            </PhoneFace>,
            <PhoneFace key="p">
              <PerfilScreen pet={pill > 0.5 ? "mia" : "thor"} pill={pill} />
            </PhoneFace>,
            <PhoneFace key="h">
              <HojeScreen pet="mia" doneP={[1, 1, 0, 0, 0]} ring={0.4} next="Próximo: 12:00 · Caixa de areia" rowsIn={[0, 1, 2, 3, 4].map((i) => prog(t, routine + 0.25 + i * 0.07, 0.4))} />
            </PhoneFace>,
          ]}
        />
      </div>
      <div style={{ position: "absolute", left: -170, top: 1040, transform: `translateX(${(1 - enter) * -400}px) rotate(-10deg)` }}>
        <Cutout src="img/dog-fisheye.png" width={480} />
      </div>
      <div style={{ position: "absolute", left: 760, top: 980, transform: `translateX(${(1 - springAt(t * 30, sw, { damping: 12 }, 30)) * 500}px) rotate(9deg)` }}>
        <Cutout src="img/cat-fisheye.png" width={460} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 296, display: "flex", justifyContent: "center" }}>
        {t < routine - 0.1 ? (
          <KText lines={["Cão ou gato"]} mode="swap" t={t} t0={scene.start - 0.1} swapAt={sw} size={120} align="center" accentWords={["Cão", "gato"]} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <Kicker text="cada um com" t={t} t0={routine - 0.1} size={50} />
            <KText lines={["A sua rotina"]} mode="mask" t={t} t0={routine - 0.05} size={96} align="center" />
          </div>
        )}
      </div>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ============ EMOÇÃO: "cada dia MAIS LEVE." (curva da referência) → foto "mais tempo juntos" ============ */
const CURVE = "M 90 1500 C 360 1490 420 1200 560 1090 S 820 830 990 690";
const CURVE_LEN = getLength(CURVE);
const CHIPS: [number, string, string][] = [
  [0.18, "07:00", "Ração"],
  [0.42, "12:00", "Passeio"],
  [0.66, "18:00", "Remédio"],
  [0.88, "21:00", "Brincar"],
];

export const Emotion: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t, frame } = useSceneTime(scene);
  const sceneOrigin = t - frame / 30; // tempo absoluto do quadro 0 desta Sequence
  const t0 = scene.start;
  const warm = scene.cues.warm;
  const drawDur = Math.max(0.6, warm - 0.35 - (t0 + 0.15));
  const draw = prog(t, t0 + 0.15, drawDur, EASE.inOut);
  const headPt = getPointAtLength(CURVE, CURVE_LEN * draw);
  const open = prog(t, warm - 0.15, 0.8, EASE.camera);
  const kb = prog(t, warm, scene.end - warm, EASE.soft);
  const end = getPointAtLength(CURVE, CURVE_LEN);
  const kit = springAt(t * 30, t0 + 0.35, { damping: 16, stiffness: 90 }, 30);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={CURVE} fill="none" stroke="rgba(32,59,45,0.28)" strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" />
        <path d={CURVE} fill="none" stroke={C.forest} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        {CHIPS.map(([f], i) => {
          const q = getPointAtLength(CURVE, CURVE_LEN * f);
          const on = draw >= f;
          return <circle key={i} cx={q.x} cy={q.y} r={14} fill={on ? C.page : "none"} stroke={on ? C.forest : "rgba(32,59,45,0.3)"} strokeWidth={4} />;
        })}
        <circle cx={headPt.x} cy={headPt.y} r={20} fill={C.terracotta} />
      </svg>
      {CHIPS.map(([f, time, label], i) => {
        const q = getPointAtLength(CURVE, CURVE_LEN * f);
        const p = springAt(t * 30, t0 + 0.15 + drawDur * f, { damping: 13, stiffness: 160 }, 30);
        if (draw < f - 0.02) return null;
        return (
          <div key={i} style={{ position: "absolute", left: q.x - 330, top: q.y - 46, width: 300, display: "flex", justifyContent: "flex-end", transform: `scale(${p})`, transformOrigin: "100% 50%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 12px 12px", borderRadius: 18, background: "#fff", boxShadow: "0 18px 36px -18px rgba(20,26,22,0.45)", fontFamily: FONT, whiteSpace: "nowrap" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.forest, display: "grid", placeItems: "center" }}>
                <Icon name="check" size={22} color="#fff" stroke={3} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 22, color: C.text2 }}>{time}</span>
              <span style={{ fontSize: 28, fontWeight: 650, color: C.text }}>{label}</span>
            </div>
          </div>
        );
      })}
      <Img src={staticFile("img/kittens.jpg")} style={{ position: "absolute", width: 720, left: 480, top: 1320 + (1 - kit) * 300, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 80, top: 292 }}>
        <Kicker text="cada dia" t={t} t0={t0 + 0.05} color={C.forest} size={60} />
        <KText lines={["Mais", "leve"]} mode="mask" t={t} t0={t0 + 0.2} size={176} color={C.forest} style={{ marginTop: 4 }} />
      </div>
      {open > 0 && (
        <AbsoluteFill style={{ clipPath: `circle(${lerp(20, 2300, open)}px at ${end.x}px ${end.y}px)` }}>
          <AbsoluteFill style={{ background: "#5f8fbf" }} />
          <Img src={staticFile("img/duo.jpg")} style={{ position: "absolute", width: 1919 * 1.18, left: -379 * 1.18 - 40, top: 190, transform: `scale(${1 + kb * 0.07})`, transformOrigin: "52% 40%" }} />
          <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 80% 20%, rgba(255,190,130,0.35), rgba(255,190,130,0) 70%)", mixBlendMode: "screen" }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(17,33,26,0.3) 0%, rgba(17,33,26,0) 30%, rgba(17,33,26,0) 70%, rgba(17,33,26,0.85) 100%)" }} />
          {/* luz quente sobre a foto no "mais tempo juntos" (lightLeak de @remotion/effects, progresso pelo quadro) */}
          <Sequence from={Math.round((warm - 0.1 - sceneOrigin) * 30)} durationInFrames={36} layout="none">
            <LightLeakOverlay seed={2} hueShift={0} strength={0.42} />
          </Sequence>
          <div style={{ position: "absolute", left: 80, top: 292 }}>
            <Kicker text="mais tempo" t={t} t0={warm + 0.1} color="#fff" size={60} />
            <KText lines={["Juntos"]} mode="track" t={t} t0={warm + 0.2} size={190} color="#fff" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.25)" }} />
          </div>
        </AbsoluteFill>
      )}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ============ CTA (cartão final no estilo da referência do cliente) ============ */
export const CTA: React.FC<{ scene: Scene; short?: boolean }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const { logo, offer, url } = scene.cues;
  const wipe = prog(t, t0, 0.27, (x) => 1 - (1 - x) * (1 - x)); // desacelera: continua a subida que começou antes do corte (8 quadros, ~520 px/quadro no corte, igual à chegada)
  const mark = springAt(t * 30, logo, { damping: 11, stiffness: 140 }, 30);
  const typeSteps = Math.min(6, Math.max(0, Math.floor((t - logo - 0.15) / 0.07)));
  const word = typeSteps / 6;
  const sys = prog(t, logo + 0.55, 0.5, EASE.out);
  const head = prog(t, logo + 0.7, 0.6, EASE.out);
  const offerVis: number = scene.cues.offerVis ?? offer; // nunca antes de o painel terracota sair da frente
  const off = springAt(t * 30, offerVis, { damping: 13, stiffness: 150 }, 30);
  const urlP = prog(t, url - 0.1, 0.55, EASE.out);
  const underline = prog(t, url + 0.15, 0.6, EASE.inOut);
  const fam = springAt(t * 30, offerVis + 0.25, { damping: 16, stiffness: 90 }, 30);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG warm={1} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", translate: `0px ${(1 - wipe) * 90}px` }}>
        <Img src={staticFile("img/logo-mark.png")} style={{ height: 230, transform: `scale(${mark}) rotate(${(1 - mark) * 25}deg)`, opacity: clamp01(mark * 2) }} />
        <div style={{ height: 112, marginTop: 6, clipPath: `inset(0 ${(1 - word) * 100}% 0 0)` }}>
          <Img src={staticFile("img/logo-word.png")} style={{ height: 112 }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.24em", color: C.terracottaText, marginTop: 10, opacity: sys }}>SISTEMA DE GESTÃO PARA CÃES E GATOS</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 58, lineHeight: 1.12, letterSpacing: "-0.03em", color: C.text, textAlign: "center", marginTop: 30, opacity: head, transform: `translateY(${(1 - head) * 26}px)` }}>
          Saiba o que seu pet
          <br />
          precisa <span style={{ color: C.terracottaText }}>hoje.</span>
        </div>
        {/* selo da oferta: pílula sem seta, para não parecer um botão clicável dentro do vídeo */}
        <div style={{ marginTop: 34, padding: "20px 40px", borderRadius: 60, background: C.forest, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 40, display: "flex", alignItems: "center", gap: 14, transform: `scale(${off})`, opacity: clamp01(off * 2), boxShadow: "0 24px 50px -24px rgba(32,59,45,0.8)" }}>
          <Icon name="check" size={34} color="#fff" stroke={3} /> 3 dias grátis · sem cartão
        </div>
        <div style={{ marginTop: 26, position: "relative", opacity: urlP, transform: `translateY(${(1 - urlP) * 30}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 112, letterSpacing: "-0.05em", color: C.forest }}>duopet.site</div>
          <div style={{ position: "absolute", left: 0, bottom: 4, height: 9, borderRadius: 9, width: `${underline * 100}%`, background: C.terracotta }} />
        </div>
        <div style={{ marginTop: 10, fontFamily: FONT, fontSize: 28, color: C.text2, opacity: prog(t, url + 0.4, 0.5) }}>No celular ou no computador · sem instalar</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 1440, width: 1080, height: 480, overflow: "hidden" }}>
        <Img src={staticFile("img/family.jpg")} style={{ position: "absolute", width: 1100, left: -10, top: lerp(500, -40, fam), mixBlendMode: "multiply" }} />
      </div>
      {/* varredura terracota que abre o cartão (referência do cliente) */}
      {wipe < 1 && (
        <AbsoluteFill style={{ transform: `translateY(${-wipe * 2100}px)` }}>
          <AbsoluteFill style={{ background: C.terracotta }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1920, height: 160, background: `linear-gradient(180deg, ${C.terracotta} 0%, rgba(201,104,74,0) 100%)` }} />
        </AbsoluteFill>
      )}
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};
