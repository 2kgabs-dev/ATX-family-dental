// Gera a identidade vetorial da LUIZA (símbolo, logotipos, monograma, favicon, OG)
// e as versões web das fotografias reais. Rode com: npm run assets
//
// Fotografias: source-photos/*.jpg são os originais da cliente.
// source-photos/recortes/*.png são as mesmas fotos com o fundo removido
// (@imgly/background-removal-node, offline). Mãos, unhas e cores não são retocadas:
// só o fundo de celular é trocado pelo fundo da marca.
import crypto from "node:crypto";
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
  blush: "#F3E7E0",
  tile: "#EEE0D7",
  nude: "#E8C8B6",
  rose: "#B88970",
  roseText: "#8F604A",
  cacau: "#543124",
};

const loadFont = (file) => opentype.parse(fs.readFileSync(out("scripts/fonts", file)).buffer);
const serif = loadFont("InstrumentSerif-Regular.ttf");
const sans = loadFont("Jost-VF.ttf");

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
// Layout glifo a glifo (evita o shaping GSUB que o opentype.js não suporta em algumas fontes)
function textPath(font, text, size, { wght, tracking = 0 } = {}) {
  if (wght && font.tables.fvar) font.variation.set({ wght });
  const scale = size / font.unitsPerEm;
  const p = new opentype.Path();
  let x = 0;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  glyphs.forEach((g, i) => {
    p.extend(g.getPath(x, 0, size));
    const next = glyphs[i + 1];
    const kern = next ? font.getKerningValue(g, next) : 0;
    x += (g.advanceWidth + kern) * scale + (tracking / 1000) * size;
  });
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 };
}
const placed = (t, x, y, color) =>
  `<path transform="translate(${(x - t.bb.x1).toFixed(2)} ${(y - t.bb.y1).toFixed(2)})" d="${t.d}" fill="${color}"/>`;

const word = textPath(serif, "LUIZA", 100, { tracking: 170 });
const tag = textPath(sans, "MANICURE & BELEZA", 21, { wght: 500, tracking: 380 });

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const TITLE = "LUIZA Manicure &amp; Beleza";

/* Vertical: símbolo, LUIZA, filete, assinatura */
function vertical({ sym, text, sub, bg }) {
  const W = Math.max(word.w, tag.w) + 80;
  const s = 3, symH = 56 * s, symW = 40 * s;
  let y = 40;
  let body = bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : "";
  body += symbolMarkup(sym, { x: (W - symW) / 2, y, scale: s, stem: 0.9 });
  y += symH + 30;
  body += placed(word, (W - word.w) / 2, y, text);
  y += word.h + 26;
  const lineW = 36;
  body += `<path d="M${(W - tag.w) / 2 - lineW - 18} ${y + tag.h / 2}h${lineW}M${(W + tag.w) / 2 + 18} ${y + tag.h / 2}h${lineW}" stroke="${sub}" stroke-width="1.4"/>`;
  body += placed(tag, (W - tag.w) / 2, y, sub);
  y += tag.h + 40;
  return svg(W, y, body, TITLE);
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
  return svg(W, H, body, TITLE);
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
  fs.writeFileSync(out(`public/brand/luiza-simbolo${name}.svg`), svg(40, 56, symbolMarkup(color), "Símbolo LUIZA"));
}

/* Monograma em cápsula: "L" sobre o ramo */
const monoL = textPath(serif, "L", 50);
const monoW = 56, monoH = 112;
const monoLx = (monoW - monoL.w) / 2, monoLy = 28;
const monoSymScale = 0.62;
const monoSymX = monoW / 2 - 20 * monoSymScale, monoSymY = monoLy + monoL.h + 9;
function monogramSvg(line, fill, sym) {
  return svg(
    monoW,
    monoH,
    `<rect x="0.75" y="0.75" width="${monoW - 1.5}" height="${monoH - 1.5}" rx="${(monoW - 1.5) / 2}" fill="${fill}" stroke="${line}" stroke-width="1"/>` +
      placed(monoL, monoLx, monoLy, line) +
      symbolMarkup(sym, { x: monoSymX, y: monoSymY, scale: monoSymScale, stem: 1.3 }),
    "Monograma LUIZA",
  );
}
fs.writeFileSync(out("public/brand/luiza-monograma.svg"), monogramSvg(C.roseText, C.porcelana, C.rose));
fs.writeFileSync(out("public/brand/luiza-monograma-escuro.svg"), monogramSvg(C.nude, C.cacau, C.nude));

