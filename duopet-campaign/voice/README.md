# Locução (Fase 9)

## O que foi usado e por quê
- **Motor:** Kokoro-82M (licença Apache-2.0) rodando **localmente**, sem enviar o texto a terceiros. As vozes Piper pt_BR (datasets CC0) entraram como 3ª interpretação.
- **Não há voz de pessoa real clonada.** Nada do Japa Dorama foi sintetizado.
- A conta do Higgsfield conectada estava com **0 créditos**, então os motores comerciais (ElevenLabs/MiniMax via Higgsfield) não puderam ser usados.

## Casting: 3 interpretações avaliadas
Todas com o mesmo roteiro do master. WER = erro de transcrição por reconhecimento automático (Whisper small, local), usado como medida objetiva de inteligibilidade. Quanto menor, melhor.

| Interpretação | Arquivos | WER médio | Tom (F0 mediano) | Expressividade (desvio de tom) | Ritmo |
|---|---|---|---|---|---|
| **1. Masculina, próxima e confiante — `pm_alex` (ESCOLHIDA)** | `pm_alex/` | **7,6%** | 137 Hz | **3,42 semitons** (a mais variada) | 137 palavras/min |
| 2. Feminina, acolhedora — `pf_dora` | `pf_dora/` | 8,5% | 184 Hz | 2,99 st | 141 ppm |
| 3. Masculina, ritmo de varejo — Piper `faber` | `faber/` | 13,7% | 158 Hz | 3,15 st | 172 ppm (corrida) |

**Por que a 1:** é a mais inteligível e a com mais variação de entonação, e tem o ritmo mais calmo, o que ajuda a fala a não soar "lida". A Piper ficou corrida (172 ppm) e errou mais ("cão ou gato" virou "mugato"). A voz feminina é uma boa alternativa para um **teste de voz** depois que o gancho vencedor for definido.

**Correções de pronúncia aplicadas no nível de fonema** (`tools/build_vo.py`):
- "pet" → "pé-tchi" e "pets" → "péts" (pronúncia brasileira; antes saía "patch").
- "DuoPet" → "Dú-o Pé-tchi" (antes saía "Du-pet").
- "site" → "sai-tchi"; "certo" sem a vogal fantasma ("sér-tu").

## Limitação honesta
Por melhor que seja, uma voz sintética não alcança a interpretação de um locutor profissional (micro-pausas, sorriso na voz, ênfase intencional). **Recomendo gravar com um locutor humano** antes de escalar a verba e manter a voz sintética como guia de tempo e animatic. Trocar a voz é simples: grave as falas com os mesmos IDs, salve em `voice/humano/<ID>.wav` e rode:

```bash
python3 compositions/build_timeline.py humano   # recalcula tempos e legendas pela nova voz
python3 music/tools/build_audio.py              # remixa trilha + efeitos + voz
./compositions/queue.sh                         # re-renderiza todas as versões
```
(Para a voz humana, gere `voice/humano/timings.json` com o mesmo formato. O script `tools/build_vo.py` mostra como; ou peça para eu fazer a partir das gravações.)

## Roteiro de gravação para locutor humano
Tom geral: conversa com um amigo que tem pet, nada de "voz de propaganda". Energia que sobe do gancho até a demo e volta a ficar calorosa no fim. Os tempos são os do filme. Pode respirar.

| ID | Fala | Direção | Tempo-alvo |
|---|---|---|---|
| M1 | Você organiza a sua rotina inteira… e a do seu pet? | Curiosidade genuína, sorriso leve no "pet" | 4,2 s |
| M2 | Ração, remédio, vacina, consulta… um pouco no calendário, um pouco no WhatsApp, e o resto na cabeça. | Reconhecimento, quase rindo do próprio caos; acelera na lista e desacelera no "cabeça" | 7,5 s |
| M3 | No DuoPet, cada cuidado fica no lugar certo. | Descoberta; abra a voz no "DuoPet" | 3,9 s |
| M4 | Você vê o que o seu pet precisa hoje, marca o que já fez… e sabe exatamente o que falta. | Clareza e segurança, como quem mostra a tela | 6,5 s |
| M5 | Vacinas, remédios, gastos e até brincadeiras guiadas… pra cada pet da casa, cão ou gato. | Leve, ritmado; "cão ou gato" com sorriso | 6,7 s |
| M6 | Menos coisa na cabeça… e mais tempo pra quem você ama. | Calor humano, mais baixo, sem melodrama | 4,6 s |
| M7 | DuoPet. Teste três dias grátis, sem cartão. Acesse duopet ponto site. | Convite direto e confiante; "sem cartão" bem claro | 6,5 s |
| H1 | Ração, remédio, vacina, consulta… tá tudo onde? | Gancho, ritmo rápido | 3,8 s |
| H2 | É assim que a rotina do seu pet deveria ficar. | Demonstração, confiante | 3,0 s |
| H3 | Dois pets, duas rotinas… e quem guarda tudo é a sua cabeça? | Cumplicidade | 4,5 s |
| H4 | Já deu o remédio hoje… ou foi ontem? | Dúvida real, pausa antes do "ou" | 3,4 s |
| P2a | Um pouco no calendário, um pouco no WhatsApp… e o resto na cabeça. | Igual à M2 | 5,0 s |
| P2b | Nada de um pouco no calendário, um pouco no WhatsApp e o resto na cabeça. | Contraste, mais firme | 5,3 s |
| P4 | Você vê o que o seu pet precisa hoje, marca o que já fez… e sabe o que falta. | Igual à M4 | 5,6 s |
| P5 | Cão e gato na mesma conta… cada um com a sua rotina. | Leve | 3,9 s |
| P6 | Teste três dias grátis, sem cartão. Acesse duopet ponto site. | CTA | 5,1 s |
| S1–S4 | Os cuidados do seu pet estão espalhados? / No DuoPet, fica tudo num lugar só. / Marque o que fez. Veja o que falta. / Três dias grátis, sem cartão. duopet ponto site. | 15 s: direto, sem pressa artificial | 2,7 / 3,2 / 2,6 / 4,0 s |

## Arquivos
- `pm_alex/<ID>.wav`: falas isoladas, 24 kHz/24 bit (voz escolhida). `pf_dora/`, `faber/`: alternativas do casting.
- `mix/<versão>_voice.wav`: trilha de voz de cada versão, já posicionada no tempo, com EQ e compressão (48 kHz).
- `*/qa.json`: transcrição automática e WER de cada fala. `*/timings.json`: tempos por palavra (usados nas legendas).
