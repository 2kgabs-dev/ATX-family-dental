import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, EASE, FONT } from "../theme";
import { clamp01, lerp, prog, springAt, wobble } from "../lib/anim";
import { Scene, useSceneTime } from "../lib/timeline";
import { Cutout, Grain, Headline, MotionBlur, NightBG, PaperBG, PaperCard, PillPack, StickyNote, CalendarCard } from "../components/Kit";
import { Icon } from "../components/Icon";
import { KText, Kicker } from "../components/Kinetic";
import { ForestBG } from "../components/World";
import { HojeScreen, PETS, ROUTINE } from "../components/AppUI";
import { Phone, phonePt } from "../components/Phone";

/* ============ HOOK master: "Você organiza a sua rotina inteira… e a do seu pet?" ============ */
const MY_DAY: [string, string, string][] = [
  ["07:00", "Academia", "dumbbell"],
  ["09:00", "Reunião de equipe", "calendar"],
  ["12:30", "Almoço", "utensils"],
  ["15:00", "Enviar relatório", "file"],
  ["18:30", "Mercado", "receipt"],
  ["20:00", "Jantar em família", "heart"],
];

export const Hook: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t, local } = useSceneTime(scene);
  const turn = scene.cues.turn;
  const scatter = prog(t, turn - 0.12, 0.5, EASE.snap);
  const scrollY = -local * 60;
  const pets = springAt(t * 30, turn + 0.05, { damping: 15, stiffness: 110 }, 30);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG />
      {/* "sua rotina" organizada (cards com check) rolando desde o frame 0 */}
      <AbsoluteFill style={{ maskImage: "linear-gradient(180deg, transparent 0px, transparent 640px, #000 760px, #000 1450px, transparent 1650px)", WebkitMaskImage: "linear-gradient(180deg, transparent 0px, transparent 640px, #000 760px, #000 1450px, transparent 1650px)" }}>
        {MY_DAY.map(([time, label], i) => {
          const y0 = 760 + i * 150 + scrollY;
          const ck = prog(t, scene.start + 0.35 + i * 0.38, 0.3, EASE.satisfying);
          const dir = i % 2 ? 1 : -1;
          return (
            <MotionBlur key={i} id={`myday-${i}`} x={scatter > 0 && scatter < 1 ? 28 : 0} y={0} style={{ position: "absolute", left: 150, top: y0, transform: `translate(${scatter * dir * (760 + i * 90)}px, ${scatter * -220}px) rotate(${scatter * dir * 20}deg)`, opacity: 1 - scatter }}>
              <div style={{ width: 780, height: 118, borderRadius: 28, background: "#fff", boxShadow: "0 18px 40px -22px rgba(20,26,22,0.35)", display: "flex", alignItems: "center", padding: "0 34px", gap: 26, fontFamily: FONT, color: C.text }}>
                <div style={{ fontSize: 30, color: C.text2, width: 92, fontVariantNumeric: "tabular-nums" }}>{time}</div>
                <div style={{ flex: 1, fontSize: 40, fontWeight: 600, letterSpacing: "-0.01em" }}>{label}</div>
                <div style={{ width: 56, height: 56, borderRadius: 56, border: `2.5px solid ${ck > 0.1 ? C.forest : "#c9c3b8"}`, background: ck > 0.1 ? `rgba(32,59,45,${ck})` : "transparent", display: "grid", placeItems: "center", transform: `scale(${0.8 + 0.2 * ck})` }}>
                  {ck > 0.2 && <Icon name="check" size={32} color="#fff" stroke={3} />}
                </div>
              </div>
            </MotionBlur>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 300 }}>
        <KText lines={["Sua rotina", "em dia"]} mode="mask" t={t} t0={scene.start - 0.32} size={158} color={C.forest} out={turn - 0.3} />
      </div>
      {t > turn - 0.05 && (
        <div style={{ position: "absolute", left: 80, top: 300 }}>
          <Kicker text="e a do" t={t} t0={turn} color={C.forest} size={66} />
          <KText lines={["Seu pet"]} mode="track" t={t} t0={turn + 0.08} size={196} color={C.forest} dot="?" style={{ marginTop: 6 }} />
        </div>
      )}
      {/* pets espiando sobem da base (abertura do vídeo de referência) */}
      <div style={{ position: "absolute", left: 0, top: lerp(1920, 1560, pets), width: 1080, height: 600, overflow: "hidden" }}>
        <Img src={staticFile("img/peeking.jpg")} style={{ position: "absolute", width: 1180, left: -50, top: -330, mixBlendMode: "multiply" }} />
      </div>
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};

const DogPop: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const s = springAt(t * 30, t0, { damping: 11, stiffness: 120, mass: 0.9 }, 30);
  const y = lerp(1300, 0, s);
  const tilt = wobble(t, 9, 2.5);
  return (
    <div style={{ position: "absolute", left: 40, top: 720, transform: `translateY(${y}px) rotate(${-6 + tilt}deg)`, transformOrigin: "50% 100%" }}>
      <Cutout src="img/dog-fisheye.png" width={1040} />
    </div>
  );
};

