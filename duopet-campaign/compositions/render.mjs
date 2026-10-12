// Renderização via @remotion/renderer.
//   node render.mjs stills <compId> <t1,t2,...> [outDir] [--safe]      -> PNGs para QA
//   node render.mjs video <compId> <out.mp4> [audio.wav]               -> MP4 H.264 (sem áudio; o áudio é mixado e multiplexado depois)
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const BROWSER = process.env.REMOTION_BROWSER || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const [, , mode, compId, arg3, arg4, ...rest] = process.argv;
const safe = rest.includes("--safe") || arg4 === "--safe";

// @remotion/transitions 4.0.534: o build ESM embute react-dom 19 por engano e quebra com React 18.
// Usamos o build CommonJS do mesmo pacote (correto). Corrigido na 4.0.535; ver compositions/README.
export const webpackOverride = (c) => ({
  ...c,
  resolve: { ...c.resolve, alias: { ...(c.resolve?.alias || {}), "@remotion/transitions$": path.resolve("node_modules/@remotion/transitions/dist/index.js") } },
});

const cacheFile = "/tmp/claude-0/-home-user-ATX-family-dental/d7d0bf5e-2b54-532d-842a-8feb644dcc75/scratchpad/bundle-path.txt";
let serveUrl;
if (process.env.REUSE_BUNDLE && fs.existsSync(cacheFile) && fs.existsSync(fs.readFileSync(cacheFile, "utf8"))) {
  serveUrl = fs.readFileSync(cacheFile, "utf8");
} else {
  serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride });
  fs.writeFileSync(cacheFile, serveUrl);
}
const inputProps = {};
const comp = await selectComposition({ serveUrl, id: compId, inputProps, browserExecutable: BROWSER });
const props = { ...comp.defaultProps, safe };

if (mode === "stills") {
  const outDir = arg4 && arg4 !== "--safe" ? arg4 : "../qa/stills";
  fs.mkdirSync(outDir, { recursive: true });
  for (const ts of arg3.split(",")) {
    const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(ts) * comp.fps));
    const output = path.join(outDir, `${compId}_${String(frame).padStart(4, "0")}.png`);
    await renderStill({ composition: { ...comp, props }, serveUrl, frame, output, inputProps: props, browserExecutable: BROWSER, chromiumOptions: { gl: process.env.GL || "swiftshader" } });
    console.log(output);
  }
} else if (mode === "video") {
  const audio = arg4 && arg4 !== "--safe" ? arg4 : undefined;
  const p2 = { ...props, audio: undefined };
  await renderMedia({
    composition: { ...comp, props: p2 },
    serveUrl,
    codec: "h264",
    crf: Number(process.env.CRF || 17),
    pixelFormat: "yuv420p",
    x264Preset: process.env.PRESET || "fast",
    muted: true,
    outputLocation: arg3,
    inputProps: p2,
    browserExecutable: BROWSER,
    concurrency: Number(process.env.CONC || 6),
    chromiumOptions: { gl: process.env.GL || "swiftshader" },
    onProgress: ({ progress }) => {
      const p = Math.round(progress * 100);
      if (p % 10 === 0) process.stdout.write(`\r${compId} ${p}%   `);
    },
  });
  console.log("\n" + arg3);
}
