import { Easing } from "remotion";

// Tokens extraídos do CSS de produção do duopet.site (12/10/2026)
export const C = {
  forest: "#203b2d",
  forestDeep: "#172c21",
  forestNight: "#11211a",
  terracotta: "#c9684a",
  terracottaText: "#a94e33",
  terracottaNight: "#e69a7f",
  caramel: "#c9a063",
  cocoa: "#5a4632",
  page: "#f4f2ee",
  raised: "#ffffff",
  sunken: "#ebe8e2",
  muted: "#f9f8f5",
  night: "#0e1311",
  nightText: "#f4f2ee",
  nightMuted: "rgba(244,242,238,0.66)",
  text: "#141a16",
  text2: "#5a5f59",
  text3: "#6b6f69",
  success: "#2e6a45",
  successSurface: "#e6efe8",
  warningSurface: "#f9efdc",
  warning: "#8a5a00",
  border: "rgba(20,26,22,0.13)",
  borderSubtle: "rgba(20,26,22,0.08)",
};

export const FONT = "Geist, 'Geist Fallback', system-ui, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, monospace";
export const HAND = "Caveat, cursive";

// Curvas do design system + curvas específicas por tipo de movimento
export const EASE = {
  out: Easing.bezier(0.22, 1, 0.36, 1), // entrada de cards (produção: --ease-out)
  satisfying: Easing.bezier(0.16, 1, 0.3, 1), // microinterações (--ease-satisfying)
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // movimentos de câmera (--ease-in-out)
  camera: Easing.bezier(0.45, 0, 0.15, 1), // câmera com antecipação lenta e chegada longa
  snap: Easing.bezier(0.7, 0, 0.84, 0), // sucção/convergência (acelera até o fim)
  slam: Easing.bezier(0.05, 0.9, 0.2, 1.05), // tipografia de impacto
  soft: Easing.bezier(0.33, 0, 0.2, 1),
  suck: Easing.bezier(0.55, 0, 0.75, 0.25), // convergência: antecipação curta e aceleração contínua
};

export const SHADOW = {
  lg: "0 18px 44px -16px rgba(20,26,22,0.20), 0 4px 10px -4px rgba(20,26,22,0.06)",
  xl: "0 50px 90px -30px rgba(20,26,22,0.38), 0 14px 30px -14px rgba(20,26,22,0.18)",
  night: "0 60px 120px -30px rgba(0,0,0,0.65), 0 20px 40px -20px rgba(0,0,0,0.5)",
};

// Área segura conservadora (Reels/TikTok): topo 14%, base 35%, lateral direita 140 px
export const SAFE = { top: 270, bottom: 1248, left: 60, right: 940 };
