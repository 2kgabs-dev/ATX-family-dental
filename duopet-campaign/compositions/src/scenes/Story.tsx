import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, EASE, FONT, MONO, SHADOW } from "../theme";
import { clamp01, lerp, prog, springAt, wobble } from "../lib/anim";
import { Scene, useSceneTime } from "../lib/timeline";
import { CalendarCard, ChatCard, Cutout, Eyebrow, Grain, Headline, NightBG, PaperBG, ReceiptCard } from "../components/Kit";
import { Icon } from "../components/Icon";
import { GastosScreen, HojeScreen, PerfilScreen, PlayScreen, SaudeScreen, Toast } from "../components/AppUI";
import { Phone, phonePt, phoneHeight } from "../components/Phone";
import { ChaosObject, Finger, FlyIn, ITEM_LAYOUT } from "./Hooks";

/** Posição do telefone "herói" (revelação → demonstração → benefícios). */
export const PH = { left: 260, top: 470, width: 560 };
export const PH_CX = PH.left + PH.width / 2;
export const PH_CY = PH.top + phoneHeight(PH.width) / 2;
const CENTER: [number, number] = [540, 900];

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
  // tipografia: palavra-chave atual
  const wordCues: [string, number, string | boolean][] = [];
  list.forEach((k, i) => keys[k] !== undefined && wordCues.push([k, keys[k], i < 3 ? "," : "…"]));
  const where: [string, number][] = [];
  if (keys["calendário"] !== undefined) where.push(["Calendário,", keys["calendário"]]);
  if (keys["whatsapp"] !== undefined) where.push(["Mensagens,", keys["whatsapp"]]);
  if (head !== undefined) where.push(["Memória.", head]);
  const curWord = [...wordCues].reverse().find(([, tt]) => t >= tt);
  const curWhere = [...where].reverse().find(([, tt]) => t >= tt);
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
      {/* "?" de agitação */}
      {head !== undefined && (
        <div style={{ position: "absolute", left: 640, top: 520, fontFamily: FONT, fontWeight: 800, fontSize: 420, color: C.terracotta, opacity: agitation * (1 - prog(t, conv, 0.3)), transform: `rotate(${14 + wobble(t, 8, 8)}deg) scale(${0.7 + 0.3 * agitation})` }}>?</div>
      )}
      {/* tipografia */}
      <div style={{ position: "absolute", left: 80, top: 300, opacity: 1 - prog(t, textOut, 0.25) }}>
        {curWhere ? (
          <>
            <Eyebrow text="ESPALHADO EM" t={t} t0={where[0][1] - 0.1} />
            <div style={{ marginTop: 18 }}>
              <Headline key={curWhere[0]} lines={[curWhere[0].replace(/[.,]$/, "")]} t={t} t0={curWhere[1]} size={140} dot={curWhere[0].endsWith(".") ? "." : ","} stagger={0} />
            </div>
          </>
        ) : curWord ? (
          <Headline key={curWord[0]} lines={[curWord[0]]} t={t} t0={curWord[1]} size={170} dot={curWord[2]} stagger={0} />
        ) : pre !== "none" && keys["espalhados"] === undefined ? (
          <Eyebrow text="ESPALHADO EM" t={t} t0={scene.start} />
        ) : keys["espalhados"] !== undefined ? (
          t >= keys["espalhados"] ? (
            <Headline lines={["Tudo", "espalhado?"]} t={t} t0={keys["espalhados"]} size={160} dot={false} accentWords={["espalhado?"]} />
          ) : (
            <Headline lines={["Os cuidados", "do seu pet…"]} t={t} t0={scene.start - 0.18} size={120} dot={false} />
          )
        ) : null}
      </div>
      {/* ponto de luz onde tudo convergiu (continua na revelação) */}
      {dot > 0 && (
        <div style={{ position: "absolute", left: CENTER[0] - 40, top: CENTER[1] - 40, width: 80, height: 80, borderRadius: 80, background: C.page, transform: `scale(${dot})`, boxShadow: `0 0 ${80 * dot}px ${30 * dot}px rgba(244,242,238,0.45)` }} />
      )}
      <Grain />
    </AbsoluteFill>
  );
};

