import React from "react";
import { C, FONT } from "../theme";

/** iPhone genérico (sem marca). O conteúdo é desenhado em 390×844 px lógicos e escalado. */
export const SCREEN_W = 390;
export const SCREEN_H = 844;

export const Phone: React.FC<{
  width: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  shadow?: string;
  glare?: number; // 0..1 reflexo diagonal (posição)
  dark?: boolean;
}> = ({ width, children, style, shadow, glare = 0.3, dark = false }) => {
  const bezel = width * 0.034;
  const screenW = width - bezel * 2;
  const s = screenW / SCREEN_W;
  const height = SCREEN_H * s + bezel * 2;
  const radius = width * 0.155;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        position: "relative",
        background: "linear-gradient(145deg,#3a3f3c 0%,#1b1e1c 18%,#0f1110 55%,#2a2e2b 100%)",
        boxShadow:
          (shadow ?? "0 70px 120px -40px rgba(0,0,0,0.55), 0 30px 60px -30px rgba(0,0,0,0.45)") +
          ", inset 0 0 0 1.5px rgba(255,255,255,0.10), inset 0 0 0 4px rgba(0,0,0,0.6)",
        ...style,
      }}
    >
      {/* botões laterais */}
      <div style={{ position: "absolute", left: -width * 0.008, top: height * 0.2, width: width * 0.01, height: height * 0.05, background: "#1b1e1c", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: -width * 0.008, top: height * 0.28, width: width * 0.01, height: height * 0.08, background: "#1b1e1c", borderRadius: 3 }} />
      <div style={{ position: "absolute", right: -width * 0.008, top: height * 0.25, width: width * 0.01, height: height * 0.11, background: "#1b1e1c", borderRadius: 3 }} />
      <div
        style={{
          position: "absolute",
          left: bezel,
          top: bezel,
          width: screenW,
          height: SCREEN_H * s,
          borderRadius: radius - bezel,
          overflow: "hidden",
          background: dark ? C.night : C.page,
          transform: "translateZ(0)",
        }}
      >
        <div style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${s})`, transformOrigin: "0 0", position: "relative", fontFamily: FONT }}>
          {children}
          <StatusBar dark={dark} />
          <div style={{ position: "absolute", bottom: 8, left: (SCREEN_W - 134) / 2, width: 134, height: 5, borderRadius: 3, background: dark ? "#f4f2ee" : "#141a16", opacity: 0.9 }} />
        </div>
        {/* reflexo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${glare * 100 - 25}%, rgba(255,255,255,0.10) ${glare * 100}%, rgba(255,255,255,0) ${glare * 100 + 18}%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

export const phoneHeight = (width: number) => {
  const bezel = width * 0.034;
  return SCREEN_H * ((width - bezel * 2) / SCREEN_W) + bezel * 2;
};

const StatusBar: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const col = dark ? "#f4f2ee" : "#141a16";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 30px 0 40px" }}>
      <div style={{ fontWeight: 600, fontSize: 17, color: col, letterSpacing: "-0.01em" }}>9:41</div>
      <div style={{ position: "absolute", left: (SCREEN_W - 124) / 2, top: 11, width: 124, height: 36, borderRadius: 20, background: "#000" }} />
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="18" height="12" viewBox="0 0 18 12">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={9 - i * 2.8} width="3.2" height={3 + i * 2.8} rx="1" fill={col} />
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 11.5 5.6 9.1a3.4 3.4 0 0 1 4.8 0zM3.2 6.7a6.8 6.8 0 0 1 9.6 0l-1.4 1.4a4.8 4.8 0 0 0-6.8 0zM.8 4.3a10.2 10.2 0 0 1 14.4 0l-1.4 1.4a8.2 8.2 0 0 0-11.6 0z" fill={col} />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke={col} opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2" fill={col} />
          <rect x="24.5" y="4.5" width="2" height="4" rx="1" fill={col} opacity="0.4" />
        </svg>
      </div>
    </div>
  );
};

/** Converte um ponto da tela lógica (390×844) para coordenadas do canvas, dado um telefone em (left, top, width). */
export const phonePt = (left: number, top: number, width: number, sx: number, sy: number) => {
  const bezel = width * 0.034;
  const s = (width - bezel * 2) / SCREEN_W;
  return { x: left + bezel + sx * s, y: top + bezel + sy * s, s };
};
