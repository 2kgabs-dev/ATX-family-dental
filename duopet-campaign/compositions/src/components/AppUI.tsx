import React from "react";
import { Img, staticFile } from "remotion";
import { C, FONT, MONO, SHADOW } from "../theme";
import { Icon } from "./Icon";

/**
 * Telas do app DuoPet reconstruídas a partir da demonstração interativa oficial de www.duopet.site
 * (mesmos textos, ícones Lucide, cores e proporções; dados de exemplo Thor/Mia).
 * Coordenadas em px lógicos de um iPhone (390×844).
 */

export type PetId = "thor" | "mia";
export const PETS: Record<PetId, { name: string; avatar: string; sub: string; date: string }> = {
  thor: { name: "Thor", avatar: "img/avatar-thor.jpg", sub: "Golden retriever · 4 anos · macho", date: "Quarta, 30 de setembro" },
  mia: { name: "Mia", avatar: "img/avatar-mia.jpg", sub: "Gata SRD · 2 anos · fêmea", date: "Quarta, 30 de setembro" },
};

export type Task = { time: string; title: string; sub: string; icon: string };
export const ROUTINE: Record<PetId, Task[]> = {
  thor: [
    { time: "08:00", title: "Água", sub: "Água fresca", icon: "droplet" },
    { time: "08:30", title: "Alimentação", sub: "1ª de 2", icon: "utensils" },
    { time: "10:00", title: "Medicamento", sub: "1 comprimido", icon: "pill" },
    { time: "18:00", title: "Passeio", sub: "30 min", icon: "footprints" },
    { time: "21:00", title: "Escovação", sub: "Dentes", icon: "bath" },
  ],
  mia: [
    { time: "08:00", title: "Água", sub: "Água fresca", icon: "droplet" },
    { time: "08:30", title: "Alimentação", sub: "Sachê · 1ª de 2", icon: "utensils" },
    { time: "12:00", title: "Caixa de areia", sub: "Limpar", icon: "grid" },
    { time: "19:00", title: "Brincadeira de caça", sub: "10 min", icon: "ball" },
    { time: "21:00", title: "Arranhador", sub: "Trocar de lugar", icon: "paw" },
  ],
};

