# DuoPet — Auditoria do produto e do funil (Fase 2)

Feita em 12/10/2026, **somente leitura**, sem login, sem criar conta e sem tocar em Supabase, Vercel, pagamentos ou código.

Fontes:
1. Site público www.duopet.site (landing, /planos, /cadastro), lido por um sandbox com acesso à internet. As capturas da demonstração interativa estão em `assets/ui-ref/`.
2. Manifesto do deploy de produção na Vercel (somente leitura), só listagem de arquivos e alguns documentos internos.
3. Vídeo de referência enviado pelo cliente (31 s).

Não consegui navegar dentro do app logado. Para isso seria preciso criar uma conta em produção, e isso escreveria no banco. As telas do app no filme foram **reconstruídas a partir da demonstração interativa oficial da landing**, que usa dados de exemplo (Thor e Mia), com o mesmo texto, layout, ícones e cores.

## 1. Funcionalidades confirmadas

| Recurso | Evidência | Pode aparecer no anúncio? |
|---|---|---|
| Rotina de hoje: checklist com horário, check/desfazer, anel de % e "Próximo: 18:00 · Passeio" | Demo da landing, rota `/app/rotina` | **Sim, é o herói** |
| Recorrência: todo dia, dias da semana, a cada N dias, qualquer hora | Landing ("Rotina que se repete do seu jeito") | Sim |
| Rotina sugerida por espécie no cadastro (cães: água, alimentação, passeio, brincadeira, treino; gatos: água, alimentação, caixa de areia, caça, arranhador) | Landing | Sim |
| Saúde: vacinas com próximo reforço, remédios com dose e período, consultas | Demo + rota `/app/saude` | Sim |
| Semana: % concluída, "7 dias seguidos", peso com tendência | Demo | Sim |
| Próximos: medicamento em X min, cuidados restantes, reforço de vacina, banho e tosa | Demo + `/app/agenda` | Sim, como **informação na tela**, nunca como notificação |
| Documentos por pet (receita, exame, carteirinha em PDF/foto) | Landing + `/app/documentos` | Sim |
| Gastos por categoria e por pet (todos os planos); despesas recorrentes e orçamento (Plus+) | /planos + `/app/gastos` | Sim |
| Brincadeiras/atividades guiadas, "Aprender em 5 minutos", sons de brinquedo (32 sons sintetizados, 19 por espécie) | Landing + `/app/missoes`, `/app/sons` + doc de entrega de 07/10 | Sim |
| Cão e gato na mesma conta, troca de pet em 1 toque | Demo (Thor ↔ Mia) | **Sim, é o diferencial de conversão** |
| Agenda exportável para o calendário do celular (.ics), que avisa 1 h antes e na véspera | FAQ + `/api/agenda/ics` | Só como explicação (FAQ/landing) |
| Exportar registros em JSON; excluir conta | FAQ + `/api/export` | Não é argumento de anúncio |
| Funciona no navegador do celular e do computador, dá para adicionar à tela inicial | FAQ | Sim ("sem instalar") |

## 2. O que NÃO existe e não pode ser prometido

- **Notificação push, WhatsApp ou e-mail de lembrete.** O FAQ diz textualmente: "O DuoPet não envia WhatsApp, e-mail nem notificação push." e /planos: "Nenhum plano inclui (...) notificações fora do app."
- **Cuidado dividido com outras pessoas**: "(em breve)" no Premium.
- Atendimento, diagnóstico, prescrição ou calendário de vacinação: "não substitui o veterinário".
- Integração com clínicas veterinárias: não encontrada.

### Alerta sobre o vídeo de referência atual
O vídeo enviado usa **"LEMBRE."** com ícone de sino, a frase "sem esquecer vacina, remédio, consulta" e um card "PRÓXIMO CUIDADO · Remédio do Thor · Hoje 18:00" com cara de notificação. Para quem assiste, isso promete **lembrete automático**, que o produto não oferece. Os riscos:
1. Expectativa frustrada → reembolso em 7 dias (art. 49 CDC) e avaliação negativa.
2. Anúncio enganoso (CONAR/CDC art. 37).
3. Na landing, o visitante lê no FAQ que não há push, e a quebra de expectativa derruba a conversão.

**Correção adotada na campanha:** "**À vista**" / "**Veja o próximo cuidado**" no lugar de "Lembre". Nenhum sino, nenhuma notificação simulada. O vídeo atual também mostra telas de uma versão anterior da UI ("Painel da casa", "Hoje" com rótulos em mono). O filme novo usa a UI atual da landing.

## 3. Oferta comercial (verificada em 12/10/2026)