/* ============ REVELAÇÃO: o ponto vira a tela; tudo se organiza; câmera recua e revela o telefone ============ */
export const Reveal: React.FC<{ scene: Scene; doneDefault?: number[] }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const wipe = prog(t, t0, 0.75, EASE.inOut);
  const pull = prog(t, t0 + 0.55, 1.25, EASE.camera);
  const camScale = lerp(2.35, 1, pull);
  const brandT = scene.cues.brand;
  const logo = springAt(t * 30, brandT - 0.05, { damping: 12, stiffness: 150 }, 30);
  const word = prog(t, brandT + 0.1, 0.6, EASE.out);
  // linhas: saem do centro e assentam nos lugares
  const rowsDone = [1, 1, 1, 0, 0];
  const centerScreen = { x: 195, y: (900 - PH.top - 19) / 1.3383 };
  const rowStyle = (i: number): React.CSSProperties => {
    const p = springAt(t * 30, t0 + 0.18 + i * 0.09, { damping: 16, stiffness: 150 }, 30);
    const targetY = 249 + i * 68 + 29;
    const dy = (centerScreen.y - targetY) * (1 - p);
    const rot = (1 - p) * (i % 2 ? 8 : -8);
    return { transform: `translateY(${dy}px) rotate(${rot}deg) scale(${0.35 + 0.65 * p})`, opacity: clamp01(p * 2.5) };
  };
  const summaryIn = prog(t, t0 + 0.6, 0.5);
  const headerIn = prog(t, t0 + 0.8, 0.5);
  const placeT = scene.cues.place;
  const glint = prog(t, placeT - 0.1, 0.9, EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBG />
      <AbsoluteFill style={{ clipPath: `circle(${lerp(40, 2300, wipe)}px at ${CENTER[0]}px ${CENTER[1]}px)` }}>
        <PaperBG />
        <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: `${PH_CX}px ${PH_CY}px` }}>
          <div style={{ position: "absolute", left: PH.left, top: PH.top, transform: `perspective(2600px) rotateX(${(1 - pull) * 6}deg)` }}>
            <Phone width={PH.width} shadow={SHADOW.xl} glare={lerp(0.1, 0.9, glint)}>
              <HojeScreen doneP={rowsDone} ring={0.6 * summaryIn} next="Próximo: 18:00 · Passeio" rowStyle={rowStyle} summaryIn={summaryIn} headerIn={headerIn} />
            </Phone>
          </div>
        </AbsoluteFill>
        {/* logo */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 296, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          <Img src={staticFile("img/logo-mark.png")} style={{ height: 136, transform: `scale(${logo}) rotate(${(1 - logo) * -20}deg)`, opacity: clamp01(logo * 2) }} />
          <div style={{ overflow: "hidden", width: 330 * word }}>
            <Img src={staticFile("img/logo-word.png")} style={{ height: 84, transform: `translateX(${(1 - word) * -60}px)`, display: "block" }} />
          </div>
        </div>
      </AbsoluteFill>
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

/* ============ DEMONSTRAÇÃO: ver → marcar → saber o que falta ============ */
export const Demo: React.FC<{ scene: Scene; compact?: boolean }> = ({ scene, compact }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const see = scene.cues.see;
  const tap = scene.cues.tap;
  const left = scene.cues.left;
  const ck = prog(t, tap, 0.42, EASE.satisfying);
  const ring = lerp(0.6, 0.8, prog(t, tap + 0.12, 0.7, EASE.out));
  const press = interpolate(t, [tap - 0.12, tap, tap + 0.16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hlNext = interpolate(t, [tap - 1.2, tap - 0.8, tap - 0.1, tap + 0.1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hlLeft = prog(t, left, 0.4) * (0.75 + 0.25 * Math.sin((t - left) * 8));
  // câmera: leve rotação 3D + aproximação no anel após o toque
  // câmera: aproxima ANTES do toque (a ação acontece grande na tela) e recua antes de "falta"
  const zIn = prog(t, Math.max(t0 + 0.2, tap - 1.3), 0.8, EASE.camera) * (1 - prog(t, left - 0.5, 0.6, EASE.camera));
  const ringPt = { x: PH_CX, y: 650 }; // origem calculada: título, anel e linha tocada ficam visíveis acima das legendas
  const tilt = prog(t, t0, scene.end - t0, EASE.soft);
  const logoOut = 1 - prog(t, t0, 0.3);
  const words: [string, number][] = compact
    ? [
        ["Marque", see],
        ["Veja o que falta", left],
      ]
    : [
        ["Veja", see],
        ["Marque", tap - 0.35],
        ["Saiba o que falta", left],
      ];
  const cur = [...words].reverse().find(([, tt]) => t >= tt - 0.02);
  const tapPt = phonePt(PH.left, PH.top, PH.width, 337, 482);
  const toastIn = springAt(t * 30, tap + 0.5, { damping: 14 }, 30);
  const toastOut = prog(t, Math.min(tap + 2.2, left - 0.35), 0.3, EASE.inOut);
  const chip = springAt(t * 30, left + 0.1, { damping: 13 }, 30);
  const leftPt = phonePt(PH.left, PH.top, PH.width, 367, 550);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG />
      <AbsoluteFill style={{ transform: `scale(${1 + zIn * 0.18})`, transformOrigin: `${ringPt.x}px ${ringPt.y}px` }}>
        <div style={{ position: "absolute", left: PH.left, top: PH.top, transform: `perspective(2600px) rotateY(${-9 * tilt}deg) rotateX(${4 * tilt}deg)`, transformOrigin: "50% 40%" }}>
          <Phone width={PH.width} shadow={SHADOW.xl} glare={0.9 - tilt * 0.4}>
            <HojeScreen
              doneP={[1, 1, 1, ck, 0]}
              ring={ring}
              next={ck > 0.5 ? "Próximo: 21:00 · Escovação" : "Próximo: 18:00 · Passeio"}
              press={[0, 0, 0, press, 0]}
              highlight={[0, 0, 0, hlNext, hlLeft]}
            />
          </Phone>
        </div>
        <Finger t={t} tapT={tap} x={tapPt.x} y={tapPt.y} />
        {/* chip "falta 1" */}
        {t > left && (
          <div style={{ position: "absolute", left: leftPt.x - 40, top: leftPt.y - 42, transform: `scale(${chip})`, transformOrigin: "0% 50%" }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: "#fff", background: C.terracotta, padding: "12px 24px", borderRadius: 40, boxShadow: "0 18px 36px -14px rgba(169,78,51,0.6)", whiteSpace: "nowrap" }}>Falta 1 · 21:00</div>
          </div>
        )}
      </AbsoluteFill>
      {/* logo que sai + palavras */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 296, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: logoOut }}>
        <Img src={staticFile("img/logo-mark.png")} style={{ height: 136 }} />
        <Img src={staticFile("img/logo-word.png")} style={{ height: 84 }} />
      </div>
      {/* toast real do app ("Passeio concluído · Agora · Thor") */}
      {t > tap + 0.4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", transform: `translateY(${(1 - toastIn) * -60 - toastOut * 40}px)`, opacity: clamp01(toastIn * 1.5) * (1 - toastOut) }}>
          <Toast title="Passeio concluído" sub="Agora · Thor" scale={1.35} />
        </div>
      )}
      {cur && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: 1 - clamp01(toastIn * 1.5) * (1 - toastOut) }}>
          <Headline key={cur[0]} lines={[cur[0]]} t={t} t0={cur[1]} size={cur[0].length > 8 ? 104 : 132} color={C.forest} dot={true} stagger={0.05} align="center" />
        </div>
      )}
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};

