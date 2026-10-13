# DuoPet — Plano de mídia, mensuração e testes (Fases 16, 17 e 11)

> Nenhum número abaixo é resultado. São **metas iniciais e regras de decisão** para trocar hipótese por dado assim que a campanha rodar.

## 1. Funil e eventos a medir

```
Impressão → 3 s → 6 s → ThruPlay/100% → Clique no link → Landing (/?utm…) → "Testar 3 dias grátis"
→ Cadastro enviado → E-mail confirmado → Onboarding concluído (1º pet) → 1º check na rotina
→ 2º pet cadastrado → Dia 2 ativo → Checkout iniciado (/app/assinatura) → Assinatura paga → Renovação mês 2
```

| Métrica | Onde medir | Por que importa |
|---|---|---|
| Hook rate (3 s ÷ impressões) | Meta/TikTok | Força do gancho |
| Retenção 6 s, tempo médio, % conclusão | Meta/TikTok | Se a revelação e a demo seguram a atenção |
| CTR (link) e CPC | Meta/TikTok | Se o anúncio gera intenção |
| Taxa landing → clique em "Testar" | Analytics do site (`/api/events` já existe no app) | *Message match* |
| Custo por cadastro (CPL) | Pixel/CAPI `CompleteRegistration` | **Evento de otimização da fase 1** |
| Cadastro → e-mail confirmado | Supabase (somente leitura) | Maior vazamento provável |
| % com 1º check no dia 0 | Evento de produto | "Aha" do produto |
| % com 2º pet em 72 h | Evento de produto | Preditor de assinatura (Grátis = 1 pet) |
| Checkout iniciado → pago | Asaas + evento | Atrito de pagamento |
| CAC = investimento ÷ assinaturas pagas | Planilha | Meta econômica |
| Receita atribuída (30 dias) | Asaas × UTM salva no cadastro | Payback |

**Pré-requisito técnico (não alterei nada em produção):** salvar `utm_source`, `utm_campaign` e `utm_content` no momento do cadastro (cookie → perfil). Sem isso, não dá para ligar criativo a assinatura. Também é preciso confirmar se a **Conversions API** da Meta e o **Events API** do TikTok estão instalados.

## 2. UTMs por criativo

Padrão: `https://duopet.site/?utm_source={plataforma}&utm_medium=paid_social&utm_campaign=dp_{objetivo}_{aaaamm}&utm_content={criativo}&utm_term={público}`

| Criativo (arquivo) | utm_content |
|---|---|
| `master/duopet_master_36s_*.mp4` | `mst36_h0_vantagens` |
| `performance/duopet_perf-h1-dor_28s_*.mp4` | `prf28_h1_dor` |
| `performance/duopet_perf-h2-demo_27s_*.mp4` | `prf27_h2_demo` |
| `performance/duopet_perf-h3-multipet_28s_*.mp4` | `prf28_h3_multi` |
| `performance/duopet_perf-h4-remedio_27s_*.mp4` | `prf27_h4_remedio` |
| `curto/duopet_curto_11s_*.mp4` | `sht11_caogato` |
| Japa Dorama — corte A / B | `cri_jd_a` / `cri_jd_b` |

Exemplos prontos:
- Meta, multi-pet: `https://duopet.site/?utm_source=meta&utm_medium=paid_social&utm_campaign=dp_cadastro_202610&utm_content=prf28_h3_multi&utm_term=multipet`
- TikTok, amplo: `https://duopet.site/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=dp_cadastro_202610&utm_content=prf28_h1_dor&utm_term=amplo`

## 3. Estrutura de campanha sugerida (fase 1, 14 dias)