| Item | Valor |
|---|---|
| Teste | **3 dias de Plus grátis, sem cartão e sem cobrança automática** (72 h, migração `20261007203608_three_day_trial`) |
| Depois do teste | Continua no **Grátis**: 1 pet, rotina, check-in e lembretes de saúde na tela, últimos 30 dias de histórico, 3 brincadeiras guiadas |
| Essencial | R$ 29,90/mês: 1 pet, histórico completo, todas as brincadeiras, 2 GB |
| Plus (recomendado) | R$ 39,90/mês: até 2 pets, despesas recorrentes e orçamento, 3 GB |
| Premium | R$ 54,90/mês: até 4 pets, cuidado dividido com até 5 pessoas **(em breve)**, 8 GB |
| Pagamento | Asaas, Pix ou cartão; cancelamento em "Meu plano"; reembolso integral em até 7 dias |

⚠ **Ponto a confirmar com o dono antes de investir em mídia:** o relatório interno de 05/10 classifica o produto como "VERMELHO para liberar vendas sem homologação", e o código tem um aviso de "Assinaturas temporariamente indisponíveis" que liga quando a cobrança está desativada. Não consigo verificar de fora se a cobrança em produção está ligada hoje (`/api/billing/status` exige login). **Se a assinatura ainda não estiver ativa, rode a campanha otimizando para cadastro, não para compra.**

## 4. Jornada (anúncio → assinatura)

```
Anúncio → landing (/?utm…) → "Testar 3 dias grátis" → /cadastro (nome, e-mail, senha ≥10, aceite)
→ /verificar-email (confirmação por e-mail) → /app/onboarding (nome + espécie + cuidados sugeridos)
→ /app (Hoje) → 3 dias de Plus → Grátis (1 pet) ou /app/assinatura (Asaas)
```

Pontos de atrito identificados (opinião):
1. **Confirmação de e-mail antes do primeiro uso**: costuma ser o maior vazamento de cadastros vindos de anúncio, porque a pessoa sai do Instagram, abre o e-mail e não volta. Medir a taxa cadastro → e-mail confirmado já na primeira semana.
2. **Senha mínima de 10 caracteres** no celular: atrito extra. Avaliar login por link mágico ou Google.
3. **Trial de 3 dias**: curto para criar hábito. A pessoa precisa usar pelo menos 2 dias para ver a "semana" e a sequência. Hipótese a testar: 7 dias (decisão de negócio, não alterei nada).
4. A landing **já tem boa coerência com o anúncio**: o hero "Saiba o que seu pet precisa hoje" é seguido da demo da rotina. Por isso a narrativa do filme termina com essa mesma frase (*message match*).
5. Mensagem de multi-pet: está na landing ("Cão e gato na mesma conta"), mas não no hero. Para o tráfego da campanha multi-pet, recomendo uma variação de landing com o Plus em destaque. Detalhes em `performance-plan/funil.md`.

## 5. Identidade visual extraída do CSS de produção

| Token | Valor |
|---|---|
| Verde floresta (primária) | `#203b2d` (hover `#172c21`) |
| Terracota (acento) | `#c9684a`; texto de acento `#a94e33`; sobre fundo escuro `#e69a7f` |
| Caramelo / cacau (logo) | `#c9a063` / `#5a4632` |
| Fundo da página | `#f4f2ee`; elevado `#ffffff`; afundado `#ebe8e2` |
| Noite (fundo escuro) | `#0e1311`; texto `#f4f2ee` |
| Texto | `#141a16`; secundário `#5a5f59` |
| Sucesso | `#2e6a45` |
| Tipografia | **Geist** (variável 100–900); display peso ~640, tracking −0,038 em; mono para rótulos |
| Easing | `cubic-bezier(.22,1,.36,1)` (saída), `(.34,1.4,.64,1)` (mola), `(.16,1,.3,1)` ("satisfying") |
| Sombras | `0 18px 44px -16px #141a1633` (lg), `0 50px 90px -30px #141a1661` (xl) |

Assinatura do vídeo atual, mantida no filme: palavra-chave em caixa alta pesada com **ponto final terracota** ("SEU PET.").

## 6. Ativos usados no filme
- Logo oficial (`/brand/logo-512.webp`), com alfa preservado.
- Fotos oficiais do site (geradas com IA pela marca): cão preto e gato em grande-angular (recortados), dálmata com bolinha (recortado), golden "Thor", quatro pets espiando, gato + border collie, família de 3 gatos + pitbull.
- **Não há filmagem real de tutor com pet.** A cena 06 do briefing pede isso. No filme, uso fotografia da marca com movimento de câmera 2.5D. **Recomendo gravar** 2 planos de 4 s (tutor no sofá com o cão; mão fazendo carinho no gato) e trocar o arquivo no projeto (`compositions/public/footage/`).
