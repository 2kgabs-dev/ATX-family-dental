import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, EASE, FONT, MONO } from "../theme";
import { clamp01, lerp, prog, springAt, wobble } from "../lib/anim";
import { Scene, useSceneTime } from "../lib/timeline";
import { Cutout, Grain, PaperCard } from "../components/Kit";
import { Icon } from "../components/Icon";
import { GastosScreen, HojeScreen, PerfilScreen, PlayScreen, SaudeScreen } from "../components/AppUI";
import { Phone } from "../components/Phone";
import { ForestBG } from "../components/World";
import { BigWord, Blobs, ClickCursor, DashedOrbit, FloatChip, GlassPill, HandCircle, Icon3D, LightStreak } from "../components/Motion";
import { ChaosObject } from "./Hooks";

/**
 * CORPO DO ANÚNCIO (v4): uma vantagem por plano, no ritmo das referências do cliente.
 * Linguagem: palavra gigante ATRÁS do objeto (Nomad), celular 3D com a tela real do app, dados do app flutuando em
 * chips, pílulas de vidro (Mercury), ícone 3D com órbita tracejada (Temvo), cursor clicando (Zei), círculo à mão
 * (Mercury), recapitulação em três palavras e troca de plano variada: "push" com desfoque direcional e rastro de luz,
 * "slam" (corte seco com soco de escala e flash) e "rise" (o plano seguinte sobe por baixo).
 * O 1º plano já tem o produto no quadro 0 (gancho "Tem cão e gato?").
 * Os planos vêm de scene.cues.shots = [{ key, t0, words }], gerados de scripts/vo-lines.json ("shot" de cada trecho).
 * Só afirmações verificadas em research/02-auditoria-produto.md (nada de notificação ou lembrete automático).
 * Faixa da legenda (y 1190–1400) fica livre de chips e textos; abaixo de 1248 só entra decoração (área da interface).
 */

export type ShotKey =
  | "hook" | "promessa" | "contraste" | "rotina" | "multipet" | "pronta" | "recorrencia" | "saude" | "documentos"
  | "gastos" | "semana" | "brincar" | "instalar" | "triade" | "gratis" | "plus";
type Shot = { key: ShotKey; t0: number; words?: [string, number][] };

// palavra gigante de cada plano ("" = o plano tem tipografia própria)
const WORD: Record<ShotKey, string> = {
  hook: "", promessa: "", contraste: "Guardada", rotina: "Marque", multipet: "Cão + gato", pronta: "Pronta", recorrencia: "Repete",
  saude: "Saúde", documentos: "Docs", gastos: "Gastos", semana: "Semana", brincar: "Brincar", instalar: "Web", triade: "", gratis: "", plus: "",
};
// planos que contam como "vantagem" no contador do canto
const FEATURE = new Set<ShotKey>(["contraste", "rotina", "multipet", "pronta", "recorrencia", "saude", "documentos", "gastos", "semana", "brincar", "instalar"]);
// como cada plano ENTRA (o anterior sai do mesmo jeito)
type Enter = "push" | "slam" | "rise";
const ENTER: Partial<Record<ShotKey, Enter>> = { promessa: "slam", triade: "slam", gratis: "slam", plus: "rise" };
const enterOf = (k: ShotKey): Enter => ENTER[k] ?? "push";

const PHW = 520;
const PH_LEFT = 540 - PHW / 2;
const PH_TOP = 560;

/** Pose do celular por plano: [rotateY, rotateZ, escala, deslocamento x, y]. */
const POSE: Partial<Record<ShotKey, [number, number, number, number, number]>> = {
  hook: [-10, -3, 0.94, 0, 90],
  promessa: [0, 0, 1.5, 0, 150],
  contraste: [9, 3, 0.9, 0, -40],
  rotina: [-12, 3, 1, 0, -130],
  multipet: [12, -3, 0.96, 0, -60],
  instalar: [-14, -4, 0.86, -150, -40],
};

/** Ponto da tela lógica do app (390×844) no quadro, para a linha-guia das etiquetas (ignora o giro 3D, erro de poucos px). */
const scr = (px: number, py: number, k: number, sx: number, sy: number): [number, number] => {
  const bez = PHW * 0.034;
  const s = (PHW - bez * 2) / 390;
  const cx = px + PHW / 2;
  const cy = py + (844 * s + bez * 2) / 2;
  return [cx + (px + bez + sx * s - cx) * k, cy + (py + bez + sy * s - cy) * k];
};

