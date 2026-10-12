import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from tts import synth
from asr import transcribe
import soundfile as sf
variants = ["Dúo Péti.", "Conheça o Dúo Péti.", "No Dúo Péti, cada cuidado fica no lugar certo.", "No Duo-Péti, cada cuidado fica no lugar certo.",
            "Acesse dúo péti ponto saite.", "É só acessar: dúo, péti, ponto saite.", "Teste três dias grátis, sem cartão.", "Ração, remédio, vacina, consulta."]
for v in ["kokoro:pm_santa", "kokoro:pm_alex", "kokoro:pf_dora"]:
    for i, t in enumerate(variants):
        p = f"casting/pron/b_{v.split(':')[1]}_{i}.wav"; a, sr = synth(v, 0.92, t); sf.write(p, a, sr)
        print(v.split(':')[1], "|", t, "=>", transcribe(p), flush=True)
