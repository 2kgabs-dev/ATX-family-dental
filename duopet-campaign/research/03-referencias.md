# DuoPet — Referências e o que foi aplicado (v2)

Pedido do cliente: "use referências, pesquise, e use as que eu já mandei". Esta versão do filme incorpora a linguagem do vídeo enviado pelo cliente e técnicas de referências externas pesquisadas. Para cada referência, registro o que foi adotado, adaptado ou descartado, e por quê.

## 1. A referência do cliente (vídeo DuoPet enviado, 31 s)

Analisado a 4 quadros por segundo (124 quadros) e no áudio. Folhas de análise: `assets/ui-ref/` e `qa/`.

| Tempo | O que acontece | Técnica | Na v2 |
|---|---|---|---|
| 0,0–1,0 s | Tela preta com um ponto terracota que acende e abre em círculo creme | Abertura em íris a partir de um ponto | **Adaptada**: o ponto vira o centro da transição-assinatura (fim do caos → início da revelação). Não abro o filme no preto: 1 s de tela quase vazia derruba a taxa de retenção de 3 s |
| 1,0–2,5 s | "SEU" → "PET." com letras que se aproximam e escurecem; pets espiando sobem da base | Tipografia *tracking settle* + foto da marca subindo | **Adotada** no gancho do master: "E A DO / SEU PET?" com os pets espiando |
| 2,5–4,2 s | "sem esquecer VACINA, REMÉDIO, CONSULTA." com letras caindo em cascata | Texto em cascata por letra | **Adotada** nas palavras do caos (RAÇÃO, REMÉDIO, VACINA, CONSULTA). O "sem esquecer" **não** foi usado, porque sugere lembrete automático |
| 4,2–7,3 s | Sobre verde-floresta, uma única linha vira pata → sino → batimento → círculo com o logo → íris escura | Transformação de linha contínua | **Adotada como transição-assinatura**: linha → pata → batimento → anel com o logo. O **sino foi tirado**, porque o app não notifica |
| 7,5–10,5 s | "o sistema de GESTÃO do seu pet." Celular sobe em perspectiva com órbitas e partículas; "CÃO OU GATO." com troca de cor | Mundo verde com órbitas; texto leve + texto pesado; troca de destaque | **Adotada**: mundo verde em todas as cenas de produto; "cada cuidado / NO LUGAR CERTO."; "CÃO OU GATO." com o terracota passando de CÃO para GATO junto com a troca Thor → Mia |
| 10,75–13,75 s | "tudo em UM PAINEL. no computador ou no celular": notebook com o "Painel da casa" | Notebook + celular | **Não usada no filme**: o painel do vídeo é de uma versão anterior da interface e não consegui verificar a tela atual de computador. A frase entrou no CTA ("No celular ou no computador · sem instalar") |
| 14,0–17,0 s | "cada dia MAIS LEVE." com curva ascendente pontilhada e cuidados marcados ao longo dela (Ração, Passeio, Remédio, Brincar) e filhotes no canto | Gráfico narrativo de progresso | **Adotada** na cena emocional, com os mesmos quatro cuidados e os filhotes. Termina com a foto do gato e do cão ("mais tempo juntos") |
| 17,5–20,0 s | "01 — ROTINA / CUIDE." digitado com cursor; checklist marcando; "Rotina concluída 5/5" | Capítulos numerados + máquina de escrever | **Adotada**: "01 — ROTINA / VEJA. MARQUE. SAIBA O QUE FALTA." digitados; pílula branca "Passeio concluído" |
| 20,0–20,5 s | Celular gira com desfoque de movimento (whip) | Transição por chicote | **Adotada** entre telas de benefícios (giro rápido com desfoque) |
| 20,5–23,5 s | "02 — LEMBRETES / LEMBRE." entrando em 3D; cartão de vidro sai da tela | Texto em 3D + cartão flutuante | **Adaptada**: "02 — SAÚDE / CUIDE." em 3D; o cartão que sai da tela é real ("V10 · reforço · em 12 dias"). **"LEMBRE" foi removido** (promessa que o produto não cumpre) |
| 23,75–26,5 s | "03 — BRINCADEIRAS / BRINQUE." com letras chegando de lugares aleatórios; ícones de som orbitando; bola quicando; selo "Caça ao petisco · 5 min" | Letras dispersas + órbita de ícones | **Adotada** quase inteira |
| 26,75–30 s | Varredura terracota → creme; logo "Duo" digitado; "SISTEMA DE GESTÃO PARA CÃES E GATOS"; pílula "Teste grátis por 3 dias"; foto do grupo de pets | Wipe de cor + cartão final | **Adotada**, com dois ajustes: a pílula não tem seta (não parece botão clicável) e "duopet.site" fica grande logo abaixo |
| Áudio | Só música (sem locução), −15 LUFS, meio-tempo ~74 BPM com batidas fortes e "bombeamento" | Trilha dirigindo o corte | **Adaptada**: mantive a locução (pedido do briefing) e reforcei o bombeamento do groove sob as batidas |

