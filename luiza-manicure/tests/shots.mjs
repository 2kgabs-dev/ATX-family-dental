// Captura screenshots de página inteira em várias larguras (rolando para disparar as revelações).
import { chromium } from "playwright";
import fs from "node:fs";

const url = process.env.URL ?? "http://localhost:3100";
const outDir = process.argv[2] ?? "qa/screens";
const widths = (process.argv[3] ?? "390,1440").split(",").map(Number);
const scale = Number(process.env.SCALE ?? 1);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 768 ? 844 : 900 }, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${outDir}/fold-${w}.png` });
  // rola até o fim para revelar tudo
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `${outDir}/full-${w}.png`, fullPage: true });
  console.log(w, "overflow-x:", overflow, "height:", h);
  await page.close();
}
await browser.close();
