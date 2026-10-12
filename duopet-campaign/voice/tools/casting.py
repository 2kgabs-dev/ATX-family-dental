import sys, os, re, json, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from tts import synth
from asr import transcribe
import unicodedata
TEXT = "Você organiza a sua rotina inteira... mas e a do seu pet? Ração, remédio, vacina, consulta: um pouco no calendário, um pouco no WhatsApp, e o resto na cabeça. Com o DuoPet, cada cuidado fica no lugar certo. Teste três dias grátis, sem cartão."
VOICES = ["kokoro:pm_alex", "kokoro:pf_dora", "kokoro:pm_santa", "piper:faber", "piper:cadu", "piper:jeff"]
def norm(t):
    t = unicodedata.normalize("NFD", t.lower()); t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", t).split()
def wer(ref, hyp):
    r, h = norm(ref), norm(hyp); d = np.zeros((len(r)+1, len(h)+1), int); d[:,0] = range(len(r)+1); d[0,:] = range(len(h)+1)
    for i in range(1, len(r)+1):
        for j in range(1, len(h)+1):
            d[i,j] = min(d[i-1,j]+1, d[i,j-1]+1, d[i-1,j-1]+(r[i-1]!=h[j-1]))
    return d[-1,-1]/len(r)
def f0_stats(a, sr):
    import librosa
    f0, vf, _ = librosa.pyin(a, fmin=60, fmax=400, sr=sr)
    f = f0[~np.isnan(f0)]
    semis = 12*np.log2(f/np.median(f))
    return float(np.median(f)), float(np.std(semis))
res = []
for v in VOICES:
    out = f"casting/{v.replace(':','_')}.wav"
    a, sr = synth(v, 1.0, TEXT); sf.write(out, a, sr)
    hyp = transcribe(out)
    try: med, sd = f0_stats(a.astype(np.float32), sr)
    except Exception as e: med, sd = 0, 0
    dur = len(a)/sr; words = len(norm(TEXT))
    res.append(dict(voice=v, dur=round(dur,2), wps=round(words/dur,2), wer=round(wer(TEXT, hyp),3), f0_med=round(med), pitch_sd_semitones=round(sd,2), asr=hyp))
    print(json.dumps(res[-1], ensure_ascii=False), flush=True)
json.dump(res, open("casting/casting-results.json","w"), ensure_ascii=False, indent=1)