/** Desfoque direcional por filtro SVG, só enquanto a peça se move rápido. */
const DirBlur: React.FC<{ id: string; amount: number; vertical?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ id, amount, vertical, children, style }) => {
  if (amount < 0.8) return <div style={style}>{children}</div>;
  const a = Math.min(60, amount);
  return (
    <div style={{ ...style, filter: `url(#${id})` }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={vertical ? `0 ${a}` : `${a} 0`} />
        </filter>
      </svg>
      {children}
    </div>
  );
};

/** Momento em que a voz diz a palavra (para sincronizar cada detalhe com a fala). */
const wordAt = (shot: Shot, re: RegExp, nth = 0, fallback = shot.t0 + 0.5) => {
  const hits = (shot.words ?? []).filter(([w]) => re.test(w));
  return hits.length > nth ? hits[nth][1] : fallback;
};
const rotinaTap = (shot: Shot) => Math.max(shot.t0 + 0.35, wordAt(shot, /^marc/i, 0, shot.t0 + 0.4) + 0.32);
const multiTap = (shot: Shot) => wordAt(shot, /^gato/i, 0, shot.t0 + 0.75) - 0.08;

const screenFor = (shot: Shot, t: number) => {
  const { key, t0 } = shot;
  switch (key) {
    case "hook":
    case "instalar":
      return <HojeScreen doneP={[1, 1, 1, 0, 0]} ring={0.6} next="Próximo: 18:00 · Passeio" />;
    case "promessa":
      return <HojeScreen doneP={[1, 1, 1, 0, 0]} ring={lerp(0, 0.6, prog(t, t0 + 0.1, 0.8, EASE.out))} next="Próximo: 18:00 · Passeio" summaryIn={prog(t, t0, 0.3)} />;
    case "contraste":
      return <HojeScreen doneP={[1, 1, 0, 0, 0]} ring={0.4} next="Próximo: 12:00 · Remédio" />;
    case "rotina": {
      const tap = rotinaTap(shot);
      const ck = prog(t, tap, 0.4, EASE.satisfying);
      return (
        <HojeScreen
          doneP={[1, 1, 1, ck, 0]}
          ring={lerp(0.6, 0.8, prog(t, tap + 0.1, 0.6))}
          next={ck > 0.5 ? "Próximo: 21:00 · Escovação" : "Próximo: 18:00 · Passeio"}
          press={[0, 0, 0, Math.max(0, 1 - Math.abs(t - tap) / 0.12), 0]}
          highlight={[0, 0, 0, 0, prog(t, wordAt(shot, /^mostra/i, 0, tap + 0.9) - 0.15, 0.4)]}
        />
      );
    }
    case "pronta":
      return <HojeScreen pet="mia" doneP={[0, 0, 0, 0, 0]} ring={0} next="Rotina sugerida para gatos" rowsIn={[0, 1, 2, 3, 4].map((i) => prog(t, t0 + 0.15 + i * 0.09, 0.32, EASE.out))} />;
    case "recorrencia":
      return <HojeScreen pet="mia" doneP={[1, 1, 0, 0, 0]} ring={0.4} next="Próximo: 12:00 · Caixa de areia" />;
    case "saude":
      return <SaudeScreen inP={[0, 1, 2, 3].map((i) => prog(t, t0 + 0.12 + i * 0.07, 0.33))} />;
    case "gastos":
      return <GastosScreen grow={prog(t, t0 + 0.15, 0.8, EASE.out)} />;
    case "brincar":
      return <PlayScreen eq={t} active={1} inP={prog(t, t0 + 0.12, 0.35)} />;
    case "multipet": {
      const pill = prog(t, multiTap(shot), 0.4, EASE.satisfying);
      return <PerfilScreen pet={pill > 0.5 ? "mia" : "thor"} pill={pill} />;
    }
    case "semana":
      return <HojeScreen doneP={[1, 1, 1, 1, 1]} ring={1} next="Rotina concluída hoje" />;
    default:
      return null;
  }
};

/** Título em linhas com palavras dentro de pílulas creme (gancho / promessa). */
const PillTitle: React.FC<{ t: number; t0: number; lines: (string | [string])[][]; top: number; size?: number; dot?: string; step?: number }> = ({ t, t0, lines, top, size = 128, dot, step = 0.09 }) => {
  let wi = 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 40, top, fontFamily: FONT, fontWeight: 850, fontSize: size, letterSpacing: "-0.055em", lineHeight: 1.04, color: "#f7f5f1", textTransform: "uppercase" }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", alignItems: "center", gap: size * 0.2, marginBottom: size * 0.06 }}>
          {ln.map((w, i) => {
            const k = wi++;
            const p = springAt(t * 30, t0 + k * step, { damping: 12, stiffness: 200, mass: 0.6 }, 30);
            const boxed = Array.isArray(w);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `translateY(${(1 - p) * 70}px) scale(${0.75 + 0.25 * p}) rotate(${(1 - p) * (k % 2 ? 6 : -6)}deg)`,
                  opacity: clamp01(p * 1.6),
                  ...(boxed ? { background: C.page, color: C.forest, padding: `0 ${size * 0.15}px`, borderRadius: size * 0.24 } : {}),
                }}
              >
                {boxed ? w[0] : w}
              </span>
            );
          })}
          {li === lines.length - 1 && dot && (() => {
            const p = springAt(t * 30, t0 + (wi - 1) * step + 0.08, { damping: 9, stiffness: 260, mass: 0.5 }, 30);
            return <span style={{ display: "inline-block", color: C.terracotta, marginLeft: -size * 0.16, transform: `scale(${p}) rotate(${(1 - p) * 30}deg)`, opacity: clamp01(p * 2) }}>{dot}</span>;
          })()}
        </div>
      ))}
    </div>
  );
};