/* Favicon: símbolo claro sobre cacau, legível em 16px */
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
export const MONOGRAM = { viewBox: "0 0 ${monoW} ${monoH}", w: ${monoW}, h: ${monoH}, l: ${JSON.stringify(monoL.d)}, lx: ${(monoLx - monoL.bb.x1).toFixed(2)}, ly: ${(monoLy - monoL.bb.y1).toFixed(2)}, symX: ${monoSymX.toFixed(2)}, symY: ${monoSymY.toFixed(2)}, symScale: ${monoSymScale} } as const;
export const TAGLINE = { viewBox: "0 0 ${tag.w.toFixed(1)} ${tag.h.toFixed(1)}", d: ${JSON.stringify(tag.d)}, tx: ${(-tag.bb.x1).toFixed(2)}, ty: ${(-tag.bb.y1).toFixed(2)} } as const;
`,
);

/* ---------- Fotografias ---------- */
// Nome com hash do conteúdo: evita que caches de imagem (Next/Vercel) sirvam versões antigas.
function hashed(file) {
  const buf = fs.readFileSync(file);
  const h = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
  const ext = path.extname(file);
  const target = file.replace(ext, `.${h}${ext}`);
  fs.renameSync(file, target);
  return "/photos/" + path.basename(target);
}
for (const f of fs.readdirSync(out("public/photos"))) fs.unlinkSync(out("public/photos", f));

const hexRgb = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });

/**
 * Sombra suave a partir do alfa do recorte (cor cacau, desfocada).
 * A tela ganha margem antes do desfoque para a sombra não ser cortada em linha reta.
 */
async function softShadow(cutBuf, opacity = 0.2, blur = 26) {
  const { width, height } = await sharp(cutBuf).metadata();
  const m = Math.ceil(blur * 3);
  const a = await sharp(cutBuf).extractChannel(3).linear(opacity, 0).png().toBuffer();
  const alpha = await sharp({ create: { width: width + 2 * m, height: height + 2 * m, channels: 3, background: "#000000" } })
    .composite([{ input: a, left: m, top: m }])
    .extractChannel(0)
    .png()
    .toBuffer();
  const c = hexRgb(C.cacau);
  const buf = await sharp({ create: { width: width + 2 * m, height: height + 2 * m, channels: 3, background: c } })
    .joinChannel(alpha)
    .blur(blur)
    .png()
    .toBuffer();
  return { buf, m };
}

/**
 * Galeria: fotos reais da cliente, só enquadradas em 4:5 e comprimidas
 * (sem alteração de cor). Recorte em frações da imagem original.
 */
async function naturalTile(name, { l = 0, t = 0, w = 1 }) {
  const src = out("source-photos", `${name}.jpg`);
  const m = await sharp(src).metadata();
  const width = Math.round(m.width * w);
  const height = Math.min(Math.round((width * 5) / 4), m.height - Math.round(m.height * t));
  const file = out("public/photos", `${name}.jpg`);
  const info = await sharp(src)
    .rotate()
    .extract({ left: Math.round(m.width * l), top: Math.round(m.height * t), width, height })
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return { width: info.width, height: info.height, src: hashed(file) };
}

const meta = {};
meta["vinho-plantas"] = await naturalTile("vinho-plantas", { t: 0.06 });
meta["chocolate"] = await naturalTile("chocolate", { t: 0.0625 });
meta["vermelho"] = await naturalTile("vermelho", { l: 0.035, w: 0.929 });
meta["lilas"] = await naturalTile("lilas", { t: 0.17 });

/**
 * Abertura morfológica no alfa: remove fiapos finos (< 2r+1 px) colados ao recorte,
 * como a borda de cadeira que o modelo deixou entre os dedos. Mantém as bordas suaves.
 */
async function openAlpha(buf, r = 6) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let m = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) m[p] = data[p * 4 + 3] > 127 ? 1 : 0;
  const pass = (src, horiz, op) => {
    const dst = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let v = op === "min" ? 1 : 0;
        for (let k = -r; k <= r; k++) {
          const xx = horiz ? x + k : x, yy = horiz ? y : y + k;
          const s = xx < 0 || yy < 0 || xx >= W || yy >= H ? (op === "min" ? 1 : 0) : src[yy * W + xx];
          if (op === "min" ? s === 0 : s === 1) { v = op === "min" ? 0 : 1; break; }
        }
        dst[y * W + x] = v;
      }
    return dst;
  };
  m = pass(pass(m, true, "min"), false, "min"); // erosão
  m = pass(pass(m, true, "max"), false, "max"); // dilatação
  for (let p = 0; p < W * H; p++) if (!m[p]) data[p * 4 + 3] = 0;
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

/*
 * Hero: recorte da foto rosa leitoso (fundo removido offline com
 * @imgly/background-removal-node; mãos e unhas sem retoque).
 * Os braços saem pelas laterais; a página esmaece as bordas com máscara CSS.
 */
{
  const src = out("source-photos/recortes", "rosa-leitoso.png");
  // aperta a borda do recorte (~1px) para eliminar o fio do fundo original
  const rgb = await sharp(src).removeAlpha().png().toBuffer();
  const a = await sharp(src).extractChannel(3).linear(1.7, -0.7 * 255).png().toBuffer();
  const tight = await openAlpha(await sharp(rgb).joinChannel(a).png().toBuffer());
  let cut = await sharp(tight).trim().png().toBuffer();
  {
    // a calça bege aparece no vão entre os dedos: apaga só essa faixa fina (polígono manual)
    const cm = await sharp(cut).metadata();
    const strip = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${cm.width}" height="${cm.height}"><polygon points="372,494 386,491 535,676 517,690" fill="#000"/></svg>`,
    );
    cut = await sharp(cut).composite([{ input: strip, blend: "dest-out" }]).png().toBuffer();
  }
  const resized = await sharp(cut).resize({ width: 1400, withoutEnlargement: true }).png().toBuffer();
  const rm = await sharp(resized).metadata();
  const sh = await softShadow(resized, 0.11, 22);
  const canvasW = rm.width, canvasH = rm.height + sh.m;
  // sombra deslocada para baixo, recortada à tela
  const shadowClip = await sharp(sh.buf)
    .extract({ left: sh.m, top: Math.max(0, sh.m - 22), width: canvasW, height: canvasH })
    .png()
    .toBuffer();
  const heroFile = out("public/photos", "hero.png");
  const info = await sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: shadowClip, left: 0, top: 0 },
      { input: resized, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(heroFile);
  globalThis.__handsForOg = await sharp(heroFile).resize({ width: 470 }).png().toBuffer();
  meta["hero"] = { width: info.width, height: info.height, src: hashed(heroFile) };
}
fs.writeFileSync(out("src/lib/photo-meta.json"), JSON.stringify(meta, null, 2) + "\n");

