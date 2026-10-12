import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from tts import synth
from asr import transcribe
import soundfile as sf
variants = ["e a do seu pet?", "e a do seu pét?", "e a do seu péti?", "e a do seu pétchi?",
            "Com o DuoPet, fica fácil.", "Com o Duo Pet, fica fácil.", "Com o Duo Pét, fica fácil.", "Com o Dúo Péti, fica fácil.", "Com o Duopéti, fica fácil.",
            "duopet ponto site", "Duo Pét ponto site", "dúo péti ponto saite"]
os.makedirs("casting/pron", exist_ok=True)
for v in ["kokoro:pm_santa", "kokoro:pf_dora"]:
    for i, t in enumerate(variants):
        p = f"casting/pron/{v.split(':')[1]}_{i}.wav"; a, sr = synth(v, 0.92, t); sf.write(p, a, sr)
        print(v, "|", t, "=>", transcribe(p), flush=True)
