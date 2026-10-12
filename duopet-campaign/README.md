# DuoPet — "Tudo no seu lugar." Campanha de aquisição (out/2026)

Pasta-mãe de todos os entregáveis. Comece por **`RELATORIO.md`**, que tem a visão geral, as decisões, a avaliação e os próximos passos.

```
duopet-campaign/
├── RELATORIO.md                 ← relatório executivo + matriz de avaliação 0–10
├── research/                    ← pesquisa de mercado (com fontes) e auditoria do produto
├── scripts/                     ← estratégia, 12 ganchos, roteiros com timecode, plano com o criador
├── storyboard/                  ← storyboard (quadros-chave renderizados + descrição por cena)
├── assets/                      ← logo, fotos oficiais (com alfa), referências de UI capturadas do site
├── voice/                       ← locução (v3: voz feminina; casting, falas isoladas, tempos por palavra, trilhas por versão)
├── music/                       ← trilha original por versão + código do compositor
├── sfx/                         ← efeitos por versão (sintetizados)
├── compositions/                ← PROJETO-FONTE EDITÁVEL (Remotion/React)
├── renders/                     ← MP4 finais (master, performance ×4 ganchos, curto) com/sem legenda + mixes
├── qa/                          ← relatórios automáticos de QA, prévias em tamanho de celular
└── performance-plan/            ← plano de testes A/B, UTMs, métricas, recomendações de funil
```

## Como editar e re-renderizar
Requisitos: Node 22, Python 3.11+ (numpy, scipy, soundfile, pyloudnorm, kokoro-onnx, sherpa-onnx), ffmpeg, Chromium.

```bash
cd compositions && npm install
npx remotion studio src/index.ts          # editor visual (preview ao vivo)
python3 build_timeline.py fem             # 1) sincronia (cenas, legendas Caption[], transições, cues, SFX) a partir da locução
python3 ../music/tools/build_audio.py     # 2) trilha + efeitos + mix (-14 LUFS, pico -1 dBFS)
./queue.sh                                # 3) renderiza todas as versões e multiplexa o áudio
python3 ../qa/tools/video_qa.py ../renders/*/*.mp4   # 4) QA dos arquivos finais
```

Pontos de edição mais comuns:
- **Textos falados**: `scripts/vo-lines.json` → `SPEED_MUL=1.04 python3 voice/tools/build_vo.py "kokoro:pf_dora*0.6+ef_dora*0.4" fem` → passos 1 a 3. O script já mede o tempo real de cada palavra (ASR Parakeet) para as legendas.
- **Transições**: tabela `CUTS` em `compositions/build_timeline.py` (tipo e duração por corte; o som de cada uma sai daí) e efeitos em `compositions/src/components/Transitions.tsx`.
- **Legendas**: `compositions/src/components/Captions.tsx` (visual) e `to_captions()`/`_paginate()` em `build_timeline.py` (quebra das páginas).
- **Cores/fontes/curvas**: `compositions/src/theme.ts` (tokens extraídos do CSS de produção).
- **Telas do app**: `compositions/src/components/AppUI.tsx`.
- **Cenas**: `compositions/src/scenes/` (Hooks, Story, Creator).
- **Trocar por vídeo real** (tutor + pet): colocar em `compositions/public/footage/` e usar `<OffthreadVideo>` na cena `Emotion`.

## Skill oficial do Remotion (v3)
As Agent Skills oficiais do Remotion (`remotion-dev/skills`) estão instaladas no projeto, em `../.claude/skills/` (instalação: `npx skills add remotion-dev/skills`). Regras aplicadas nesta versão:
- **captions**: legendas no tipo `Caption` do `@remotion/captions` (JSON gerado em `build_timeline.py`, com espaço antes de cada palavra e `pageBreakAfter`) e páginas com `createTikTokStyleCaptions`. **Desvio consciente:** a regra sugere a legenda dentro da `Sequence` de cada cena, mas aqui ela fica numa faixa única acima da `TransitionSeries`. Dentro da cena, o mergulho e o portal escalavam a legenda, o whip a desfocava e a fusão mostrava duas placas ao mesmo tempo. As quebras continuam por cena.
- **transitions + light-leaks**: montagem com `<TransitionSeries>`, `premountFor={fps}` em cada sequência e overlay, apresentações customizadas e `lightLeak()` do `@remotion/effects` sobre `<Solid>`.
- **measuring-text**: `measureText()` do `@remotion/layout-utils` só depois de as fontes carregarem (posição da pílula da legenda).
- **voiceover**: a skill recomenda ElevenLabs. Não foi possível usar (conta Higgsfield sem créditos); usei Kokoro local e deixei a troca documentada em `voice/README.md`.

Observação técnica: o `@remotion/transitions` 4.0.534 publicou um build ESM que embute o react-dom 19 por engano e quebra com React 18. `render.mjs` e `remotion.config.ts` apontam para o build CommonJS do mesmo pacote. A 4.0.535 corrige isso; ao atualizar, essa linha pode sair.
