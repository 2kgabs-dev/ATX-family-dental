import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const BROWSER = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const id = process.argv[2]; const [a, b] = process.argv[3].split("-").map(Number);
const comp = await selectComposition({ serveUrl, id, inputProps: {}, browserExecutable: BROWSER });
for (const gl of (process.argv[4] || "swangle").split(",")) {
  const t0 = Date.now();
  await renderMedia({ composition: comp, serveUrl, codec: "h264", crf: 17, x264Preset: "fast", muted: true, frameRange: [a, b], outputLocation: `/tmp/claude-0/-home-user-ATX-family-dental/d7d0bf5e-2b54-532d-842a-8feb644dcc75/scratchpad/bench-${gl}.mp4`, inputProps: comp.defaultProps, browserExecutable: BROWSER, concurrency: Number(process.env.CONC || 4), chromiumOptions: { gl } });
  console.log(gl, ((b - a + 1) / ((Date.now() - t0) / 1000)).toFixed(2), "fps");
}
