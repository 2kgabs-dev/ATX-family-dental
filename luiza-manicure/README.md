# LUIZA | Manicure & Beleza — landing page

Landing page de conversão para agendamentos pelo WhatsApp. Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Motion for React. Página 100% estática (pré-renderizada), pronta para a Vercel.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
npm run assets       # regenera logotipos, favicon, OG e fotos (scripts/build-assets.mjs)
URL=http://localhost:3000 npm run test:e2e
```

---

## 1. Identidade visual

**Conceito:** "A beleza está nos detalhes." Editorial, acolhedor, sem luxo distante.

### Paleta (com contraste WCAG medido sobre o fundo)

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| Porcelana | `#F7F0E9` | Fundo principal | — |
| Porcelana profunda | `#F1E6DC` | Seções alternadas | — |
| Nude rosé | `#E8C8B6` | Superfícies, CTA final, botão claro | cacau sobre nude 7,3:1 |
| Rosé terroso | `#B88970` | **Só decoração** (folhas, filetes) | 2,7:1 — não usar em texto |
| Rosé tinta | `#8F604A` | Destaques de texto (itálicos) | 4,7:1 ✓ |
| Cacau | `#543124` | Títulos, textos, botão principal | 10,1:1 ✓ |
| Cacau suave | `#6E4A3B` | Texto secundário | 6,9:1 ✓ |
| Oliva | `#71805B` | Acento decorativo | 3,8:1 (só texto grande) |
| Oliva tinta | `#5C6A48` | Ícones de diferenciais, anel de foco | 5,2:1 ✓ |

Rosé tinta, Cacau suave e Oliva tinta são derivações da paleta proposta, criadas porque o rosé terroso e o oliva originais não passam no contraste mínimo para texto pequeno.

### Tipografia
- **Cormorant Garamond** 500/600 + itálico 500 — títulos editoriais; o itálico marca a segunda metade de cada título ("Um detalhe de beleza.").
- **Manrope** variável — interface, textos e botões.
- Títulos com `text-wrap: balance`, parágrafos com `pretty`, números tabulares no telefone e nos contadores.

### Logotipo (`public/brand/`)
Símbolo botânico de três folhas redesenhado em vetor + "LUIZA" em Cormorant convertido em curvas (o SVG não depende de fonte instalada).

| Arquivo | Uso |
|---|---|
| `luiza-logo-vertical.svg` | Principal (símbolo sobre o nome) |
| `luiza-logo-horizontal.svg` | Cabeçalho, assinaturas |
| `*-mono.svg` | Uma cor (cacau) |
| `*-escuro.svg` | Com fundo cacau |
| `*-claro.svg` | Com fundo porcelana |
| `*-branco.svg` | Porcelana sem fundo, para fotos/fundos escuros |
| `luiza-simbolo*.svg` | Símbolo isolado |
| `src/app/icon.svg`, `apple-icon.png`, `public/favicon-48.png` | Favicon |
| `src/app/opengraph-image.jpg` | Imagem de compartilhamento 1200×630 |

> ⚠️ O panfleto original com o logotipo LUIZA **não veio entre os arquivos enviados** (a 1ª imagem recebida é de outra marca, "Nail Concept by N", Tacoma/WA). O símbolo foi criado a partir da descrição ("três folhas acima da palavra LUIZA"). Vale comparar com o panfleto e ajustar a forma das folhas em `scripts/build-assets.mjs` (função `leaf`).

---

## 2. Fotografias
Quatro fotos reais da profissional, só com recorte, orientação e compressão — **sem alteração de cor** (`source-photos/` → `public/photos/`). A Vercel serve AVIF/WebP no tamanho de cada tela.

| Foto | Onde |
|---|---|
| Vermelho-vinho | Hero (moldura em arco) + galeria |
| Verde metalizado | Galeria (coluna alta, contraste de cor) |
| Terracota | Galeria |
| Vermelho com tatuagens | Galeria |

Nenhuma foto de unha representa depilação ou plástica dos pés: esses serviços usam ícones desenhados. Não foi gerada nenhuma imagem por IA.

---

### Direção da Hero
Inspirada na referência "Maison Nail Atelier" enviada pela cliente: fundo porcelana rosado, título serifado em duas linhas, linha de serviços em caixa-alta espaçada, botão retangular rosé, CTA vazado no cabeçalho, fotografia sangrando pela borda direita e monograma em cápsula ("L" sobre o ramo, `public/brand/luiza-monograma*.svg`) na divisa com a seção seguinte. A borda da foto se funde ao fundo só nos primeiros 8% da largura, para não alterar a cor real das unhas.

## 3. Estrutura da página
`Header → Hero → Serviços → Atendimento a domicílio → Galeria → Diferenciais → Como agendar → FAQ → CTA final → Footer` + barra fixa de WhatsApp no celular (aparece depois da Hero e some no CTA final).

Componentes em `src/components/`: `Header`, `Hero`, `Services`, `HomeService`, `PortfolioGallery`, `Differentials`, `BookingSteps`, `FAQ`, `FinalCTA`, `Footer`, `WhatsAppButton`, `FloatingWhatsApp`, `Logo`, `Reveal`, `icons`.

