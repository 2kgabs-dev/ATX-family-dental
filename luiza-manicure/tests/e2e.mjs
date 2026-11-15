// Testes de ponta a ponta da landing page (Playwright + axe-core).
// Uso: URL=http://localhost:3100 node tests/e2e.mjs
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.URL ?? "http://localhost:3100";
const NUMBER = "5511967302813";
const EXPECTED = {
  geral: "Olá, Luiza! Vi seu site e gostaria de agendar um horário.",
  manicure: "Olá, Luiza! Gostaria de agendar um horário para manicure. Pode me informar os valores e a disponibilidade?",
  depilacao: "Olá, Luiza! Gostaria de saber mais sobre os serviços de depilação e consultar os horários disponíveis.",
  pes: "Olá, Luiza! Gostaria de saber mais sobre a plástica dos pés e agendar um horário.",
  domicilio: "Olá, Luiza! Gostaria de consultar a disponibilidade de atendimento a domicílio na minha região.",
};

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) failures++;
};

const browser = await chromium.launch();

/* 1. Todos os links de WhatsApp */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const links = await page.$$eval('a[href*="wa.me"], a[href*="whatsapp"]', (as) =>
    as.map((a) => ({ href: a.getAttribute("href"), key: a.dataset.wa, text: a.textContent.trim(), target: a.target, rel: a.rel })),
  );
  ok(links.length >= 12, `encontrados ${links.length} links de WhatsApp`);
  for (const l of links) {
    const u = new URL(l.href);
    const msg = u.searchParams.get("text");
    const good =
      u.protocol === "https:" &&
      u.host === "wa.me" &&
      u.pathname === `/${NUMBER}` &&
      EXPECTED[l.key] === msg &&
      l.target === "_blank" &&
      l.rel.includes("noopener");
    ok(good, `"${l.text}" → ${l.key} (${u.host}${u.pathname})`);
  }
  const keys = new Set(links.map((l) => l.key));
  ok(Object.keys(EXPECTED).every((k) => keys.has(k)), "as 5 mensagens oficiais estão em uso");

  // Clique real: abre nova aba com a conversa correta (interceptada, sem sair da rede)
  await page.context().route("https://wa.me/**", (r) => r.fulfill({ status: 200, body: "wa" }));
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator("#servicos a[data-wa=manicure]").click(),
  ]);
  ok(popup.url().startsWith(`https://wa.me/${NUMBER}?text=`) && decodeURIComponent(popup.url()).includes("manicure"), "clique em 'Agendar manicure' abre wa.me com a mensagem certa");
  await popup.close();

  /* 2. Navegação por âncoras */
  for (const id of ["servicos", "trabalhos", "diferenciais", "contato", "inicio"]) {
    await page.locator(`header nav a[href="#${id}"]`).click();
    await page.waitForTimeout(1800);
    const top = await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top, id);
    ok(Math.abs(top) < 140, `menu leva até #${id} (top=${Math.round(top)})`);
  }

  /* 3. Acordeão do FAQ por teclado */
  const q2 = page.locator("#duvidas button[aria-expanded]").nth(1);
  await q2.scrollIntoViewIfNeeded();
  await q2.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(450);
  ok((await q2.getAttribute("aria-expanded")) === "true", "FAQ abre com Enter");
  const panelId = await q2.getAttribute("aria-controls");
  ok(await page.locator(`[id="${panelId}"]`).isVisible(), "painel da resposta visível e ligado por aria-controls");
  await page.keyboard.press("Space");
  await page.waitForTimeout(450);
  ok((await q2.getAttribute("aria-expanded")) === "false", "FAQ fecha com Espaço");

  /* 4. Lightbox da galeria */
  const thumb = page.locator("#trabalhos button[aria-haspopup=dialog]").first();
  await thumb.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await thumb.click();
  await page.waitForTimeout(400);
  const dlg = page.locator("dialog[open]");
  ok(await dlg.isVisible(), "lightbox abre ao clicar na foto");
  const counter = () => dlg.locator("[aria-live]").textContent();
  const c1 = await counter();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(400);
  const c2 = await counter();
  ok(c1 !== c2 && c2.startsWith("2"), `seta → avança (${c1} → ${c2})`);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(400);
  ok((await counter()).startsWith("1"), "seta ← volta");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  ok(!(await page.locator("dialog[open]").count()), "Esc fecha o lightbox");
  ok(await thumb.evaluate((el) => el === document.activeElement), "foco volta para a miniatura");
  await page.close();
}

/* 5. Responsividade: sem rolagem horizontal, CTA alcançável */
for (const w of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 768 ? 800 : 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const heroCta = page.locator("#inicio a[data-wa=geral]");
  const box = await heroCta.boundingBox();
  const smallTargets = await page.$$eval("a, button", (els) =>
    els
      .filter((e) => e.offsetParent !== null && !e.closest(".sr-only"))
      .map((e) => ({ r: e.getBoundingClientRect(), t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30) }))
      .filter(({ r }) => r.width > 0 && (r.height < 40 || r.width < 24))
      .map((x) => `${x.t} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`),
  );
  ok(overflow <= 0, `${w}px: sem rolagem horizontal (${overflow})`);
  ok(box && box.y + box.height < (w < 768 ? 800 : 900), `${w}px: CTA principal visível na primeira tela`);
  ok(smallTargets.length === 0, `${w}px: alvos de toque (altura ≥40px, largura ≥24px) ${smallTargets.length ? smallTargets.join(", ") : ""}`);

  if (w === 390) {
    // menu mobile
    await page.locator("button[aria-controls=menu-mobile]").click();
    await page.waitForTimeout(600);
    ok(await page.locator("#menu-mobile").isVisible(), "menu mobile abre");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    ok(!(await page.locator("#menu-mobile").count()), "menu mobile fecha com Esc");
    // barra flutuante surge depois da Hero
    await page.evaluate(() => window.scrollTo(0, document.getElementById("servicos").offsetTop));
    await page.waitForTimeout(800);
    ok(await page.locator("a[data-wa=geral]", { hasText: "Agendar pelo WhatsApp" }).first().isVisible(), "barra de WhatsApp aparece no celular após a Hero");
  }
  await page.close();
}

/* 6. Acessibilidade automática (axe) */
for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  for (const v of r.violations) console.log(`   axe ${v.id} (${v.impact}): ${v.nodes.length}x — ${v.nodes[0].target.join(" ")} ${v.nodes[0].failureSummary?.split("\n")[1] ?? ""}`);
  ok(r.violations.length === 0, `${w}px: axe sem violações WCAG 2.2 AA (${r.violations.length})`);
  await ctx.close();
}

/* 7. SEO básico */
{
  const page = await browser.newPage();
  await page.goto(BASE);
  const seo = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name=description]')?.content,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    og: document.querySelector('meta[property="og:image"]')?.content,
    h1: document.querySelectorAll("h1").length,
    lang: document.documentElement.lang,
    ld: !!document.querySelector('script[type="application/ld+json"]'),
    imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
  }));
  ok(seo.title.includes("LUIZA"), `title: ${seo.title}`);
  ok(seo.desc?.length > 80, "meta description");
  ok(!!seo.canonical, `canonical: ${seo.canonical}`);
  ok(!!seo.og, "og:image");
  ok(seo.h1 === 1, "um único h1");
  ok(seo.lang === "pt-BR", "lang pt-BR");
  ok(seo.ld, "JSON-LD presente");
  ok(seo.imgsNoAlt === 0, "todas as imagens com alt");
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} falha(s)` : "\nTodos os testes passaram");
process.exit(failures ? 1 : 0);
