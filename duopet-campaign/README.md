# DuoPet — "Tudo no seu lugar." Campanha de aquisição (out/2026)

Pasta-mãe de todos os entregáveis. Comece por **`RELATORIO.md`**, que tem a visão geral, as decisões, a avaliação e os próximos passos.

```
duopet-campaign/
├── RELATORIO.md                 ← relatório executivo + matriz de avaliação 0–10
├── research/                    ← pesquisa de mercado (com fontes) e auditoria do produto
├── scripts/                     ← estratégia, 12 ganchos, roteiros com timecode, plano com o criador
├── storyboard/                  ← storyboard (quadros-chave renderizados + descrição por cena)
├── assets/                      ← logo, fotos oficiais (com alfa), referências de UI capturadas do site
├── voice/                       ← locução (falas isoladas, casting de 3 vozes, trilhas de voz por versão)
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
python3 build_timeline.py pm_alex         # 1) sincronia (cenas, legendas, cues, SFX) a partir da locução
python3 ../music/tools/build_audio.py     # 2) trilha + efeitos + mix (-14 LUFS, pico -1 dBFS)
./queue.sh                                # 3) renderiza todas as versões e multiplexa o áudio
python3 ../qa/tools/video_qa.py ../renders/*/*.mp4   # 4) QA dos arquivos finais
```

Pontos de edição mais comuns:
- **Textos falados**: `scripts/vo-lines.json` → `python3 voice/tools/build_vo.py kokoro:pm_alex` → passos 1 a 3.
- **Cores/fontes/curvas**: `compositions/src/theme.ts` (tokens extraídos do CSS de produção).
- **Telas do app**: `compositions/src/components/AppUI.tsx`.
- **Cenas**: `compositions/src/scenes/` (Hooks, Story, Creator).
- **Trocar por vídeo real** (tutor + pet): colocar em `compositions/public/footage/` e usar `<OffthreadVideo>` na cena `Emotion`.
