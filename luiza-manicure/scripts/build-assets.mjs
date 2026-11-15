// Gera a identidade vetorial da LUIZA (símbolo, logotipos, favicon, OG)
// e as versões web das fotografias reais. Rode com: npm run assets
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const out = (...p) => path.join(root, ...p);
fs.mkdirSync(out("public/brand"), { recursive: true });
fs.mkdirSync(out("public/photos"), { recursive: true });

const C = {
  porcelana: "#F7F0E9",
  nude: "#E8C8B6",
  rose: "#B88970",
  roseText: "#8F604A",
  cacau: "#543124",
  oliva: "#71805B",
};

const loadFont = (file) => opentype.parse(fs.readFileSync(out("scripts/fonts", file)).buffer);
const serif = loadFont("CormorantGaramond-VF.ttf");
const sans = loadFont("Manrope-VF.ttf");

/* ---------- Símbolo: ramo com três folhas ---------- */
function leaf([bx, by], [tx, ty], w, lean = 0) {
  const dx = tx - bx, dy = ty - by;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const p = (t, s) => [bx + dx * t + nx * w * s, by + dy * t + ny * w * s];
  const f = (pt) => pt.map((v) => +v.toFixed(2)).join(" ");
  const a1 = p(0.22, 1 + lean), a2 = p(0.72, 0.62 + lean);
  const b2 = p(0.72, -(0.62 - lean)), b1 = p(0.22, -(1 - lean));
  return `M${f([bx, by])}C${f(a1)} ${f(a2)} ${f([tx, ty])}C${f(b2)} ${f(b1)} ${f([bx, by])}Z`;
}
// viewBox 0 0 40 56
const symbolLeaves = [
  leaf([20, 23], [20.6, 1.5], 5.2, 0.05),
  leaf([19.4, 35], [4.2, 19.5], 4.7, -0.08),
  leaf([20.3, 43], [36, 29.5], 4.7, 0.08),
].join("");
const symbolStem = "M20.2 55.2C19.7 46 19.2 33 20.2 20";

