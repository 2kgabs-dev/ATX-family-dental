"""Casting de voz feminina (v3). Só modelos com licença comercial: Kokoro-82M (Apache-2.0).
pf_dora é a única voz feminina pt-BR do Kokoro; testamos também misturas do vetor de estilo
(timbre/prosódia) com vozes femininas de maior nota, mantendo os fonemas pt-BR.
Métricas: WER do ASR (inteligibilidade em português), desvio de altura em semitons (expressividade),
palavras por segundo (ritmo). Saída: voice/casting/fem/*.wav + casting-fem.json
"""
import sys, os, json, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
import build_vo as B
from asr import transcribe

ROOT = B.ROOT
OUT = f"{ROOT}/voice/casting/fem"; os.makedirs(OUT, exist_ok=True)
PARTS = ["Você organiza a sua rotina inteira…", "e a do seu pet?",
         "Ração, remédio, vacina, consulta…", "um pouco no calendário, um pouco no WhatsApp, e o resto na cabeça.",
         "No DuoPet, cada cuidado fica no lugar certo.", "Menos coisa na cabeça…", "e mais tempo pra quem você ama."]
REF = " ".join(PARTS)
CANDS = {
    "dora":            ({"pf_dora": 1.0}, 1.0),
    "dora_lenta":      ({"pf_dora": 1.0}, 0.92),
    "dora_heart30":    ({"pf_dora": .7, "af_heart": .3}, 0.95),
    "dora_heart50":    ({"pf_dora": .5, "af_heart": .5}, 0.95),
    "dora_sara40":     ({"pf_dora": .6, "if_sara": .4}, 0.95),
    "dora_edora40":    ({"pf_dora": .6, "ef_dora": .4}, 0.95),
    "dora_bella30":    ({"pf_dora": .7, "af_bella": .3}, 0.95),
    "dora_siwis30":    ({"pf_dora": .7, "ff_siwis": .3}, 0.95),
    "dora_sara_heart": ({"pf_dora": .5, "if_sara": .25, "af_heart": .25}, 0.95),
}

def style(mix):
    k = B.kokoro(); return sum(k.get_voice_style(n) * w for n, w in mix.items()).astype(np.float32)

def f0_sd(a):
    import librosa
    f0, _, _ = librosa.pyin(a, fmin=120, fmax=450, sr=B.SR)
    f = f0[~np.isnan(f0)]
    return float(np.median(f)), float(np.std(12 * np.log2(f / np.median(f))))

res = []
for name, (mix, speed) in CANDS.items():
    st = style(mix); chunks = []
    for i, p in enumerate(PARTS):
        a, _ = B.kokoro().create(B.phonemes(p), voice=st, speed=speed, lang="pt-br", is_phonemes=True)
        chunks += [B.trim(a.astype(np.float32)), np.zeros(int((0.32 if i in (0, 2, 5) else 0.45) * B.SR), np.float32)]
    y = np.concatenate(chunks); y = y / np.abs(y).max() * 0.89
    path = f"{OUT}/{name}.wav"; sf.write(path, y, B.SR)
    pad = np.concatenate([np.zeros(int(.5 * B.SR), np.float32), y, np.zeros(int(.8 * B.SR), np.float32)])
    sf.write(f"{OUT}/.asr.wav", pad, B.SR); hyp = transcribe(f"{OUT}/.asr.wav")
    med, sd = f0_sd(y)
    r = dict(name=name, mix=mix, speed=speed, dur=round(len(y) / B.SR, 2), wer=round(B.wer(REF, hyp), 3),
             f0=round(med), pitch_sd=round(sd, 2), wps=round(len(B.norm_words(REF)) / (len(y) / B.SR), 2), asr=hyp)
    res.append(r); print(json.dumps(r, ensure_ascii=False), flush=True)
os.remove(f"{OUT}/.asr.wav")
json.dump(res, open(f"{OUT}/casting-fem.json", "w"), ensure_ascii=False, indent=1)