/* ---------- Imagem de compartilhamento (Open Graph) 1200x630 ---------- */
{
  const ogLogoPng = await sharp(Buffer.from(vertical(themes[""]))).resize({ height: 300 }).png().toBuffer();
  const logoMeta = await sharp(ogLogoPng).metadata();
  const hands = globalThis.__handsForOg;
  const hm = await sharp(hands).metadata();
  const arch = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${C.blush}"/><path d="M760 630 V250 A190 190 0 0 1 1140 250 V630 Z" fill="${C.nude}" opacity="0.55"/></svg>`,
  );
  const ogSub = textPath(sans, "MANICURE · DEPILAÇÃO · PLÁSTICA DOS PÉS", 17, { wght: 500, tracking: 220 });
  const ogHome = textPath(loadFont("InstrumentSerif-Italic.ttf"), "Atendimento a domicílio", 38);
  const ogText = Buffer.from(
    svg(720, 630, placed(ogSub, (720 - ogSub.w) / 2, 470, C.cacau) + placed(ogHome, (720 - ogHome.w) / 2, 512, C.roseText), "og"),
  );
  await sharp(arch)
    .composite([
      { input: ogLogoPng, left: Math.round((720 - logoMeta.width) / 2), top: 120 },
      { input: ogText, left: 0, top: 0 },
      { input: hands, left: Math.round(950 - hm.width / 2), top: Math.round(400 - hm.height / 2) },
    ])
    .jpeg({ quality: 88 })
    .toFile(out("src/app/opengraph-image.jpg"));
}

console.log("ok", meta);