function symbolMarkup(color, { x = 0, y = 0, scale = 1, stem = 1.1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="${symbolStem}" fill="none" stroke="${color}" stroke-width="${stem}" stroke-linecap="round"/><path d="${symbolLeaves}" fill="${color}"/></g>`;
}

/* ---------- Texto convertido em curvas ---------- */
function textPath(font, text, size, { wght, tracking = 0 } = {}) {
  if (wght) font.variation.set({ wght });
  const p = font.getPath(text, 0, 0, size, { tracking, kerning: true });
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 };
}
const placed = (t, x, y, color) =>
  `<path transform="translate(${(x - t.bb.x1).toFixed(2)} ${(y - t.bb.y1).toFixed(2)})" d="${t.d}" fill="${color}"/>`;

const word = textPath(serif, "LUIZA", 100, { wght: 500, tracking: 140 });
const tag = textPath(sans, "MANICURE & BELEZA", 21, { wght: 500, tracking: 320 });

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

/* Vertical: símbolo, LUIZA, filete, assinatura */
function vertical({ sym, text, sub, bg }) {
  const W = Math.max(word.w, tag.w) + 80;
  const symH = 56 * 3, symW = 40 * 3;
  let y = 40;
  let body = bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : "";
  body += symbolMarkup(sym, { x: (W - symW) / 2, y, scale: 3, stem: 0.9 });
  y += symH + 30;
  body += placed(word, (W - word.w) / 2, y, text);
  y += word.h + 26;
  const lineW = 36;
  body += `<path d="M${(W - tag.w) / 2 - lineW - 18} ${y + tag.h / 2}h${lineW}M${(W + tag.w) / 2 + 18} ${y + tag.h / 2}h${lineW}" stroke="${sub}" stroke-width="1.4"/>`;
  body += placed(tag, (W - tag.w) / 2, y, sub);
  y += tag.h + 40;
  return svg(W + 0, y, body, "LUIZA Manicure &amp; Beleza");
}

/* Horizontal: símbolo à esquerda, nome e assinatura à direita */
function horizontal({ sym, text, sub, bg }) {
  const s = 2.05, symW = 40 * s, symH = 56 * s;
  const gap = 34, pad = 24;
  const blockH = word.h + 20 + tag.h;
  const H = Math.max(symH, blockH) + pad * 2;
  const W = pad + symW + gap + Math.max(word.w, tag.w) + pad;
  let body = bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : "";
  body += symbolMarkup(sym, { x: pad, y: (H - symH) / 2, scale: s, stem: 1 });
  const tx = pad + symW + gap;
  const ty = (H - blockH) / 2;
  body += placed(word, tx, ty, text);
  body += placed(tag, tx + 2, ty + word.h + 20, sub);
  return svg(W, H, body, "LUIZA Manicure &amp; Beleza");
}

const themes = {
  "": { sym: C.rose, text: C.cacau, sub: C.roseText },
  "-mono": { sym: C.cacau, text: C.cacau, sub: C.cacau },
  "-escuro": { sym: C.nude, text: C.porcelana, sub: C.nude, bg: C.cacau },
  "-claro": { sym: C.rose, text: C.cacau, sub: C.roseText, bg: C.porcelana },
  "-branco": { sym: C.porcelana, text: C.porcelana, sub: C.porcelana },
};
for (const [suffix, t] of Object.entries(themes)) {
  fs.writeFileSync(out(`public/brand/luiza-logo-vertical${suffix}.svg`), vertical(t));
  fs.writeFileSync(out(`public/brand/luiza-logo-horizontal${suffix}.svg`), horizontal(t));
}
for (const [name, color] of [["", C.rose], ["-mono", C.cacau], ["-claro", C.porcelana]]) {
  fs.writeFileSync(
    out(`public/brand/luiza-simbolo${name}.svg`),
    svg(40, 56, symbolMarkup(color), "Símbolo LUIZA"),
  );
}

/* Favicon: símbolo reforçado sobre porcelana, legível em 16px */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.cacau}"/>${symbolMarkup(C.nude, { x: 32 - 20 * 0.95, y: 32 - 28 * 0.95, scale: 0.95, stem: 2.2 })}</svg>\n`;
fs.writeFileSync(out("src/app/icon.svg"), faviconSvg);
await sharp(Buffer.from(faviconSvg)).resize(180, 180).png().toFile(out("src/app/apple-icon.png"));
await sharp(Buffer.from(faviconSvg)).resize(48, 48).toFile(out("public/favicon-48.png"));

/* Caminhos para uso inline nos componentes React */
fs.writeFileSync(
  out("src/lib/brand-paths.ts"),
  `// Gerado por scripts/build-assets.mjs — não edite à mão.
export const SYMBOL = { viewBox: "0 0 40 56", leaves: ${JSON.stringify(symbolLeaves)}, stem: ${JSON.stringify(symbolStem)} } as const;
export const WORDMARK = { viewBox: "0 0 ${word.w.toFixed(1)} ${word.h.toFixed(1)}", d: ${JSON.stringify(word.d)}, tx: ${(-word.bb.x1).toFixed(2)}, ty: ${(-word.bb.y1).toFixed(2)} } as const;
export const TAGLINE = { viewBox: "0 0 ${tag.w.toFixed(1)} ${tag.h.toFixed(1)}", d: ${JSON.stringify(tag.d)}, tx: ${(-tag.bb.x1).toFixed(2)}, ty: ${(-tag.bb.y1).toFixed(2)} } as const;
`,
);

/* ---------- Fotografias reais: só enquadramento, orientação e compressão ---------- */
const photos = [
  // [arquivo, recorte {left, top, width, height} relativo (0..1) ou null]
  ["vermelho-vinho", { l: 0.05, t: 0.12, w: 0.9, h: 0.78 }],
  ["vermelho-tatuagens", { l: 0.0, t: 0.1, w: 1, h: 0.86 }],
  ["terracota", { l: 0.08, t: 0.05, w: 0.86, h: 0.72 }],
  ["verde-metalizado", { l: 0, t: 0.04, w: 1, h: 0.9 }],
];
const meta = {};
for (const [name, crop] of photos) {
  const src = out("source-photos", `${name}.jpg`);
  const img = sharp(src).rotate();
  const m = await img.metadata();
  const region = {
    left: Math.round(m.width * crop.l),
    top: Math.round(m.height * crop.t),
    width: Math.round(m.width * crop.w),
    height: Math.round(m.height * crop.h),
  };
  const info = await sharp(src)
    .rotate()
    .extract(region)
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(out("public/photos", `${name}.jpg`));
  meta[name] = { width: info.width, height: info.height };
}
fs.writeFileSync(out("src/lib/photo-meta.json"), JSON.stringify(meta, null, 2) + "\n");

/* ---------- Imagem de compartilhamento (Open Graph) 1200x630 ---------- */
const ogLogo = vertical(themes[""]);
const ogLogoPng = await sharp(Buffer.from(ogLogo)).resize({ height: 300 }).png().toBuffer();
const ogPhoto = await sharp(out("public/photos/vermelho-vinho.jpg"))
  .resize(470, 630, { fit: "cover", position: "centre" })
  .toBuffer();
const lineSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="730" height="630"><rect width="730" height="630" fill="${C.porcelana}"/><path d="M60 40 H670 V590 H60 Z" fill="none" stroke="${C.nude}" stroke-width="1.5"/></svg>`,
);
const ogSub = textPath(sans, "MANICURE · DEPILAÇÃO · PLÁSTICA DOS PÉS", 17, { wght: 600, tracking: 180 });
const ogHome = textPath(serif, "Atendimento a domicílio", 34, { wght: 500 });
const ogText = Buffer.from(
  svg(730, 630, placed(ogSub, (730 - ogSub.w) / 2, 470, C.cacau) + placed(ogHome, (730 - ogHome.w) / 2, 512, C.roseText), "og"),
);
const logoMeta = await sharp(ogLogoPng).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: C.porcelana } })
  .composite([
    { input: lineSvg, left: 0, top: 0 },
    { input: ogLogoPng, left: Math.round((730 - logoMeta.width) / 2), top: 120 },
    { input: ogText, left: 0, top: 0 },
    { input: ogPhoto, left: 730, top: 0 },
  ])
  .jpeg({ quality: 88 })
  .toFile(out("src/app/opengraph-image.jpg"));

console.log("ok", meta);