/* ============ BENEFÍCIOS: troca 3D entre telas reais + fotografia ============ */
const CubeFlip: React.FC<{ faces: React.ReactNode[]; switches: number[]; t: number; width: number }> = ({ faces, switches, t, width }) => {
  // índice ativo e progresso da transição atual
  let idx = 0;
  for (let i = 0; i < switches.length; i++) if (t >= switches[i]) idx = i + 1;
  const prevSwitch = idx > 0 ? switches[idx - 1] : -Infinity;
  const p = idx > 0 ? prog(t, prevSwitch, 0.5, EASE.inOut) : 1;
  const half = width / 2;
  const render = (i: number, angle: number) => (
    <div key={i} style={{ position: "absolute", inset: 0, transform: `rotateY(${angle}deg) translateZ(${half}px)`, backfaceVisibility: "hidden" }}>
      {faces[i]}
    </div>
  );
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `translateZ(${-half}px) rotateY(${idx > 0 && p < 1 ? -90 * p : 0}deg)` }}>
      {idx > 0 && p < 1 ? (
        <>
          {render(idx - 1, 0)}
          {render(idx, 90)}
        </>
      ) : (
        render(idx, 0)
      )}
    </div>
  );
};

export const Benefits: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const { health, money, play, pets, switch: sw } = scene.cues;
  const phoneH = phoneHeight(PH.width);
  const faces = [
    <PhoneFace key="h">
      <HojeScreen doneP={[1, 1, 1, 1, 0]} ring={0.8} next="Próximo: 21:00 · Escovação" />
    </PhoneFace>,
    <PhoneFace key="s">
      <SaudeScreen inP={[0, 1, 2, 3].map((i) => prog(t, health + 0.35 + i * 0.08, 0.4))} />
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
  const label: [string, number][] = [
    ["Saúde", health],
    ["Gastos", money],
    ["Brincadeiras", play],
  ];
  const curLabel = [...label].reverse().find(([, tt]) => t >= tt);
  const sub: Record<string, string> = { Saúde: "VACINAS · REMÉDIOS · DOCUMENTOS", Gastos: "POR CATEGORIA E POR PET", Brincadeiras: "GUIADAS · SONS DE BRINQUEDO" };
  const dal = springAt(t * 30, play + 0.25, { damping: 11, stiffness: 120 }, 30);
  const dalOut = prog(t, pets - 0.1, 0.3);
  const perfilPhase = t >= sw - 0.75;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG />
      {!perfilPhase ? (
        <>
          <div style={{ position: "absolute", left: PH.left, top: PH.top, width: PH.width, height: phoneH, perspective: 2400, transform: "scale(1.14)", transformOrigin: "50% 0%" }}>
            <CubeFlip t={t} switches={[health, money, play]} width={PH.width} faces={faces} />
          </div>
          {/* dálmata saindo de trás do telefone */}
          {t > play && (
            <div style={{ position: "absolute", left: 610, top: 760, transform: `translate(${(1 - dal) * -260 + dalOut * 400}px, ${dalOut * 100}px) rotate(${(1 - dal) * -30 + 8}deg)`, opacity: 1 - dalOut }}>
              <Cutout src="img/dalmata.png" width={430} />
            </div>
          )}
          {curLabel && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - prog(t, pets - 0.15, 0.2) }}>
              <Headline key={curLabel[0]} lines={[curLabel[0]]} t={t} t0={curLabel[1]} size={curLabel[0].length > 8 ? 104 : 128} color={C.forest} align="center" stagger={0} />
              <div key={curLabel[0] + "s"} style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.18em", color: C.text2, marginTop: 6, opacity: prog(t, curLabel[1] + 0.15, 0.4) }}>
                {sub[curLabel[0]]}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: PH.left, top: PH.top, transform: `scale(${lerp(0.9, 1, photoOut)})`, transformOrigin: "50% 50%" }}>
            <Phone width={PH.width} shadow={SHADOW.xl}>
              <PerfilScreen pet={pill > 0.5 ? "mia" : "thor"} pill={pill} />
            </Phone>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
            {t < sw - 0.05 ? (
              <Headline lines={["Cão ou gato"]} t={t} t0={sw - 0.75} size={110} color={C.forest} align="center" dot={"?"} />
            ) : (
              <Headline lines={["Um perfil", "para cada pet"]} t={t} t0={sw} size={80} color={C.forest} align="center" />
            )}
          </div>
        </>
      )}
      {/* inserção de fotografia: "cada pet da casa" */}
      {showPhoto && (
        <AbsoluteFill
          style={{
            clipPath: `inset(${lerp(PH.top + 20, 0, photoP) + photoOut * 600}px ${lerp(1080 - PH.left - PH.width + 20, 0, photoP) + photoOut * 300}px ${lerp(1920 - PH.top - phoneH + 20, 0, photoP) + photoOut * 700}px ${lerp(PH.left + 20, 0, photoP) + photoOut * 300}px round ${lerp(70, 0, photoP) + photoOut * 60}px)`,
          }}
        >
          <AbsoluteFill style={{ background: "#f7f7f5" }} />
          <Img src={staticFile("img/family.jpg")} style={{ position: "absolute", width: 1990, left: -455, top: 610, transform: `scale(${1.08 - 0.08 * prog(t, pets, 1.8, EASE.soft)})`, transformOrigin: "50% 40%" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
            <Headline lines={["Cada pet", "da casa"]} t={t} t0={pets + 0.1} size={118} color={C.forest} align="center" />
          </div>
        </AbsoluteFill>
      )}
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};

const PhoneFace: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Phone width={PH.width} shadow={SHADOW.xl}>
    {children}
  </Phone>
);