**O que a referência faz melhor que a v1:** variedade de animação tipográfica (cada título com uma animação diferente), um mundo de produto mais premium (verde com órbitas) e uma transição de assinatura reconhecível (a linha que se transforma).
**O que a v1 fazia e a referência não:** narrativa com dor → solução → demonstração, locução, UI atual do app, oferta correta e nenhuma promessa falsa. A v2 junta as duas coisas.

## 2. Referências externas pesquisadas

| Referência | O que diz / mostra | Aplicação na v2 |
|---|---|---|
| Vídeos de lançamento da Apple ([breakdown de estilo](https://youmind.com/landing/x-viral-articles/apple-product-video-design-secrets), [guia Manfrotto](https://www.manfrotto.com/global-en/stories/how-to-shoot-cinematic-tech-videos-like-apple/)) | Um plano = uma ideia; transições quase invisíveis; trilha travada no corte; efeitos sonoros econômicos; revelação lenta do produto | Cada cena tem um único título e uma única ação; cortes no grid de 120 BPM; a revelação do celular sobe devagar em perspectiva |
| Case da Raycast ([Contra](https://contra.com/p/llNMeeMX-kinetic-product-motion-for-raycast-making-a-ui-feel-alive)) | UI recriada a partir do design system oficial, easing rápido, tipografia cinética, um som para cada ação | UI reconstruída com os tokens de produção; som para cada toque, check, anel e toast |
| Vocabulário de vídeos SaaS (vagas de motion designer, ex.: [Arc.dev](https://arc.dev/remote-jobs/j/notarnow-motion-designer-ui-animation-saas-product-videos-pq1bs1e1ud)) | Cursor rápido, cliques "satisfatórios", UI entrando e saindo, texto marcante, desfoque de movimento | Toque com onda, check em duas notas, pílulas que entram e saem, desfoque direcional |
| Chewy na Meta, análise da [GoMarble](https://www.gomarble.ai/library/brands/chewy/); campanhas "Chatty Pets" ([Retail Dive](https://www.retaildive.com/news/chewy-highlights-pet-services-in-new-chatty-pets-campaign/618249)) | Ganchos com problema, pergunta, oferta direta e cena reconhecível; peças de marca abaixo de 15 s | Os 4 ganchos testam exatamente esses tipos; versão de 15 s mantida |
| Rover "To My Hooman" ([Ads of the World](https://www.adsoftheworld.com/campaigns/to-my-hooman)) | Narrativa do ponto de vista do pet | **Ideia para o próximo ciclo**: gancho narrado "pelo pet" (H5) |
| AppsFlyer, State of Creative 2025 ([newsroom](https://www.appsflyer.com/company/newsroom/pr/ai-emotion-creative-trends/)) | 1,1 mi de criativos: variedade de criativos e narrativa emocional pesam; peças "antes/depois" instalam bem, mas retêm pior | O "antes/depois" (caos → ordem) é seguido de demonstração real, para atrair usuário que fica, não só clique |
| Tendências de tipografia cinética ([Linearity](https://www.linearity.io/blog/kinetic-typography/), [Piktochart](https://piktochart.com/blog/graphic-design-trends-2025/)) | O texto como protagonista; textura e granulação; um título animado por tela; legendas cinéticas aumentam o tempo assistido | 7 modos de animação tipográfica, um por título; granulação de filme; legenda palavra a palavra |
| Boas práticas de criativo mobile ([Blasto](https://blasto.ai/case-studies/what-makes-a-winning-ad-creative-in-2025), [inBeat](https://inbeat.agency/blog/mobile-app-ad-creatives)) | Movimento nos 2 primeiros segundos, contraste forte, rosto ou expressão, minidemo do produto | Movimento desde o frame 1; pets espiando no gancho; minidemo na versão H2 |

## 3. Limitações desta pesquisa
- Não consegui abrir a Meta Ads Library nem o TikTok Creative Center por este ambiente (exigem login). O roteiro de varredura manual está em `research/01-pesquisa-mercado.md`, seção 7.
- As fontes externas são, na maior parte, análises de agências e ferramentas. Servem como referência de técnica, não como prova de desempenho.

## 4. v3: skill oficial do Remotion e transições

**Pesquisa da skill.** As Agent Skills oficiais do Remotion ficam em [`remotion-dev/skills`](https://github.com/remotion-dev/skills) e foram instaladas no projeto com `npx skills add remotion-dev/skills` (pasta `.claude/skills/` na raiz do repositório). As regras usadas nesta versão:

| Regra da skill | O que diz | Como entrou no filme |
|---|---|---|
| `remotion-captions` / `display-captions` | Legendas no tipo `Caption` (JSON, espaço antes de cada palavra, `pageBreakAfter`), páginas com `createTikTokStyleCaptions`, legenda dentro da `Sequence` de cada cena | `build_timeline.py` gera `captions` por cena com quebra editorial (pontuação, ≤17 caracteres, sem terminar em artigo ou preposição). `Captions.tsx` usa `createTikTokStyleCaptions`. **Desvio:** a legenda fica numa faixa única acima das transições; dentro da cena, ela era escalada, desfocada ou duplicada no corte |
| `transitions` | `<TransitionSeries>` com `Transition` (sobrepõe) e `Overlay` (não muda a duração), `premountFor={fps}` | `Ad.tsx` montado em `TransitionSeries`. A cena que sai é estendida por metade da transição e a que entra começa metade antes; um contexto de tempo absoluto mantém a sincronia com a voz |
| `light-leaks` | `lightLeak()` de `@remotion/effects` sobre `<Solid>`, com `progress` pelo quadro | Luz quente sobre a foto no "mais tempo juntos". Testei também no corte revelação→demo, mas ali virou um véu amarelo-oliva sobre o verde e saiu |
| `measuring-text` | `measureText()` só com a fonte carregada | Posição da pílula da legenda; o render espera as fontes antes de medir |
| `voiceover` | Recomenda ElevenLabs | Sem créditos na conta. Usei Kokoro local (ver `voice/README.md`) |

**Limitação encontrada.** As transições WebGL do pacote (`zoomBlur`, `crossZoom`, `dreamyZoom`…) dependem de HTML-in-canvas (Chrome 149+). O Chromium de render deste ambiente não tem isso. Todas as transições foram feitas com CSS e SVG, que renderizam em qualquer máquina.

**Painel de transições.** Três propostas independentes (continuidade/match cut no estilo Apple, energia nativa de Reels/TikTok, viabilidade técnica com fidelidade à referência) para cada corte das 6 versões, depois consolidadas. O que entrou:

| Corte | Transição | De onde veio |
|---|---|---|
| Todos os ganchos → caos (master, H2, H3, H4) | **Mergulho no ponto terracota** do título (o ponto do "?" ou o ponto final): o ponto vira um disco que cobre a tela no corte, e o caos abre em íris do mesmo ponto, com borda creme. É a mesma transição em todos os ganchos, para o A/B medir o gancho e não a transição | Viabilidade/referência (íris a partir de um ponto) + energia |
| Lista → caos (H1) | Corte invisível (os mesmos objetos dos dois lados); só o título sai por uma máscara nos 6 últimos quadros | Continuidade |
| Caos → revelação (todas) | O mesmo ponto creme se estica e vira a linha, com uma onda de choque fina no impacto; a íris ganhou a borda creme da referência | Continuidade + energia + referência |
| Revelação → demo | Corte seco no tempo forte: celular, fundo e partículas idênticos dos dois lados; o título sai por máscara antes do corte. A fusão foi testada e descartada, porque mostrava dois títulos e duas legendas ao mesmo tempo | Continuidade (pose de câmera unificada) |
| Demo → benefícios / multi-pet | A demo limpa o quadro (título, pílula e destaque saem nos 6 últimos quadros); o celular continua na mesma pose e o 1º giro 3D começa no corte. O giro foi corrigido: o desfoque achatava o cubo e só uma face aparecia | Continuidade + viabilidade |
| Benefícios → emoção | Portal: a tela do celular (creme) vira o papel creme da cena e cresce até cobrir o quadro | Continuidade (portal de tela) |
| Emoção / multi-pet / demo 15 s → CTA | O painel terracota da referência atravessa o corte com velocidade casada (acelera, cobre no corte, desacelera), borda em degradê no lugar de desfoque; a oferta só aparece (com o "pop") depois que o painel sai da frente | Continuidade + energia + viabilidade |

A granulação de filme passou a ser uma camada única por cima de tudo (antes, ela aparecia duas vezes nas sobreposições e virava mosaico no zoom). Fundos verdes, órbitas, partículas e granulação passaram a usar o tempo absoluto da versão: não "pulam" mais nos cortes entre cenas verdes.
