# DuoPet — Pesquisa de mercado (Fase 1)

Data da coleta: 12/10/2026. Legenda de confiabilidade:
**[D]** dado com metodologia publicada · **[S]** dado de fonte secundária (reportagem/blog citando a fonte) · **[Q]** observação qualitativa · **[H]** hipótese ainda não validada.

Limitações honestas desta pesquisa:
- Meta Ads Library e TikTok Creative Center exigem login/JS e não puderam ser consultados por este ambiente. Recomendo uma varredura manual de 30 min (roteiro no fim deste arquivo).
- Não foi possível ler fóruns/Reddit com volume (a busca não retornou discussões relevantes em PT-BR). As dores abaixo vêm de dados de pesquisa + da própria copy do DuoPet + benchmarks de apps concorrentes.
- Nenhuma estatística foi inventada. Onde não há número, está escrito "sem dado".

---

## 1. Tamanho e comportamento do mercado

| Achado | Tipo | Fonte (data) |
|---|---|---|
| 164,6 mi de pets no Brasil; 63,7 mi cães (+2,37%) e 32,2 mi gatos (+4,5%) — gatos crescem mais rápido | [S] | Censo Pet IPB 2024, divulgado em 2025, via [Pet Food Forum Brasil](https://www.petfoodforumbrasil.com/ultimas-noticias/article/15750669/censo-pet-brasil-ultrapassa-164-milhes-com-destaque-para-gatos-e-pequenos-animais) |
| Setor deve faturar R$ 77,2 bi em 2025 (+2,4%), projeção revisada para baixo por inflação/câmbio | [S] | Abinpet/IPB via [Diário de Pernambuco, out/2025](https://www.diariodepernambuco.com.br/economia/2025/10/11697954-mercado-pet-deve-movimentar-no-pais-rs-772-bilhoes-em-2025.html) e [Diário do Comércio](https://diariodocomercio.com.br/negocios/mercado-pet-minas-gerais-2025/) |
| 56% dos domicílios têm ao menos 1 cão ou gato | [S] | [ABRAS — Overview do Mercado Pet 2025](https://static.abras.com.br/pdf/food-retail-future/overview-do-mercado-pet-abras-2025.pdf) |
| **58% dos tutores têm mais de um animal em casa** | **[D]** | [Serasa + Opinion Box, set/2025](https://www.serasa.com.br/imprensa/os-beneficios-emocionais-de-ter-um-pet/) — 1.618 entrevistas online, 27/08–08/09/2025, margem 2,4 p.p. |
| 70% veem o pet como membro da família | [D] | mesma pesquisa Serasa/Opinion Box |
| 65% dispostos a "investir o que for preciso"; 52% já priorizaram o orçamento do pet sobre necessidades pessoais | [D] | mesma |
| 56% gastam até R$ 300/mês com o pet; 48% destinam até 5% da renda; 31% entre 6% e 10% | [D] | mesma |
| **40% dividem as despesas do pet com outras pessoas** | [D] | mesma |
| 82% acham que os benefícios emocionais compensam os custos | [D] | mesma |

### Leitura estratégica
1. **Multi-pet é a maioria (58%)** — e é exatamente o público que *precisa* pagar no DuoPet, porque o plano Grátis cobre só 1 pet. O nome da marca (Duo) já conversa com isso.
2. O tutor gasta e se importa (70% "família"), mas o mercado desacelerou (revisão de 3,5% → 2,4%). **Preço baixo e "sem cartão" reduzem atrito** num momento de orçamento apertado. [H]
3. "Cuidado compartilhado" é real (40% dividem despesas), mas o recurso de dividir cuidado no DuoPet está **"em breve"**: não pode ser prometido no anúncio.

## 2. Concorrência e diferenciação

| App | O que faz | Observação |
|---|---|---|
| Guiavet | Carteirinha digital (requisitos CFMV), alertas de vacina, grátis | Concorre em "vacina", com alerta push |
| Flockr | Rede social + carteira de vacina, peso, lembrete de remédio/vermífugo | Push |
| DailyPet (iOS) | Vacinas, vermífugos, peso, lembretes automáticos | Freemium |
| PetCare (Curitiba) | Carteirinha + notificações; cobra do estabelecimento | B2B |

Fonte: [Panorama Pet Vet](https://panoramapetvet.com.br/?p=3660), [Canaltech — Flockr](https://canaltech.com.br/startup/flockr-app-brasileiro-quer-ser-o-veterinario-de-bolso-do-seu-pet-191259/), [App Store — DailyPet](https://apps.apple.com/us/app/id1605192521), [A Gazeta](https://www.agazeta.com.br/hz/pet/4-aplicativos-que-ajudam-nos-cuidados-com-os-pets-0323) [S].

**Conclusão importante:** quase todo concorrente vende "lembrete automático". **O DuoPet não envia push, WhatsApp nem e-mail** (FAQ oficial). Competir em "lembrar você" é perder a briga **e** criar promessa falsa. O território vencedor é outro:
- **Rotina do dia com checklist e progresso** (o anel que anda) → "saber o que falta hoje".
- **Cão e gato na mesma conta, com rotina sugerida por espécie.**
- **Tudo no mesmo lugar**: saúde + documentos + gastos + brincadeiras, no navegador, sem instalar.

Benchmark internacional [Q]: apps como PawPact, Team Pet e Pet Care Reminder destacam evitar "dose duplicada" e cuidado compartilhado; a Life360 relata que 56% dos casais de tutores veem criar um pet juntos como "teste de relacionamento" ([TrendHunter](https://www.trendhunter.com/trends/shared-care-logs)). Sinal de dor real: **"alguém já deu o remédio hoje?"**, frase que o próprio DuoPet usa na landing.

## 3. Assinatura e teste grátis

| Achado | Tipo | Fonte |
|---|---|---|
| Testes de ≤4 dias convertem pior que testes longos (mediana 25,5% vs 42,5% para 17+ dias); em planos mensais, 5–9 dias convertem melhor que os mais curtos (45,9% vs 39,6%) | [S] | RevenueCat State of Subscription Apps, via [RevenueCat blog](https://www.revenuecat.com/blog/growth/free-trial-length) e [SaaStr](https://saastr.com/what-17000-subscription-apps-tell-us-about-free-trial-length-annual-plans-convert-86-better-with-30-day-trials-monthly-tops-out-at-two-weeks-and-ai-apps-hit-a-wall-at-16-days) |
| ~82% dos trials começam no dia 0 (instalação/cadastro) | [S] | RevenueCat 2025 via [Cloud Substack](https://cloud.substack.com/p/85-of-business-app-trials-start-on) |

Esses números são de apps mobile (App Store/Play). O DuoPet é web e tem "trial reverso" (3 dias de Plus → cai no Grátis). **[H]** O anúncio não converte direto em assinatura: ele converte em **cadastro**. A assinatura acontece quando o tutor (a) cadastra o 2º pet ou (b) quer histórico > 30 dias / mais brincadeiras. A campanha precisa empurrar o **2º pet e o hábito diário** dentro dos 3 dias.

## 4. Plataformas e regras

- **Formato**: 9:16, 1080×1920, H.264/AAC. Fontes de mercado divergem na margem inferior segura (20% a 35%) e indicam ~14% no topo e ~140 px na lateral direita ([House of Marketers](https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/), [Sovran — TikTok specs](https://sovran.ai/blog/tiktok-video-ad-specs)) [S]. **Adotei a margem mais conservadora**: tudo que é crítico fica entre y=270 e y=1248 e x=60 a 940.
- **Som**: a maioria assiste Reels com som, mas parte não; legendas são obrigatórias ([Logical Position](https://www.logicalposition.com/blog/supercharge-your-advertising-with-reels)) [S].
- **IA em anúncios (Meta)**: a Meta aplica o rótulo "AI info" quando detecta conteúdo gerado ou editado com IA (C2PA), e o rótulo fica ao lado de "Patrocinado" quando há **humanos fotorrealistas gerados por IA** ([Meta Newsroom, fev/2025](https://about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/), [Meta Help](https://www.meta.com/en-gb/help/artificial-intelligence/355108217670024/)) [D]. As fotos de pets do site do DuoPet foram geradas com ChatGPT (registrado em `docs/PHOTO-ASSETS-2026-10-07.json` do deploy). Não há humanos gerados por IA no filme. A locução é sintética (TTS): **recomendo declarar isso de forma transparente** e, idealmente, trocá-la por voz humana.
- **Influenciadores (CONAR)**: novo Guia de Publicidade por Influenciadores, publicado em 12/05/2026 e em vigor desde 01/06/2026, pede identificação **clara e imediata, na primeira tela**, com prioridade para a ferramenta de "parceria paga" da plataforma, mais #publi/#publicidade ([KLA Law](https://www.klalaw.com.br/conar-atualiza-guia-de-publicidade-com-influenciadores/), [Propmark](https://propmark.com.br/artigos/o-novo-guia-do-conar-para-influenciadores-e-os-riscos-da-falta-de-transparencia/)) [S]. Confirmar no texto oficial do CONAR.

## 5. Avaliação dos segmentos (nota 1–5 por critério)

| Segmento | Frequência do problema | Urgência | Facilidade de demonstrar | Potencial de assinatura | Aderência ao produto real | **Total** |
|---|---|---|---|---|---|---|
| A — Tutor ocupado | 4 | 3 | 5 | 3 (Grátis cobre 1 pet) | 5 | **20** |
| B — Muito envolvido | 4 | 2 | 4 | 3 | 4 | **17** |
| **C — Vários animais** | **5** (58% [D]) | **4** | **5** (troca de pet em 1 toque) | **5** (precisa do Plus/Premium) | **5** | **24** |
| D — Financeiro | 3 | 2 | 3 | 3 (recorrentes só no Plus) | 3 | **14** |
| E — Brincadeiras | 3 | 1 | 4 | 2 (Grátis tem 3) | 3 | **13** |

**Decisão:** público primário de conversão = **C (multi-pet)**; público de alcance/teste = **A (rotina corrida)**, com o gancho de dor universal. D e E entram como **benefícios de apoio**, não como promessa central. Subnicho de alta urgência para teste: **pet em tratamento com remédio de horário** [H].

## 6. Psicologia de compra

| Pergunta | Resposta (com tipo) |
|---|---|
| Que problema faz alguém procurar a solução? | Informação espalhada (carteirinha na gaveta, receita na galeria, conversa no WhatsApp) e a dúvida "já dei o remédio?" [Q/H] |
| Quando a pessoa percebe valor? | No **primeiro check** do dia: ver "3 de 5 concluídos" e o próximo cuidado. O onboarding já sugere a rotina por espécie, então o valor aparece em menos de 1 minuto [Q, produto] |
| Que função justifica o uso frequente? | Rotina diária com check-in (uso diário) > saúde (uso mensal) > gastos (semanal) [H] |
| O que gera confiança numa plataforma nova? | Sem cartão, sem cobrança automática, reembolso em 7 dias, exportação dos dados, "não substitui o veterinário" (honestidade) [produto] |
| Objeções antes da assinatura | "Vou ter que cadastrar tudo?" (não), "Tem que instalar?" (não), "Vai me cobrar?" (sem cartão), "Serve pra gato?" (sim), "Me lembra?" (**não**, com push; leva a agenda pro calendário do celular) |
| Por que continuaria depois da 1ª semana? | Sequência ("7 dias seguidos"), histórico de peso, a semana à vista; quem tem 2+ pets perde o acesso ao 2º pet no Grátis [H] |
| Diferença para uma agenda comum | Agenda não sabe o que é "rotina por pet", não marca dose, não guarda vacina/documento/gasto por pet, nem sugere rotina por espécie |

### Funcionalidade → benefício → mensagem

| Funcionalidade (real) | Benefício funcional | Benefício emocional | Mensagem publicitária |
|---|---|---|---|
| Rotina de hoje com check e anel de progresso | Ver o que já foi feito e o que falta | Tranquilidade, sem "será que esqueci?" | "Marque o que fez. Veja o que falta." |
| Próximo cuidado na tela Hoje | Saber a próxima dose/horário | Controle | "Saiba o que seu pet precisa hoje." |
| Saúde: vacinas (próximo reforço), remédios, consultas | Histórico pronto para o veterinário | Segurança | "Vacina, remédio e consulta no pet certo." |
| Documentos por pet | Achar receita/exame em segundos | Alívio | "Receita e exame a dois toques, não perdidos na galeria." |
| Gastos por categoria e por pet | Saber quanto cada pet custa | Planejamento | "Gastos separados por pet." |
| Cão e gato na mesma conta | Rotinas separadas, troca em 1 toque | Justiça com cada um | "Cada pet com a sua rotina. Todos no mesmo lugar." |
| Brincadeiras guiadas + sons | Ideia pronta para brincar | Vínculo | "E ideias de brincadeira para fazer juntos." |
| Agenda → calendário do celular | O calendário do celular avisa 1 h antes e na véspera | Não depender da memória | (usar só no FAQ/landing; não é diferencial de anúncio) |

## 7. Roteiro de varredura manual (para o dono da conta)
1. Meta Ads Library → país Brasil → termos "app pet", "carteira de vacina pet", "rotina do pet", "Petlove", "Guiavet" → anotar anúncios ativos há mais de 30 dias (sinal de que performam).
2. TikTok Creative Center → Top Ads → setor "Pets" → região BR → ordenar por CTR → anotar os 3 primeiros segundos de cada um.
3. Comentários de vídeos de veterinários no TikTok/Instagram com "esqueci" / "carteirinha" / "vermífugo": colar 30 frases reais num documento. Elas viram copy de gancho no 2º ciclo.