/* ============ MULTI-PET (performance): "Cão e gato na mesma conta… cada um com a sua rotina." ============ */
export const MultiPet: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const { switch: sw, routine } = scene.cues;
  const pill = prog(t, sw, 0.45, EASE.satisfying);
  const enter = springAt(t * 30, scene.start, { damping: 14 }, 30);
  const phoneH = phoneHeight(PH.width);
  const flipP = prog(t, routine - 0.1, 0.5, EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG />
      <div style={{ position: "absolute", left: PH.left, top: PH.top, width: PH.width, height: phoneH, perspective: 2400, transform: `translateY(${(1 - enter) * 300}px)` }}>
        <CubeFlip
          t={t}
          switches={[routine - 0.1]}
          width={PH.width}
          faces={[
            <PhoneFace key="p">
              <PerfilScreen pet={pill > 0.5 ? "mia" : "thor"} pill={pill} />
            </PhoneFace>,
            <PhoneFace key="h">
              <HojeScreen pet="mia" doneP={[1, 1, 0, 0, 0]} ring={0.4} next="Próximo: 12:00 · Caixa de areia" rowsIn={[0, 1, 2, 3, 4].map((i) => prog(t, routine + 0.25 + i * 0.07, 0.4))} />
            </PhoneFace>,
          ]}
        />
      </div>
      {/* cão e gato em recorte, um de cada lado */}
      <div style={{ position: "absolute", left: -170, top: 1040, transform: `translateX(${(1 - enter) * -400}px) rotate(-10deg)`, opacity: 1 - flipP * 0.0 }}>
        <Cutout src="img/dog-fisheye.png" width={480} />
      </div>
      <div style={{ position: "absolute", left: 760, top: 980, transform: `translateX(${(1 - springAt(t * 30, sw, { damping: 12 }, 30)) * 500}px) rotate(9deg)` }}>
        <Cutout src="img/cat-fisheye.png" width={460} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        {t < routine - 0.1 ? (
          <Headline lines={["Cão e gato,", "1 conta"]} t={t} t0={scene.start - 0.1} size={80} color={C.forest} align="center" accentWords={["1"]} />
        ) : (
          <Headline lines={["Cada um com", "a sua rotina"]} t={t} t0={routine - 0.1} size={80} color={C.forest} align="center" />
        )}
      </div>
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};