export const Avatar: React.FC<{ pet: PetId; size?: number; ring?: boolean }> = ({ pet, size = 44, ring }) => (
  <div style={{ width: size, height: size, borderRadius: size, overflow: "hidden", boxShadow: ring ? `0 0 0 3px ${C.page}, 0 0 0 5px ${C.forest}` : "0 1px 2px rgba(20,26,22,0.12)", background: C.sunken, flexShrink: 0 }}>
    <Img src={staticFile(PETS[pet].avatar)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

export const Header: React.FC<{ pet: PetId; title?: string; sub?: string }> = ({ pet, title, sub }) => (
  <div style={{ position: "absolute", top: 58, left: 21, right: 21, height: 46, display: "flex", alignItems: "center", gap: 13 }}>
    <Avatar pet={pet} />
    <div style={{ flex: 1, lineHeight: 1.15 }}>
      <div style={{ fontSize: 19, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>{title ?? PETS[pet].name}</div>
      <div style={{ fontSize: 13.5, color: C.text2, marginTop: 2 }}>{sub ?? PETS[pet].date}</div>
    </div>
    <div style={{ width: 40, height: 40, borderRadius: 40, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 1px 2px rgba(20,26,22,0.08)" }}>
      <Icon name="bell" size={18} color={C.text} />
    </div>
  </div>
);

export const Ring: React.FC<{ pct: number; size?: number; stroke?: number; label?: string; dark?: boolean }> = ({ pct, size = 72, stroke = 7.3, label, dark }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={dark ? "rgba(244,242,238,0.16)" : "#e7e3dc"} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={dark ? C.terracottaNight : C.forest} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: size * 0.19, fontWeight: 600, color: dark ? C.nightText : C.text, fontVariantNumeric: "tabular-nums" }}>
        {label ?? `${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
};

export const CheckCircle: React.FC<{ p: number; size?: number }> = ({ p, size = 32 }) => {
  // p: 0 vazio → 1 preenchido; o traço do check desenha entre 0.35 e 1
  const fill = Math.min(1, p / 0.45);
  const draw = Math.max(0, Math.min(1, (p - 0.3) / 0.6));
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: size, border: `1.6px solid #b8b1a3`, opacity: 1 - fill }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: size, background: C.forest, transform: `scale(${0.4 + 0.6 * fill})`, opacity: fill }} />
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
        <path d="M7.2 12.4 10.4 15.6 16.8 8.8" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      </svg>
    </div>
  );
};

export const TaskRow: React.FC<{ task: Task; done: number; press?: number; highlight?: number; style?: React.CSSProperties }> = ({ task, done, press = 0, highlight = 0, style }) => {
  const d = Math.min(1, done);
  return (
    <div
      style={{
        height: 58,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        padding: "0 14px 0 15px",
        background: d > 0.5 ? "#f6f4f0" : "#fff",
        boxShadow: d > 0.5 ? "inset 0 0 0 1px rgba(20,26,22,0.07)" : `0 1px 2px rgba(20,26,22,0.06), 0 0 0 ${highlight * 2}px rgba(201,104,74,${0.55 * highlight})`,
        transform: `scale(${1 - press * 0.035})`,
        ...style,
      }}
    >
      <div style={{ width: 46, fontSize: 13.6, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{task.time}</div>
      <div style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: d > 0.5 ? C.successSurface : C.sunken, marginLeft: 9 }}>
        <Icon name={task.icon} size={19} color={d > 0.5 ? C.success : C.text} stroke={1.8} />
      </div>
      <div style={{ flex: 1, marginLeft: 12, lineHeight: 1.18 }}>
        <div style={{ fontSize: 15.7, fontWeight: 600, color: d > 0.5 ? C.text2 : C.text, letterSpacing: "0.005em" }}>{task.title}</div>
        <div style={{ fontSize: 12.6, color: d > 0.5 ? C.text3 : C.text2, marginTop: 2 }}>{task.sub}</div>
      </div>
      <CheckCircle p={done} />
    </div>
  );
};

export const TabBar: React.FC<{ active: string }> = ({ active }) => {
  const tabs = [
    ["Hoje", "house"],
    ["Rotina", "listChecks"],
    ["Agenda", "calendar"],
    ["Pet", "paw"],
    ["Mais", "grid"],
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 103, background: "rgba(251,250,248,0.96)", borderTop: "1px solid rgba(20,26,22,0.07)", display: "flex", justifyContent: "space-around", paddingTop: 12 }}>
      {tabs.map(([label, icon]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 64 }}>
          <Icon name={icon} size={19} color={label === active ? C.forest : C.text3} stroke={label === active ? 2.1 : 1.7} />
          <div style={{ fontSize: 11.5, fontWeight: label === active ? 650 : 450, color: label === active ? C.forest : C.text3, letterSpacing: label === active ? "0.04em" : 0 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

/** Tela "Hoje" (rotina do dia). doneP[i]: 0..1 por tarefa (permite animar o check). */
export const HojeScreen: React.FC<{
  pet?: PetId;
  doneP: number[];
  ring: number;
  next: string;
  press?: number[];
  highlight?: number[];
  rowsIn?: number[]; // 0..1 entrada de cada linha
  summaryIn?: number;
  rowStyle?: (i: number) => React.CSSProperties;
  headerIn?: number;
}> = ({ pet = "thor", doneP, ring, next, press = [], highlight = [], rowsIn, summaryIn = 1, rowStyle, headerIn = 1 }) => {
  const rows = ROUTINE[pet];
  const doneCount = doneP.filter((x) => x > 0.5).length;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <div style={{ opacity: headerIn }}>
        <Header pet={pet} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 23,
          right: 23,
          height: 113,
          borderRadius: 22,
          background: "#fff",
          boxShadow: "0 1px 2px rgba(20,26,22,0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 18px 0 19px",
          opacity: summaryIn,
          transform: `translateY(${(1 - summaryIn) * 20}px)`,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.4, color: C.text2 }}>Rotina de hoje</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 4 }}>
            <span style={{ fontSize: 31, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {doneCount} de {rows.length}
            </span>
            <span style={{ fontSize: 14, color: C.text2 }}>concluídos</span>
          </div>
          <div style={{ fontSize: 12.8, color: C.text2, marginTop: 5 }}>{next}</div>
        </div>
        <Ring pct={ring} />
      </div>
      <div style={{ position: "absolute", top: 249, left: 23, right: 23, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((t, i) => {
          const rin = rowsIn ? rowsIn[i] : 1;
          const st = rowStyle ? rowStyle(i) : { opacity: rin, transform: `translateY(${(1 - rin) * 26}px) scale(${1 - (press[i] ?? 0) * 0.035})` };
          return <TaskRow key={i} task={t} done={doneP[i] ?? 0} press={press[i] ?? 0} highlight={highlight[i] ?? 0} style={st} />;
        })}
      </div>
      <div style={{ opacity: headerIn }}>
        <TabBar active="Hoje" />
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 1px 2px rgba(20,26,22,0.06)", ...style }}>{children}</div>
);

const IconTile: React.FC<{ icon: string; tone?: "warm" | "green" | "neutral" | "terra"; size?: number }> = ({ icon, tone = "neutral", size = 39 }) => {
  const bg = { warm: C.warningSurface, green: C.successSurface, neutral: C.sunken, terra: "#f6e4dd" }[tone];
  const fg = { warm: C.warning, green: C.success, neutral: C.text, terra: C.terracottaText }[tone];
  return (
    <div style={{ width: size, height: size, borderRadius: 11, background: bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
      <Icon name={icon} size={size * 0.5} color={fg} stroke={1.8} />
    </div>
  );
};

export const SaudeScreen: React.FC<{ pet?: PetId; inP?: number[] }> = ({ pet = "thor", inP = [1, 1, 1, 1] }) => {
  const item = (i: number): React.CSSProperties => ({ opacity: inP[i] ?? 1, transform: `translateY(${(1 - (inP[i] ?? 1)) * 24}px)` });
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <Header pet={pet} title="Saúde" sub={PETS[pet].name} />
      <div style={{ position: "absolute", top: 118, left: 23, right: 23, height: 40, borderRadius: 14, background: "#ebe8e2", display: "flex", padding: 3 }}>
        {["Vacinas", "Remédios", "Consultas"].map((t, i) => (
          <div key={t} style={{ flex: 1, borderRadius: 11, display: "grid", placeItems: "center", fontSize: 14, fontWeight: i === 0 ? 600 : 450, color: i === 0 ? C.text : C.text2, background: i === 0 ? "#fff" : "transparent", boxShadow: i === 0 ? "0 1px 2px rgba(20,26,22,0.1)" : "none" }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 174, left: 23, right: 23, display: "flex", flexDirection: "column", gap: 11 }}>
        <Card style={{ height: 64, display: "flex", alignItems: "center", gap: 13, padding: "0 15px", ...item(0) }}>
          <IconTile icon="syringe" tone="warm" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>V10 · reforço</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>Em 12 dias · 12 out</div>
          </div>
        </Card>
        <Card style={{ height: 64, display: "flex", alignItems: "center", gap: 13, padding: "0 15px", ...item(1) }}>
          <IconTile icon="syringe" tone="green" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Antirrábica</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>Aplicada em 04 mar</div>
          </div>
        </Card>
        <div style={{ height: 50, borderRadius: 16, border: "1.6px dashed #b8b1a3", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.text2, fontSize: 15.5, fontWeight: 600, ...item(2) }}>
          <Icon name="plus" size={16} color={C.text2} /> Registrar vacina
        </div>
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 650, color: C.text2, letterSpacing: "0.02em", ...item(3) }}>Remédio em uso</div>
        <Card style={{ height: 64, display: "flex", alignItems: "center", gap: 13, padding: "0 15px", ...item(3) }}>
          <IconTile icon="pill" tone="green" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Medicamento</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>1 comprimido · 12 em 12 h · até 15 out</div>
          </div>
        </Card>
        <Card style={{ height: 64, display: "flex", alignItems: "center", gap: 13, padding: "0 15px", ...item(3) }}>
          <IconTile icon="file" tone="neutral" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Receita — dermatite</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>PDF · documentos do Thor</div>
          </div>
        </Card>
      </div>
      <TabBar active="Mais" />
    </div>
  );
};

export const GastosScreen: React.FC<{ grow?: number; inP?: number }> = ({ grow = 1, inP = 1 }) => {
  const cats = [
    { label: "Alimentação", v: 98.0, color: C.forest, icon: "utensils" },
    { label: "Saúde", v: 54.4, color: C.terracotta, icon: "stethoscope" },
    { label: "Banho e tosa", v: 34.0, color: C.caramel, icon: "scissors" },
  ];
  const max = 98;
  const brl = (v: number) => "R$ " + v.toFixed(2).replace(".", ",");
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <div style={{ position: "absolute", top: 58, left: 21, right: 21, height: 46, display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ display: "flex" }}>
          <Avatar pet="thor" size={40} />
          <div style={{ marginLeft: -12 }}>
            <Avatar pet="mia" size={40} />
          </div>
        </div>
        <div style={{ flex: 1, lineHeight: 1.15 }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.text }}>Gastos</div>
          <div style={{ fontSize: 13.5, color: C.text2, marginTop: 2 }}>Outubro · Thor e Mia</div>
        </div>
      </div>
      <Card style={{ position: "absolute", top: 120, left: 23, right: 23, height: 116, padding: "17px 19px", opacity: inP }}>
        <div style={{ fontSize: 13.4, color: C.text2 }}>Este mês</div>
        <div style={{ fontSize: 33, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{brl(186.4 * Math.min(1, grow * 1.1))}</div>
        <div style={{ display: "flex", height: 9, borderRadius: 9, overflow: "hidden", marginTop: 12, background: C.sunken }}>
          {cats.map((c) => (
            <div key={c.label} style={{ width: `${(c.v / 186.4) * 100 * grow}%`, background: c.color }} />
          ))}
        </div>
      </Card>
      <div style={{ position: "absolute", top: 252, left: 23, right: 23, display: "flex", flexDirection: "column", gap: 10 }}>
        {cats.map((c, i) => (
          <Card key={c.label} style={{ height: 60, display: "flex", alignItems: "center", gap: 13, padding: "0 15px" }}>
            <IconTile icon={c.icon} tone={i === 0 ? "green" : i === 1 ? "terra" : "warm"} size={37} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.text }}>{c.label}</div>
              <div style={{ height: 5, borderRadius: 5, background: C.sunken, marginTop: 7, width: 150 }}>
                <div style={{ height: 5, borderRadius: 5, background: c.color, width: `${(c.v / max) * 100 * Math.min(1, grow * (1.25 - i * 0.12))}%` }} />
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>{brl(c.v)}</div>
          </Card>
        ))}
        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 650, color: C.text2 }}>Por pet</div>
        <div style={{ display: "flex", gap: 10 }}>
          {(
            [
              ["thor", 121.9],
              ["mia", 64.5],
            ] as [PetId, number][]
          ).map(([p, v]) => (
            <Card key={p} style={{ flex: 1, height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 13px" }}>
              <Avatar pet={p} size={34} />
              <div>
                <div style={{ fontSize: 13, color: C.text2 }}>{PETS[p].name}</div>
                <div style={{ fontSize: 16, fontWeight: 650, color: C.text, fontVariantNumeric: "tabular-nums" }}>{brl(v)}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <TabBar active="Mais" />
    </div>
  );
};

export const PlayScreen: React.FC<{ eq?: number; active?: number; inP?: number }> = ({ eq = 0, active = 1, inP = 1 }) => {
  const sounds = ["Apito", "Bolinha", "Pelúcia", "Chocalho"];
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <Header pet="thor" title="Brincar" sub="Atividades e sons para o Thor" />
      <div style={{ position: "absolute", top: 120, left: 23, right: 23, height: 176, borderRadius: 22, background: `linear-gradient(150deg, ${C.forest} 0%, ${C.forestDeep} 100%)`, padding: "18px 20px", color: C.nightText, opacity: inP, transform: `translateY(${(1 - inP) * 20}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", opacity: 0.7 }}>BRINCADEIRA GUIADA</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 8 }}>Caça ao petisco</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {["5 min", "Fácil", "Em casa"].map((t) => (
            <div key={t} style={{ fontSize: 12.5, padding: "5px 10px", borderRadius: 20, background: "rgba(244,242,238,0.12)" }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, height: 40, borderRadius: 12, background: C.page, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 650 }}>
          Começar <Icon name="arrowRight" size={16} color={C.forest} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 314, left: 23, fontSize: 15, fontWeight: 650, color: C.text }}>Sons de brinquedo</div>
      <div style={{ position: "absolute", top: 314, right: 23, fontSize: 12.5, color: C.text2 }}>Toque para chamar a atenção</div>
      <div style={{ position: "absolute", top: 344, left: 23, right: 23, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {sounds.map((s, i) => (
          <div
            key={s}
            style={{
              height: 86,
              borderRadius: 18,
              background: i === active ? "#fff" : "#fbfaf8",
              boxShadow: i === active ? `0 0 0 2px ${C.forest}, 0 8px 20px -10px rgba(20,26,22,0.25)` : "0 1px 2px rgba(20,26,22,0.06)",
              padding: 13,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9, background: i === active ? C.forest : C.sunken, display: "grid", placeItems: "center" }}>
              <Icon name="volume" size={15} color={i === active ? "#fff" : C.text} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s}</div>
              {i === active && (
                <div style={{ display: "flex", gap: 2.5, alignItems: "flex-end", height: 16 }}>
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} style={{ width: 3, borderRadius: 2, background: C.forest, height: 4 + 12 * Math.abs(Math.sin(eq * 9 + k * 1.3)) }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <TabBar active="Mais" />
    </div>
  );
};

export const PerfilScreen: React.FC<{ pet: PetId; pill: number }> = ({ pet, pill }) => {
  // pill: 0 = Thor ativo, 1 = Mia ativa (anima o indicador)
  const img = pet === "thor" ? "img/thor.jpg" : "img/cat-fisheye.png";
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, background: pet === "thor" ? "#fbfaf8" : "#efece6", overflow: "hidden" }}>
        <Img
          src={staticFile(img)}
          style={pet === "thor" ? { position: "absolute", height: 380, left: -40, top: 20, objectFit: "cover" } : { position: "absolute", width: 420, left: -15, top: 40 }}
        />
      </div>
      <div style={{ position: "absolute", top: 64, left: 16, height: 46, width: 190, borderRadius: 30, background: "rgba(244,242,238,0.92)", boxShadow: SHADOW.lg, display: "flex", alignItems: "center", padding: 4 }}>
        <div style={{ position: "absolute", top: 4, left: 4 + pill * 92, width: 90, height: 38, borderRadius: 24, background: C.forest }} />
        {(["thor", "mia"] as PetId[]).map((p, i) => (
          <div key={p} style={{ position: "relative", width: 92, display: "flex", alignItems: "center", gap: 7, paddingLeft: 4 }}>
            <Avatar pet={p} size={30} />
            <div style={{ fontSize: 15, fontWeight: 650, color: Math.round(pill) === i ? "#fff" : C.text2 }}>{PETS[p].name}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 352, left: 0, right: 0, bottom: 0, background: C.page, borderRadius: "26px 26px 0 0", padding: "24px 21px" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>{PETS[pet].name}</div>
        <div style={{ fontSize: 14, color: C.text2, marginTop: 4 }}>{PETS[pet].sub}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {(pet === "thor"
            ? [
                ["Peso", "32,4 kg"],
                ["Aniversário", "12 mar"],
                ["Rotina", "5 cuidados"],
              ]
            : [
                ["Peso", "4,1 kg"],
                ["Aniversário", "08 jun"],
                ["Rotina", "5 cuidados"],
              ]
          ).map(([k, v]) => (
            <Card key={k} style={{ flex: 1, height: 72, padding: "12px 12px" }}>
              <div style={{ fontSize: 12.5, color: C.text2 }}>{k}</div>
              <div style={{ fontSize: 16, fontWeight: 650, color: C.text, marginTop: 5 }}>{v}</div>
            </Card>
          ))}
        </div>
        <Card style={{ marginTop: 12, height: 64, display: "flex", alignItems: "center", gap: 13, padding: "0 15px" }}>
          <IconTile icon="calendar" />
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: C.text }}>Próximo cuidado</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>{pet === "thor" ? "Passeio · hoje, 18:00" : "Brincadeira de caça · hoje, 19:00"}</div>
          </div>
        </Card>
      </div>
      <TabBar active="Pet" />
    </div>
  );
};

/** Toast do app ("Passeio concluído · Agora · Thor"), como na demo oficial. */
export const Toast: React.FC<{ title: string; sub: string; style?: React.CSSProperties; scale?: number }> = ({ title, sub, style, scale = 1 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14 * scale,
      padding: `${14 * scale}px ${22 * scale}px ${14 * scale}px ${14 * scale}px`,
      borderRadius: 60,
      background: C.forest,
      color: C.nightText,
      boxShadow: "0 24px 50px -18px rgba(0,0,0,0.5)",
      fontFamily: FONT,
      ...style,
    }}
  >
    <div style={{ width: 40 * scale, height: 40 * scale, borderRadius: 40, background: "rgba(244,242,238,0.16)", display: "grid", placeItems: "center" }}>
      <Icon name="check" size={22 * scale} color="#fff" stroke={2.6} />
    </div>
    <div style={{ lineHeight: 1.15 }}>
      <div style={{ fontSize: 22 * scale, fontWeight: 650 }}>{title}</div>
      <div style={{ fontSize: 16 * scale, opacity: 0.72, marginTop: 2 }}>{sub}</div>
    </div>
  </div>
);