Nada foi inventado: sem endereço, cidade, bairros, preços, horários, redes sociais, depoimentos ou números de clientes. Onde falta informação, o texto leva ao WhatsApp.

---

## 4. WhatsApp (`src/lib/whatsapp.ts`)
Número único: **+55 11 96730-2813** → `https://wa.me/5511967302813?text=…` (`encodeURIComponent`).

| Botão | Mensagem |
|---|---|
| Header, Hero, Como agendar, FAQ, CTA final, barra mobile, rodapé | geral |
| Agendar manicure | manicure |
| Consultar depilação | depilação |
| Agendar cuidado dos pés | plástica dos pés |
| Consultar atendimento a domicílio | domicílio |

Todos abrem em nova aba (`noopener`). O texto da página deixa claro que o horário só fica reservado depois da confirmação da Luiza.

**Analytics:** Vercel Web Analytics (sem cookies). Eventos `hero_whatsapp_click`, `manicure_whatsapp_click`, `depilacao_whatsapp_click`, `pes_whatsapp_click`, `domicilio_whatsapp_click`, `final_whatsapp_click` etc. já estão no código. Na conta atual (plano **Hobby**) a Vercel só registra pageviews; os eventos personalizados passam a contar no plano Pro. É preciso ativar Web Analytics no painel do projeto.

---

## 5. Motion
- Hero: título e textos sobem em sequência (CSS, sem esperar JavaScript), foto revelada por máscara, contorno do arco e ramo entram depois.
- Rolagem: revelação única com stagger (Motion `whileInView`), fotos da galeria por máscara `clip-path`, arco da seção domicílio desenhado por `pathLength`, fio das etapas de agendamento.
- Microinterações: brilho de cetim no hover dos botões, `scale(0.97)` ao pressionar, sublinhado que se desenha, zoom de 1.03 nas fotos, ícones que sobem 4px.
- Curvas de Emil Kowalski (`cubic-bezier(0.23,1,0.32,1)` / `(0.77,0,0.175,1)`), só `transform`, `opacity` e `clip-path`.
- `prefers-reduced-motion` respeitado (CSS + `MotionConfig reducedMotion="user"`). Sem scroll hijacking.

---

## 6. QA — resultados (build de produção local)
- `eslint` ✓ · `tsc --noEmit` ✓ · `next build` ✓ (rota estática)
- `tests/e2e.mjs`: **67/67** verificações — 14 links de WhatsApp presentes no carregamento (número, mensagem e `noopener`), clique real abrindo `wa.me`, 5 âncoras do menu, FAQ por teclado (Enter/Espaço), lightbox (setas, Esc, foco devolvido), menu mobile (Esc), barra fixa, sem rolagem horizontal e CTA na 1ª tela em 320/375/390/430/768/1024/1440/1920, alvos de toque, **axe-core WCAG 2.2 AA sem violações** (390 e 1440), SEO (title, description, canonical, OG, h1 único, JSON-LD, alt).
- **Lighthouse** (local): desktop 100 performance / 100 acessibilidade / 100 SEO, LCP 0,7 s, CLS 0. Mobile 92 performance / 100 acessibilidade / 100 SEO, TBT ~160 ms, CLS 0,01, **LCP simulado 3,1 s** (4G lento + CPU 4×; o LCP medido sem limitação foi 0,19 s). Boas práticas 96 só porque o script do Web Analytics dá 404 fora da Vercel. O LCP simulado do celular está acima da meta de 2,5 s — ver "Próximos passos".
- Screenshots em `qa/screens/` (dobra em 8 larguras, página inteira 390/1440, menu, lightbox, hover).

Skills consultadas: Impeccable (craft floor: sem eyebrow acima de título, foco/seleção/scrollbar temáticos, contraste), Taste Skill (serviço = fotos reais lideram, fundos planos, uma ação por tela, microinterações de hover), Emil Kowalski (curvas, durações, `scale(0.97)`, nada de `ease-in`), Jakub Krehel (tipografia e alvos de toque). As skills de vídeo não foram usadas: não há peça audiovisual neste escopo.

---

## 7. Publicação
1. Projeto na Vercel com **Root Directory = `luiza-manicure`**, framework Next.js (sem variáveis obrigatórias).
2. Opcional: `NEXT_PUBLIC_SITE_URL=https://seudominio.com.br` ao conectar domínio próprio (canonical e OG usam essa URL; sem ela, usa o domínio de produção da Vercel).
3. Ativar **Web Analytics** no painel do projeto.
4. Promover a pré-visualização a produção apenas após a aprovação da cliente.

## 8. Próximos passos sugeridos
- Enviar o panfleto original para conferir o símbolo.
- Confirmar e adicionar: bairros atendidos, horários, Instagram e, se a cliente quiser, valores a partir de — isso melhora SEO local e reduz conversas que não convertem.
- Mais 4–6 fotos (idealmente com fundo neutro e luz natural) para a galeria; hoje são 4.
- LCP mobile: se a medição em campo (Speed Insights) passar de 2,5 s, reduzir a foto da Hero no celular ou trocar Motion por CSS nas seções.
