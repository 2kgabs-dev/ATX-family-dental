# DuoPet — Recomendações de funil (Fase 16)

Análise feita de fora, somente leitura, em 12/10/2026. Nada foi alterado em produção. A ordem é de impacto estimado ÷ esforço (opinião).

## O que já está bom
- O hero da landing ("Saiba o que seu pet precisa hoje") é concreto e bate com a demo logo abaixo. O filme termina com a mesma frase, de propósito.
- Oferta clara e honesta: 3 dias de Plus, sem cartão, sem cobrança automática, reembolso em 7 dias, preço visível. É raro e gera confiança.
- O FAQ responde às objeções reais, inclusive a que mais pesa ("não manda push").
- Demonstração interativa com dados de exemplo: excelente para quem chega do anúncio.

## Riscos e oportunidades

| # | Achado | Por que importa | Recomendação | Esforço |
|---|---|---|---|---|
| 1 | **Confirmação de cobrança em produção não verificável de fora** (relatório interno de 05/10: "VERMELHO para liberar vendas sem homologação") | Investir em mídia com o checkout desligado queima o orçamento | Confirmar que o Asaas está em produção e que `/app/assinatura` conclui um Pix real antes de escalar | Baixo |
| 2 | **E-mail de confirmação antes do primeiro uso** (`/verificar-email`) | Quem vem do Instagram sai para o e-mail e muitas vezes não volta | Medir a queda. Se for alta: deixar entrar no app logo e pedir a confirmação depois (com limite de 24 h), ou login com Google/link mágico | Médio |
| 3 | Senha com mínimo de 10 caracteres no celular | Atrito no formulário | Login por link mágico/Google, ou mostrar "força" sem exigir 10 | Baixo |
| 4 | **UTM não é salva no cadastro** (não encontrei evidência) | Sem isso, não dá para saber qual criativo gera assinatura | Gravar `utm_*` + `fbclid`/`ttclid` no perfil no momento do cadastro | Baixo |
| 5 | Pixel/CAPI da Meta e Events API do TikTok | Otimização por cadastro depende disso | Disparar `CompleteRegistration` no servidor após criar a conta, e `Subscribe` após o pagamento | Médio |
| 6 | Trial de 3 dias | Curto para criar o hábito diário (a semana e a sequência só fazem sentido depois de vários dias) | Testar 7 dias de Plus num experimento separado (decisão de negócio; não altera o anúncio, que diz "3 dias") | Médio |
| 7 | O multi-pet não está no hero | O público que mais converte em assinatura chega e não se vê no topo | Variação de landing para `utm_term=multipet`: "Cão e gato na mesma conta. Cada um com a sua rotina." + Plus em destaque | Baixo |
| 8 | "Rotina compartilhada com quem cuida junto" aparece na lista "Com o DuoPet", mas o recurso está "em breve" no Premium | Promessa que o produto ainda não cumpre | Marcar "(em breve)" também ali, ou remover até lançar | Baixo |
| 9 | O vídeo antigo usa "LEMBRE." com sino | Contradiz o FAQ ("não envia push") | Tirar esse criativo de circulação. O filme novo não promete lembrete | Baixo |
| 10 | Primeiras 72 h sem "empurrão" para o 2º pet | O 2º pet é o que pede o Plus | No onboarding: "Tem outro pet em casa? Adicione agora — o Plus está liberado por 3 dias." | Médio |
| 11 | Sem prova social na landing | Produto novo: confiança vem de gente real | Coletar 5–10 depoimentos reais (com autorização) dos primeiros usuários. **Não inventar.** | Médio |

## Coerência anúncio → landing (checklist)
- [x] O filme promete "ver o que falta hoje" → a landing mostra a rotina logo abaixo do hero.
- [x] O filme diz "3 dias grátis, sem cartão" → o hero repete a frase.
- [x] O filme mostra cão **e** gato → a landing tem "Cão e gato na mesma conta".
- [ ] O filme mostra gastos → a landing cita gastos só nos planos. Sugestão: um card "Gastos por pet" na seção de recursos.
- [x] O filme não promete notificação → coerente com o FAQ.

## Copy sugerida para o e-mail de confirmação (se for mantido)
- Assunto: "Falta 1 toque para começar a rotina do seu pet"
- Corpo: botão "Confirmar e abrir o DuoPet", com a frase "Seu teste de 3 dias do Plus já está valendo."