| Conjunto | Público | Criativos | Observação |
|---|---|---|---|
| A — Amplo | BR, 22–55, sem interesses (deixe o algoritmo achar) | H1, H2, H4, curto 11 s | Teste de gancho |
| B — Multi-pet | Interesses: gatos + cães, pet shop, ração para gatos E cães; ou lookalike de quem cadastrou 2 pets (quando houver 100+) | H3, master | Hipótese de maior LTV |
| C — Remarketing | Visitou landing e não cadastrou (7 dias) | master 36 s (11 vantagens + oferta), depoimento real (quando houver) | Prova e objeções |

Orçamento: distribuir de forma igual entre os criativos do conjunto A até cada um ter **pelo menos 50 cadastros ou 2× o CPL-alvo gasto sem cadastro** (regra de corte). Não declarar vencedor antes disso.

## 4. Testes A/B (uma variável por vez)

| Teste | Variável | Versões | Hipótese | Métrica de decisão | Métrica de alerta |
|---|---|---|---|---|---|
| **A — Dor × Demonstração** | Primeiros 3 s | `perf_h1` (dor) × `perf_h2` (demo) | Mostrar o produto já no frame 1 atrai clique mais qualificado (CPL igual, mais 1º check) | CPL e % 1º check | Hook rate |
| **B — Profundidade (teste de conceito)** | Quantidade de vantagens (e o gancho junto: 2 variáveis, então ler como conceito) | `master` (36 s, 11 vantagens, "Tem cão e gato?") × `perf_h2` (27 s, 7 vantagens, demo primeiro) | Mais vantagens qualificam o clique (2º pet, assinatura) mesmo com menos conclusão | % assinatura em 7 dias e CPL | % conclusão |
| **C — Locução × Criador** | Voz/rosto | `perf_h1` × corte Japa Dorama A | O criador traz confiança e reduz o CPL no público dele | CPL, e-mail confirmado | Comentários negativos |
| **D — Curto × Longo** | Duração | `short15` (11 s) × `perf_h1` (28 s) | O curto ganha em CPM/alcance, o de 28 s ganha em qualidade (2º pet, assinatura) | CPL **e** % assinatura em 7 dias | CTR |
| E — Gancho multi-pet | Público + gancho | `perf_h3` no conjunto B × `perf_h1` no conjunto A | Multi-pet tem CPL maior, mas assinatura/CAC melhores | CAC | CPL |

Regras:
- Significância prática: só troque o vencedor se a diferença em CPL for ≥ 20% com pelo menos 50 conversões por braço. Com volume menor, trate como sinal, não como prova.
- Rode cada teste por no mínimo 7 dias, para cobrir os dias da semana.
- **Não otimizar por visualização.** Um criativo com hook rate alto e CPL alto perde para um com hook rate médio e CPL baixo.

## 5. Metas iniciais para calibrar (hipóteses, a substituir por dados)

| Métrica | Sinal bom | Sinal ruim | Ação se ruim |
|---|---|---|---|
| Hook rate 3 s | ≥ 30% | < 20% | Trocar gancho (G9, G6 no banco) |
| Retenção até a revelação (≈ 10–13 s) | ≥ 15% das impressões | < 8% | Encurtar o caos / testar `short15` |
| CTR link | ≥ 1% | < 0,5% | Revisar CTA e oferta na legenda do anúncio |
| Landing → cadastro iniciado | ≥ 20% | < 10% | Problema de *message match* ou de landing |
| Cadastro → e-mail confirmado | ≥ 70% | < 50% | Revisar e-mail (assunto, remetente) ou entrada sem confirmação |
| 1º check no dia 0 | ≥ 50% | < 30% | Onboarding |
| Assinatura em 7 dias ÷ cadastros | definir após 2 semanas | — | — |

## 6. Ciclo de iteração
1. Semana 1: teste de ganchos (A, D) no conjunto amplo.
2. Semana 2: vencedor de gancho × multi-pet (E) + remarketing ligado.
3. Semana 3: entra o criador (C) com o melhor gancho como controle.
4. A cada ciclo: substituir as hipóteses deste documento por números reais e registrar decisão + motivo.