/* ============ H1: "Ração, remédio, vacina, consulta… tá tudo onde?" ============ */
export const ITEM_LAYOUT: Record<string, { x: number; y: number; r: number; from: [number, number] }> = {
  ração: { x: 70, y: 640, r: -9, from: [-700, -200] },
  remédio: { x: 600, y: 700, r: 7, from: [800, -300] },
  vacina: { x: 110, y: 1010, r: 5, from: [-800, 400] },
  consulta: { x: 560, y: 1090, r: -6, from: [900, 500] },
};

export const ChaosObject: React.FC<{ k: string }> = ({ k }) => <div style={{ transform: "scale(1.22)", transformOrigin: "0 0" }}>{chaosInner(k)}</div>;
const chaosInner = (k: string) => {
  switch (k) {
    case "ração":
      return <StickyNote lines={["ração 2x", "180g?"]} w={340} />;
    case "remédio":
      return <PillPack w={360} taken={5} />;
    case "vacina":
      return <PaperCard title="CARTEIRA DE VACINAÇÃO" rows={[["V10", "?? / ??"], ["Antirrábica", "mar"]]} w={440} />;
    case "consulta":
      return <StickyNote lines={["vet quinta", "15h??"]} w={330} color="#f2c6b4" />;
    default:
      return null;
  }
};

/** Objeto que entra voando e assenta com overshoot; com desfoque de movimento. */
export const FlyIn: React.FC<{ id: string; t: number; t0: number; x: number; y: number; r: number; from: [number, number]; children: React.ReactNode; out?: { t0: number; to: [number, number] } }> = ({
  id,
  t,
  t0,
  x,
  y,
  r,
  from,
  children,
  out,
}) => {
  if (t < t0 - 0.02) return null;
  const pos = (tt: number) => {
    const p = springAt(tt * 30, t0, { damping: 13, stiffness: 170, mass: 0.8 }, 30);
    let px = lerp(from[0], 0, p);
    let py = lerp(from[1], 0, p);
    if (out) {
      const o = prog(tt, out.t0, 0.62, EASE.suck);
      px = lerp(px, out.to[0] - x, o);
      py = lerp(py, out.to[1] - y, o);
    }
    return [px, py, p];
  };
  const [px, py, p] = pos(t);
  const [nx, ny] = pos(t + 1 / 30);
  const o = out ? prog(t, out.t0, 0.62, EASE.suck) : 0;
  return (
    <MotionBlur id={id} x={(nx - px) * 0.6} y={(ny - py) * 0.6} style={{ position: "absolute", left: x, top: y, transform: `translate(${px}px, ${py}px) rotate(${r * (0.4 + 0.6 * p) + (1 - p) * r * 3 + o * 180}deg) scale(${1 - o * 0.95})`, opacity: 1 - clamp01((o - 0.62) * 3.2) }}>
      {children}
    </MotionBlur>
  );
};