/** Selo da marca (símbolo + nome), como as pílulas de logo das referências. */
const BrandChip: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const p = springAt(t * 30, t0, { damping: 13, stiffness: 170 }, 30);
  if (t < t0 - 0.02) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 14, padding: "12px 30px 12px 14px", borderRadius: 999, background: "#fff", boxShadow: "0 24px 50px -22px rgba(0,0,0,0.7)", transform: `translateY(${(1 - p) * 40}px) scale(${0.7 + 0.3 * p})`, transformOrigin: "0% 50%", opacity: clamp01(p * 1.6) }}>
      <Img src={staticFile("img/logo-mark.png")} style={{ height: 62 }} />
      <Img src={staticFile("img/logo-word.png")} style={{ height: 40 }} />
    </div>
  );
};

/** Acessórios de cada plano (chips com dados do app, pílulas de vidro, ícones 3D, cursor, recortes). */
const Extras: React.FC<{ shot: Shot; t: number; t1: number; px: number; py: number; k3: number }> = ({ shot, t, t1, px, py, k3 }) => {
  const { key: k, t0 } = shot;
  const at = (sx: number, sy: number) => scr(px, py, k3, sx, sy);
  switch (k) {
    case "hook":
      return (
        <>
          <PillTitle t={t} t0={t0 - 0.22} top={290} lines={[["Tem", ["cão"]], ["e", ["gato"]]]} dot="?" size={150} step={0.12} />
          <div style={{ position: "absolute", left: -110, top: 1250, transform: `translateY(${(1 - springAt(t * 30, t0 - 0.1, { damping: 13 }, 30)) * 520}px) rotate(-8deg)` }}>
            <Cutout src="img/dog-fisheye.png" width={500} />
          </div>
          <div style={{ position: "absolute", left: 700, top: 1210, transform: `translateY(${(1 - springAt(t * 30, wordAt(shot, /^gato/i, 0, t0 + 0.7) - 0.1, { damping: 12 }, 30)) * 560}px) rotate(8deg)` }}>
            <Cutout src="img/cat-fisheye.png" width={460} />
          </div>
        </>
      );
    case "promessa": {
      const hoje = wordAt(shot, /^hoje/i, 0, t0 + 1.6);
      return (
        <>
          <BrandChip t={t} t0={t0 + 0.02} x={70} y={290} />
          <PillTitle t={t} t0={t0 + 0.12} top={420} lines={[["O que cada um"], ["precisa", ["hoje"]]]} size={100} step={0.08} />
          <HandCircle t={t} t0={hoje} cx={738} cy={583} rx={190} ry={74} color={C.terracotta} width={7} />
        </>
      );
    }
    case "contraste": {
      // a bagunça (post-it, cartela, receita, carteira de vacina) é sugada para dentro do celular
      const items: [string, number, number, number][] = [["ração", -60, 330, -9], ["remédio", 620, 360, 7], ["receita", -40, 1030, 5], ["vacina", 560, 1080, -6]];
      const cx = px + PHW / 2 - 160;
      const cy = py + 360;
      return (
        <>
          {items.map(([key, x, y, r], i) => {
            const p = prog(t, t0 + 0.05 + i * 0.06, 0.62, EASE.suck);
            if (p >= 1) return null;
            return (
              <div key={key} style={{ position: "absolute", left: lerp(x, cx, p), top: lerp(y, cy, p), transform: `rotate(${r + p * 140}deg) scale(${1 - p * 0.92})`, opacity: 1 - clamp01((p - 0.8) * 5), transformOrigin: "30% 30%" }}>
                {key === "receita" ? <PaperCard title="RECEITA" rows={[["Amoxicilina", "12/12 h"], ["Por", "7 dias"]]} w={430} /> : <ChaosObject k={key} />}
              </div>
            );
          })}
          <FloatChip t={t} t0={t0 + 0.75} x={520} y={400} icon="file" title="Documentos · Thor" value="Receita guardada" seed={12} accent={C.terracotta} />
        </>
      );
    }
    case "rotina": {
      const tap = rotinaTap(shot);
      return (
        <>
          <ClickCursor t={t} tapT={tap} x={px + 420} y={py + 585} />
          <FloatChip t={t} t0={wordAt(shot, /^anel/i, 0, tap + 0.3) - 0.05} x={560} y={380} icon="check" title="Anel do dia" value="4 de 5 feitos" seed={3} anchor={at(367, 132)} />
          <FloatChip t={t} t0={wordAt(shot, /^mostra/i, 0, tap + 0.9) - 0.1} x={60} y={1080} icon="listChecks" title="O que falta" value="Escovação · 21:00" seed={13} accent={C.terracotta} anchor={at(23, 550)} />
        </>
      );
    }
    case "multipet":
      return (
        <>
          <div style={{ position: "absolute", left: -140, top: 1330, transform: `translateX(${(1 - springAt(t * 30, t0 + 0.02, { damping: 14 }, 30)) * -460}px) rotate(-9deg)` }}>
            <Cutout src="img/dog-fisheye.png" width={470} />
          </div>
          <div style={{ position: "absolute", left: 690, top: 330, transform: `translateX(${(1 - springAt(t * 30, multiTap(shot), { damping: 12 }, 30)) * 520}px) rotate(9deg)` }}>
            <Cutout src="img/cat-fisheye.png" width={400} />
          </div>
        </>
      );
    case "pronta":
      return (
        <>
          <FloatChip t={t} t0={t0 + 0.2} x={60} y={400} icon="paw" title="Gato · Mia" value="Rotina sugerida" seed={4} accent={C.terracotta} anchor={at(23, 278)} />
          <FloatChip t={t} t0={wordAt(shot, /^esp/i, 0, t0 + 1.2) - 0.1} x={520} y={1080} icon="sparkle" title="Cão ou gato" value="Pronta no cadastro" seed={14} />
        </>
      );
    case "recorrencia":
      return (
        <>
          <GlassPill icon="repeat" label="Todo dia" t={t} t0={t0 + 0.08} x={530} y={370} dark={false} />
          <GlassPill icon="calendar" label="Seg · Qua · Sex" t={t} t0={t0 + 0.24} x={60} y={1010} dark={false} />
          <GlassPill icon="timer" label="A cada 3 dias" t={t} t0={t0 + 0.4} x={540} y={1100} dark={false} />
        </>
      );
    case "saude":
      return (
        <>
          <div style={{ position: "absolute", left: 780, top: 360, transform: `scale(${springAt(t * 30, t0 + 0.1, { damping: 11 }, 30)}) rotate(${wobble(t, 5, 3)}deg)` }}>
            <Icon3D name="syringe" size={150} rx={14} ry={-26} />
          </div>
          <FloatChip t={t} t0={wordAt(shot, /^rem/i, 0, t0 + 0.6) - 0.05} x={60} y={1060} icon="syringe" title="Vacina · na tela" value="Reforço da V10" seed={2} accent={C.terracotta} anchor={at(23, 206)} />
        </>
      );
    case "documentos": {
      const docs: [string, string, number][] = [
        ["Receita", "PDF", -14],
        ["Exame de sangue", "PDF", -2],
        ["Carteirinha", "Foto", 12],
      ];
      return (
        <>
          <DashedOrbit t={t} t0={t0 + 0.05} cx={540} cy={620} r={230} />
          <div style={{ position: "absolute", left: 540 - 130, top: 490, transform: `scale(${springAt(t * 30, t0 + 0.02, { damping: 11 }, 30)}) rotate(${wobble(t, 2, 2)}deg)` }}>
            <Icon3D name="folder" size={260} rx={16} ry={-18} />
          </div>
          {docs.map(([name, kind, rot], i) => {
            const p = springAt(t * 30, t0 + 0.22 + i * 0.12, { damping: 13, stiffness: 150 }, 30);
            return (
              <div key={i} style={{ position: "absolute", left: 540 - 190 + (i - 1) * 270 * p, top: 900 + Math.abs(i - 1) * 50 * p, width: 380, transform: `rotate(${rot * p}deg) scale(${0.55 + 0.45 * p})`, opacity: clamp01(p * 1.6), transformOrigin: "50% 100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 22, background: "#fff", boxShadow: "0 30px 60px -24px rgba(0,0,0,0.6)", fontFamily: FONT }}>
                  <div style={{ width: 54, height: 64, borderRadius: 10, background: i === 2 ? C.successSurface : "#f6e4dd", display: "grid", placeItems: "center" }}>
                    <Icon name="file" size={30} color={i === 2 ? C.success : C.terracottaText} />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 16, color: C.text2, letterSpacing: "0.1em" }}>{kind.toUpperCase()} · THOR</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      );
    }
    case "gastos":
      return (
        <>
          <FloatChip t={t} t0={t0 + 0.2} x={560} y={400} icon="wallet" title="Total do mês" value="R$ 186,40" seed={6} accent={C.caramel} anchor={at(367, 132)} />
          <FloatChip t={t} t0={t0 + 0.45} x={60} y={1070} icon="grid" title="Por categoria e por pet" value="Alimentação · Saúde" seed={16} anchor={at(23, 300)} />
        </>
      );
    case "semana":
      return (
        <>
          <FloatChip t={t} t0={t0 + 0.05} x={540} y={390} icon="trend" title="Semana" value="86% concluída" seed={7} />
          <FloatChip t={t} t0={t0 + 0.2} x={50} y={960} icon="flame" title="Sequência" value="7 dias seguidos" seed={8} accent={C.terracotta} />
          <FloatChip t={t} t0={wordAt(shot, /^peso/i, 0, t0 + 0.8) - 0.1} x={560} y={1080} icon="scale" title="Peso · Thor" value="32,4 kg ↗" seed={9} accent={C.caramel} />
        </>
      );
    case "brincar":
      return (
        <>
          <div style={{ position: "absolute", left: 790, top: 360, transform: `scale(${springAt(t * 30, t0 + 0.12, { damping: 11 }, 30)}) rotate(${wobble(t, 7, 4)}deg)` }}>
            <Icon3D name="ball" size={150} rx={10} ry={-22} />
          </div>
          <FloatChip t={t} t0={t0 + 0.3} x={50} y={1000} icon="listChecks" title="Brincadeira guiada" value="Passo a passo" seed={10} anchor={at(23, 200)} />
          <FloatChip t={t} t0={wordAt(shot, /^sons/i, 0, t0 + 1.3) - 0.1} x={540} y={1100} icon="volume" title="Sons de brinquedo" value="Para cão e gato" seed={11} accent={C.terracotta} anchor={at(367, 445)} />
        </>
      );
    case "instalar": {
      const pills: [string, string, RegExp][] = [
        ["check", "Navegador do celular", /^celular/i],
        ["check", "ou do computador", /^computador/i],
        ["check", "Nada para baixar", /^computador/i],
      ];
      return (
        <>
          <DashedOrbit t={t} t0={t0 + 0.1} cx={800} cy={520} r={175} color={C.terracottaNight} />
          <div style={{ position: "absolute", left: 800 - 110, top: 410, transform: `scale(${springAt(t * 30, t0 + 0.05, { damping: 11 }, 30)})` }}>
            <Icon3D name="monitor" size={220} rx={12} ry={-24} />
          </div>
          {pills.map(([icon, label, re], i) => (
            <GlassPill key={i} icon={icon} label={label} t={t} t0={wordAt(shot, re, 0, t0 + 0.5 + i * 0.3) - 0.1 + (i === 2 ? 0.45 : 0)} x={490} y={790 + i * 120} dark={false} />
          ))}
        </>
      );
    }
    case "triade": {
      // recapitulação em 3 palavras gigantes, uma por batida, cada uma com seu fundo
      const words = ["Rotina", "Saúde", "Gastos"];
      const step = Math.max(0.3, (t1 - t0) / 3);
      const i = Math.min(2, Math.max(0, Math.floor((t - t0 + 0.02) / step)));
      const p = springAt(t * 30, t0 + i * step - 0.02, { damping: 11, stiffness: 280, mass: 0.55 }, 30);
      const bgs = [C.forest, C.terracotta, C.forestNight];
      return (
        <AbsoluteFill style={{ background: bgs[i] }}>
          <Blobs t={t} opacity={0.35} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: MONO, fontSize: 28, letterSpacing: "0.32em", color: "rgba(247,245,241,0.75)" }}>TUDO NUM LUGAR SÓ</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: FONT, fontWeight: 850, fontSize: 200, lineHeight: 1, letterSpacing: "-0.06em", color: "#f7f5f1", textTransform: "uppercase", transform: `scale(${1.35 - 0.35 * p})`, opacity: clamp01(p * 2.5) }}>
            {words[i]}
            <span style={{ color: i === 1 ? C.forest : C.terracotta }}>.</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 940, display: "flex", justifyContent: "center", gap: 18 }}>
            {words.map((_, j) => (
              <div key={j} style={{ width: j === i ? 64 : 18, height: 18, borderRadius: 18, background: j <= i ? "#f7f5f1" : "rgba(247,245,241,0.3)" }} />
            ))}
          </div>
        </AbsoluteFill>
      );
    }
    case "gratis": {
      const p = springAt(t * 30, t0 - 0.03, { damping: 11, stiffness: 240 }, 30);
      return (
        <>
          <div style={{ position: "absolute", left: 540 - 105, top: 330, transform: `scale(${springAt(t * 30, t0 + 0.05, { damping: 10 }, 30)}) rotate(${wobble(t, 3, 4)}deg)` }}>
            <Icon3D name="gift" size={210} rx={14} ry={-20} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: MONO, fontSize: 28, letterSpacing: "0.3em", color: C.terracottaNight, opacity: prog(t, t0, 0.3) }}>COMECE</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: FONT, fontWeight: 850, fontSize: 220, lineHeight: 1, letterSpacing: "-0.065em", color: "#f7f5f1", textTransform: "uppercase", transform: `scale(${1.3 - 0.3 * p})`, opacity: clamp01(p * 2.5) }}>
            Grátis<span style={{ color: C.terracotta }}>.</span>
          </div>
          <GlassPill icon="paw" label="Plano Grátis · 1 pet" sub="rotina, check-in e saúde na tela" t={t} t0={wordAt(shot, /^pet/i, 0, t0 + 1.2) - 0.25} x={200} y={960} />
        </>
      );
    }
    case "plus": {
      const sem0 = wordAt(shot, /^sem$/i, 0, t0 + 1.4);
      const two = (shot.words ?? []).filter(([w]) => /^sem$/i.test(w)).length > 1;
      const sem1 = two ? wordAt(shot, /^sem$/i, 1) : sem0 + 0.35; // no corte curto a voz só diz "sem cartão": os selos seguem em cascata
      const seals: [string, string, number][] = [
        ["card", "Sem cartão", sem0 - 0.08],
        ["shield", "Sem cobrança automática", sem1 - 0.08],
        ["gift", "Depois, segue no Grátis", two ? sem1 + 0.6 : sem1 + 0.3],
      ];
      const ou = /^ou$/i.test(shot.words?.[0]?.[0] ?? "");
      const head = springAt(t * 30, t0, { damping: 13 }, 30);
      return (
        <>
          <div style={{ position: "absolute", left: 70, top: 300, fontFamily: MONO, fontSize: 26, letterSpacing: "0.24em", color: C.terracottaNight, opacity: prog(t, t0, 0.3) }}>{ou ? "OU TESTE O PLUS" : "TESTE O PLUS"} · ATÉ 2 PETS</div>
          <div style={{ position: "absolute", left: 66, top: 350, fontFamily: FONT, fontWeight: 850, fontSize: 142, letterSpacing: "-0.06em", lineHeight: 0.93, color: "#f7f5f1", textTransform: "uppercase", transform: `translateY(${(1 - head) * 70}px)`, opacity: clamp01(head * 2) }}>
            3 dias
            <br />
            de Plus
            <br />
            <span style={{ color: C.terracottaNight }}>grátis</span>
            <span style={{ color: C.terracotta }}>.</span>
          </div>
          {seals.map(([icon, text, st], i) => (
            <GlassPill key={i} icon={icon} label={text} t={t} t0={st} x={70} y={800 + i * 118} scale={1.12} />
          ))}
          <HandCircle t={t} t0={sem0 + 0.25} cx={232} cy={846} rx={200} ry={62} color={C.terracottaNight} width={7} />
        </>
      );
    }
    default:
      return null;
  }
};

