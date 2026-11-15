// Screenshots de estados interativos: menu mobile, lightbox, FAQ aberto, hover de serviço.
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.URL ?? "http://localhost:3100";
const out = process.argv[2] ?? "qa/screens";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

let page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("button[aria-controls=menu-mobile]").click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/estado-menu-mobile-390.png` });
await page.keyboard.press("Escape");
await page.locator("#trabalhos").scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.locator("#trabalhos button[aria-haspopup=dialog]").nth(0).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/estado-lightbox-390.png` });
await page.close();

page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("#trabalhos").scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.locator("#trabalhos button[aria-haspopup=dialog]").nth(3).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/estado-lightbox-1440.png` });
await page.keyboard.press("Escape");
await page.locator("#servicos li").nth(1).hover();
await page.locator("#servicos").scrollIntoViewIfNeeded();
await page.locator("#servicos li").nth(1).hover();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/estado-servicos-hover-1440.png` });
await page.close();
await browser.close();