export const HookList: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const keys = ["ração", "remédio", "vacina", "consulta"];
  const items: number[] = scene.cues.items;
  const where = scene.cues.where;
  const cur = items.filter((x) => t >= x).length - 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBG />
      <AbsoluteFill style={{ transform: `translate(${wobble(t, 2, 6)}px, ${wobble(t, 4, 6)}px) rotate(${wobble(t, 6, 0.4)}deg)` }}>
        {keys.map((k, i) => (
          <FlyIn key={k} id={`hl-${k}`} t={t} t0={i === 0 ? Math.min(items[0], scene.start) - 0.2 : items[i]} {...ITEM_LAYOUT[k]}>
            <ChaosObject k={k} />
          </FlyIn>
        ))}
      </AbsoluteFill>
      {t < where &&
        cur >= -1 &&
        keys.map((k, i) =>
          i === Math.max(0, cur) ? (
            <div key={k} style={{ position: "absolute", left: 80, top: 320 }}>
              <KText key={k} lines={[k]} mode="cascade" t={t} t0={i === 0 ? Math.min(items[0], scene.start) - 0.25 : items[i] - 0.05} size={170} dot={i < 3 ? "," : "…"} />
            </div>
          ) : null,
        )}
      {t >= where - 0.02 && (
        <div style={{ position: "absolute", left: 80, top: 300 }}>
          <KText lines={["Tá tudo", "onde"]} mode="track" t={t} t0={where} size={176} dot="?" />
        </div>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

/* ============ H2: "É assim que a rotina do seu pet deveria ficar." (demo no frame 1) ============ */
export const HookDemo: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t, local } = useSceneTime(scene);
  const tap = scene.cues.tap;
  const ck = prog(t, tap, 0.42, EASE.satisfying);
  const ring = lerp(0.6, 0.8, prog(t, tap + 0.12, 0.6, EASE.out));
  const press = interpolate(t, [tap - 0.12, tap, tap + 0.16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const push = prog(t, scene.start, scene.end - scene.start, EASE.soft);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ForestBG cy={1100} />
      <div style={{ position: "absolute", left: 80, top: 292 }}>
        <Kicker text="a rotina do seu pet," t={t} t0={scene.start - 0.3} size={50} />
        <KText lines={["Assim"]} mode="track" t={t} t0={scene.start - 0.1} size={150} style={{ marginTop: 2 }} />
      </div>
      <div style={{ position: "absolute", left: 260, top: 530, transform: `perspective(2400px) rotateX(${8 - push * 4}deg) rotateY(${-10 + push * 6}deg) scale(${1.0 + push * 0.04})`, transformOrigin: "50% 30%" }}>
        <Phone width={560} shadow="0 80px 140px -40px rgba(0,0,0,0.7)">
          <HojeScreen doneP={[1, 1, 1, ck, 0]} ring={ring} next={ck > 0.5 ? "Próximo: 21:00 · Escovação" : "Próximo: 18:00 · Passeio"} press={[0, 0, 0, press, 0]} />
        </Phone>
      </div>
      <Finger t={t} tapT={tap} x={phonePt(260, 530, 560, 337, 482).x} y={phonePt(260, 530, 560, 337, 482).y} />
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

/** Indicador de toque (círculo + onda). */
export const Finger: React.FC<{ t: number; tapT: number; x: number; y: number; from?: [number, number] }> = ({ t, tapT, x, y, from = [140, 260] }) => {
  const arrive = prog(t, tapT - 0.55, 0.5, EASE.inOut);
  const leave = prog(t, tapT + 0.35, 0.4, EASE.inOut);
  const px = x + from[0] * (1 - arrive) + leave * 120;
  const py = y + from[1] * (1 - arrive) + leave * 200;
  const press = interpolate(t, [tapT - 0.08, tapT, tapT + 0.14], [1, 0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripple = prog(t, tapT, 0.55, EASE.out);
  const vis = clamp01(arrive * 3) * (1 - leave);
  if (vis <= 0) return null;
  return (
    <div style={{ position: "absolute", left: px - 46, top: py - 46, width: 92, height: 92, opacity: vis }}>
      {t >= tapT && <div style={{ position: "absolute", inset: -60 * ripple, borderRadius: 300, border: `4px solid rgba(255,255,255,${0.9 * (1 - ripple)})` }} />}
      <div style={{ position: "absolute", inset: 0, borderRadius: 92, background: "rgba(255,255,255,0.55)", border: "3px solid rgba(255,255,255,0.95)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", transform: `scale(${press})`, backdropFilter: "blur(4px)" }} />
    </div>
  );
};

/* ============ H3: "Dois pets, duas rotinas… e quem guarda tudo é a sua cabeça?" ============ */
export const HookMulti: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const two = scene.cues.two;
  const head = scene.cues.head;
  const sDog = springAt(t * 30, scene.start + 0.02, { damping: 12 }, 30);
  const sCat = springAt(t * 30, scene.start + 0.32, { damping: 12 }, 30);
  const jumble = prog(t, two, 0.9, EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBG />
      <div style={{ position: "absolute", left: 80, top: 300 }}>
        {t < head - 0.05 ? (
          <KText lines={["2 pets.", "2 rotinas"]} mode="scatter" t={t} t0={scene.start - 0.25} size={150} accentWords={["2"]} />
        ) : (
          <KText lines={["1 cabeça", "pra tudo"]} mode="mask" t={t} t0={head} size={150} dot="?" />
        )}
      </div>
      <div style={{ position: "absolute", left: -60, top: 640, transform: `translateY(${(1 - sDog) * 900}px) rotate(-8deg)` }}>
        <Cutout src="img/dog-fisheye.png" width={620} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 600, transform: `translateY(${(1 - sCat) * 900}px) rotate(7deg)` }}>
        <Cutout src="img/cat-fisheye.png" width={620} />
      </div>
      {/* duas listas que se embaralham */}
      {(["thor", "mia"] as const).map((p, pi) =>
        ROUTINE[p].slice(0, 4).map((task, i) => {
          const baseX = pi === 0 ? 70 : 560;
          const baseY = 1150 + i * 92;
          const ang = (i * 1.7 + pi * 2.3) % 6.28;
          const jx = Math.cos(ang + t * 2) * 260 * jumble + (pi === 0 ? 220 : -220) * jumble;
          const jy = Math.sin(ang * 1.3 + t * 1.6) * 180 * jumble - 120 * jumble;
          const show = prog(t, scene.start + 0.5 + i * 0.08 + pi * 0.05, 0.35);
          return (
            <div key={p + i} style={{ position: "absolute", left: baseX, top: baseY, transform: `translate(${jx}px, ${jy}px) rotate(${jumble * (ang - 3) * 6}deg)`, opacity: show }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 22, background: pi === 0 ? "rgba(244,242,238,0.95)" : "rgba(230,154,127,0.95)", fontFamily: FONT, fontSize: 30, fontWeight: 600, color: C.text, boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)", width: 400 }}>
                <span style={{ fontSize: 24, opacity: 0.6, width: 76 }}>{task.time}</span>
                <Icon name={task.icon} size={30} color={C.text} />
                {task.title}
              </div>
            </div>
          );
        }),
      )}
      <Grain />
    </AbsoluteFill>
  );
};

/* ============ H4: "Já deu o remédio hoje… ou foi ontem?" ============ */
export const HookPill: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t, local } = useSceneTime(scene);
  const or = scene.cues.or;
  const s = springAt(t * 30, scene.start, { damping: 10, stiffness: 150 }, 30);
  const flip = prog(t, or, 0.45, EASE.inOut);
  const flicker = t > or ? Math.floor((t - or) * 8) % 2 : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBG hue="#2a2a22" />
      <div style={{ position: "absolute", left: 80, top: 300 }}>
        {t < or ? (
          <KText lines={["Já deu o", "remédio hoje"]} mode="type" t={t} t0={scene.start - 0.35} size={124} dot="?" />
        ) : (
          <KText lines={["…ou foi", "ontem"]} mode="rotate3d" t={t} t0={or} size={160} dot="?" />
        )}
      </div>
      <div style={{ position: "absolute", left: 540 - 300, top: 760, transform: `scale(${0.6 + 0.4 * s}) rotate(${-8 + wobble(t, 3, 3) + flip * 16}deg)`, transformOrigin: "50% 50%" }}>
        <PillPack w={600} taken={flicker ? 6 : 5} />
      </div>
      <div style={{ position: "absolute", left: 600, top: 1080, fontFamily: FONT, fontWeight: 800, fontSize: 340, color: C.terracotta, opacity: prog(t, scene.start + 0.35, 0.4), transform: `rotate(${12 + wobble(t, 5, 6)}deg)` }}>?</div>
      <Grain />
    </AbsoluteFill>
  );
};

export { CalendarCard };