const PHONE_SHOTS = new Set<ShotKey>(["hook", "promessa", "contraste", "rotina", "multipet", "pronta", "recorrencia", "saude", "gastos", "semana", "brincar", "instalar"]);

/** Duração da troca entre dois planos: até 0,3 s, menos quando os planos são curtos (listas rápidas). */
const trDur = (a: number, b: number) => Math.max(0.16, Math.min(0.3, 0.32 * Math.min(a, b)));

/** Um plano da montagem: entra e sai conforme o tipo da troca (push / slam / rise). */
const ShotLayer: React.FC<{ shots: Shot[]; ends: number[]; idx: number; featureNo: number; featureTotal: number; t: number }> = ({ shots, ends, idx, featureNo, featureTotal, t }) => {
  const shot = shots[idx];
  const { key: k, t0 } = shot;
  const t1 = ends[idx];
  const prev = shots[idx - 1];
  const next = shots[idx + 1];
  const dPrev = prev ? trDur(t0 - prev.t0, t1 - t0) : 0;
  const dNext = next ? trDur(t1 - t0, ends[idx + 1] - t1) : 0;
  const inMode: Enter = prev ? enterOf(k) : "slam";
  const outMode: Enter = next ? enterOf(next.key) : "slam";
  const dirOf = (i: number) => (i % 2 === 0 ? 1 : -1); // direção alternada de cada troca "push"
  const dIn = idx > 0 ? dirOf(idx - 1) : 1;
  const dOut = dirOf(idx);
  const W = 1180;
  const H = 2050;
  const enterF = (tt: number) => (!prev || inMode === "slam" ? (tt >= t0 - 1 / 60 ? 1 : 0) : EASE.out(clamp01((tt - (t0 - dPrev)) / dPrev)));
  const exitF = (tt: number) => (!next ? 0 : outMode === "slam" ? (tt >= t1 - 1 / 60 ? 1 : 0) : Math.pow(clamp01((tt - (t1 - dNext * 0.75)) / dNext), 2));
  const pos = (tt: number) => {
    const ein = 1 - enterF(tt);
    const eout = exitF(tt);
    const x = (inMode === "push" ? ein * dIn * W : 0) - (outMode === "push" ? eout * dOut * W : 0);
    const y = (inMode === "rise" ? ein * H : 0) - (outMode === "rise" ? eout * H * 0.6 : 0);
    return [x, y];
  };
  if (inMode === "slam" && prev && t < t0 - 1 / 60) return null;
  if (outMode === "slam" && next && t >= t1 - 1 / 60) return null;
  const [x, y] = pos(t);
  const [x2, y2] = pos(t + 1 / 30);
  const vel = Math.abs(x2 - x);
  const velY = Math.abs(y2 - y);
  // soco de escala na entrada "slam" e leve deriva de câmera durante o plano
  const slam = inMode === "slam" && prev ? 1 + 0.16 * (1 - springAt(t * 30, t0, { damping: 15, stiffness: 260, mass: 0.6 }, 30)) : 1;
  const drift = 1 + 0.025 * clamp01((t - t0) / Math.max(0.5, t1 - t0));
  const tilt = idx % 2 === 0 ? 1 : -1;
  const pop = springAt(t * 30, t0 - 0.05, { damping: 13, stiffness: 160 }, 30);
  const pose = POSE[k] ?? [tilt * -14, tilt * 4, 1, 0, -60];
  const px = PH_LEFT + pose[3];
  const py = PH_TOP + pose[4];
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${slam * drift})` }}>
      {WORD[k] && (
        <DirBlur id={`mw-${idx}`} amount={vel * 0.18} style={{ position: "absolute", inset: 0, transform: `translateX(${x * 0.7}px)`, opacity: 1 - Math.sqrt(exitF(t)) }}>
          <BigWord text={WORD[k]} t={t} t0={t0 - 0.12} dur={t1 - t0 + 0.4} y={k === "documentos" ? 500 : 700} color="rgba(244,242,238,0.93)" size={WORD[k].length > 7 ? 230 : 300} dir={tilt > 0 ? -1 : 1} />
        </DirBlur>
      )}
      {PHONE_SHOTS.has(k) && (
        <DirBlur id={`mp-${idx}`} amount={Math.max(vel, velY) * 0.35} vertical={velY > vel} style={{ position: "absolute", left: px, top: py, transform: `translateX(${x}px)` }}>
          <div style={{ transform: `perspective(2200px) rotateY(${pose[0]}deg) rotateX(6deg) rotateZ(${pose[1]}deg) scale(${pose[2] * (0.92 + 0.08 * pop)})`, transformOrigin: k === "promessa" ? "50% 15%" : "50% 50%" }}>
            <Phone width={PHW} shadow="0 90px 140px -40px rgba(0,0,0,0.75)">
              {screenFor(shot, t)}
            </Phone>
          </div>
        </DirBlur>
      )}
      <DirBlur id={`mx-${idx}`} amount={Math.max(vel, velY) * 0.3} vertical={velY > vel} style={{ position: "absolute", inset: 0, transform: `translateX(${x * 1.1}px)` }}>
        <Extras shot={shot} t={t} t1={t1} px={px} py={py} k3={pose[2]} />
      </DirBlur>
      {FEATURE.has(k) && featureTotal >= 4 && (
        <div style={{ position: "absolute", left: 70, top: 300, transform: `translateX(${x * 0.8}px)`, fontFamily: MONO, fontSize: 24, letterSpacing: "0.22em", color: C.terracottaNight, opacity: prog(t, t0 - 0.05, 0.25) * (1 - exitF(t)) }}>
          {String(featureNo).padStart(2, "0")} / {String(featureTotal).padStart(2, "0")}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Montage: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useSceneTime(scene);
  const shots: Shot[] = scene.cues.shots ?? [];
  if (!shots.length) return null;
  const ends = shots.map((s, i) => (i < shots.length - 1 ? shots[i + 1].t0 : scene.end + 0.6));
  const featureTotal = shots.filter((s) => FEATURE.has(s.key)).length;
  let fn = 0;
  const featureNo = shots.map((s) => (FEATURE.has(s.key) ? ++fn : 0));
  const pushCuts = shots.map((s, i) => ({ s, i })).filter(({ s, i }) => i > 0 && enterOf(s.key) === "push");
  const slamCuts = shots.filter((s, i) => i > 0 && enterOf(s.key) === "slam");
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ForestBG cy={1100} />
      <Blobs t={t} opacity={0.5} />
      {shots.map((s, i) => {
        if (t < s.t0 - 0.32 || t > ends[i] + 0.1) return null;
        return <ShotLayer key={s.key + i} shots={shots} ends={ends} idx={i} featureNo={featureNo[i]} featureTotal={featureTotal} t={t} />;
      })}
      {/* rastro de luz cruzando a tela em cada "push" */}
      {pushCuts.map(({ s, i }) => (
        <LightStreak key={"ls" + i} t={t} t0={s.t0 - 0.3} dur={0.4} y={980} angle={(i % 2 === 0 ? 1 : -1) * 9} thickness={14} />
      ))}
      {/* flash curto nos cortes secos */}
      {slamCuts.map((s, i) => {
        const f = 1 - prog(t, s.t0, 0.12, EASE.out);
        return t >= s.t0 - 1 / 60 && f > 0 ? <AbsoluteFill key={"fl" + i} style={{ background: "#fff6ee", opacity: 0.55 * f, mixBlendMode: "screen" }} /> : null;
      })}
      {/* aviso discreto nos planos com dados de exemplo (os mesmos que mostram o contador) */}
      {shots.some((s, i) => FEATURE.has(s.key) && t >= s.t0 && t < ends[i] - 0.1) && (
        <div style={{ position: "absolute", right: 150, top: 304, fontFamily: MONO, fontSize: 17, letterSpacing: "0.16em", color: "rgba(247,245,241,0.5)" }}>IMAGENS ILUSTRATIVAS</div>
      )}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