/* ============ EMOÇÃO: da interface para a fotografia ============ */
export const Emotion: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const open = prog(t, t0, 0.8, EASE.camera);
  const warm = scene.cues.warm;
  const kb = prog(t, t0, scene.end - t0, EASE.soft);
  const phoneH = phoneHeight(PH.width);
  // janela da foto: do retângulo da tela do telefone até um quadrado 1080×1080
  const top = lerp(PH.top + 20, 250, open);
  const left = lerp(PH.left + 20, 0, open);
  const right = lerp(1080 - PH.left - PH.width + 20, 0, open);
  const bottom = lerp(1920 - PH.top - phoneH + 20, 1920 - 1330, open);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.forestNight }}>
      <NightBG hue="#244534" />
      <AbsoluteFill style={{ clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round ${lerp(70, 0, open)}px)` }}>
        <AbsoluteFill style={{ background: "#5f8fbf" }} />
        <Img src={staticFile("img/duo.jpg")} style={{ position: "absolute", width: 1919 * 1.18, left: -379 * 1.18 - 40, top: 250 - 60, transform: `scale(${1 + kb * 0.07})`, transformOrigin: "52% 40%" }} />
        {/* luz quente */}
        <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 80% 20%, rgba(255,190,130,0.35), rgba(255,190,130,0) 70%)", mixBlendMode: "screen" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(17,33,26,0) 72%, rgba(17,33,26,0.95) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 300 }}>
        {t < warm - 0.05 ? (
          <Headline lines={["Menos coisa", "na cabeça"]} t={t} t0={t0 + 0.35} size={112} color="#fff" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.25)" }} />
        ) : (
          <Headline lines={["Mais tempo", "juntos"]} t={t} t0={warm} size={140} color="#fff" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.25)" }} />
        )}
      </div>
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

/* ============ CTA ============ */
export const CTA: React.FC<{ scene: Scene; short?: boolean }> = ({ scene, short }) => {
  const { t } = useSceneTime(scene);
  const t0 = scene.start;
  const { logo, offer, url } = scene.cues;
  const fromPhoto = !short;
  const shrink = prog(t, t0, 0.65, EASE.camera);
  const mark = springAt(t * 30, logo, { damping: 11, stiffness: 140 }, 30);
  const word = prog(t, logo + 0.18, 0.6, EASE.out);
  const head = prog(t, logo + 0.45, 0.6, EASE.out);
  const off = springAt(t * 30, offer, { damping: 13, stiffness: 150 }, 30);
  const urlP = prog(t, url - 0.1, 0.55, EASE.out);
  const underline = prog(t, url + 0.15, 0.6, EASE.inOut);
  const pets = springAt(t * 30, offer + 0.25, { damping: 16, stiffness: 90 }, 30);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBG warm={1} />
      {/* foto que encolhe até virar o símbolo */}
      {fromPhoto && shrink < 1 && (
        <div style={{ position: "absolute", left: lerp(0, 540 - 70, shrink), top: lerp(250, 330, shrink), width: lerp(1080, 140, shrink), height: lerp(1080, 140, shrink), borderRadius: lerp(0, 140, shrink), overflow: "hidden", opacity: 1 - prog(t, t0 + 0.45, 0.2) }}>
          <Img src={staticFile("img/duo.jpg")} style={{ position: "absolute", height: "100%", left: "-38%" }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("img/logo-mark.png")} style={{ height: 250, transform: `scale(${mark}) rotate(${(1 - mark) * 25}deg)`, opacity: clamp01(mark * 2) }} />
        <div style={{ overflow: "hidden", height: 116, marginTop: 6 }}>
          <Img src={staticFile("img/logo-word.png")} style={{ height: 116, transform: `translateY(${(1 - word) * 120}px)` }} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 66, lineHeight: 1.06, letterSpacing: "-0.035em", color: C.text, textAlign: "center", marginTop: 34, opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
          Saiba o que seu pet
          <br />
          precisa <span style={{ color: C.text3 }}>hoje.</span>
        </div>
        {/* selo da oferta (não é botão) */}
        <div style={{ marginTop: 40, display: "flex", gap: 14, transform: `scale(${off})`, opacity: clamp01(off * 2) }}>
          {["3 dias grátis", "sem cartão"].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 26px 14px 18px", borderRadius: 50, border: `3px solid ${C.terracotta}`, color: C.terracottaText, fontFamily: FONT, fontWeight: 700, fontSize: 38 }}>
              <Icon name="check" size={34} color={C.terracotta} stroke={3} /> {s}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 34, position: "relative", opacity: urlP, transform: `translateY(${(1 - urlP) * 30}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 116, letterSpacing: "-0.05em", color: C.forest }}>duopet.site</div>
          <div style={{ position: "absolute", left: 0, bottom: 4, height: 9, borderRadius: 9, width: `${underline * 100}%`, background: C.terracotta }} />
        </div>
        <div style={{ marginTop: 16, fontFamily: FONT, fontSize: 30, color: C.text2, opacity: prog(t, url + 0.4, 0.5) }}>No celular ou no computador · sem instalar</div>
      </div>
      {/* pets espiando na base (decorativo, fora da área segura) */}
      <div style={{ position: "absolute", left: 0, top: 1360, width: 1080, height: 560, overflow: "hidden" }}>
        <Img src={staticFile("img/peeking.jpg")} style={{ position: "absolute", width: 1180, left: -50, top: lerp(380, -120, pets), mixBlendMode: "multiply" }} />
      </div>
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};
