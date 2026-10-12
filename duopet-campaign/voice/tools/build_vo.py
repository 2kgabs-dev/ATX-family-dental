"""Gera a locução de todas as falas de scripts/vo-lines.json para uma voz.

python build_vo.py kokoro:pf_dora   -> voice/pf_dora/<ID>.wav + timings.json + qa.json
Pronúncia: correções no nível de fonema para "pet"/"DuoPet"/"site" (ver PRON_FIXES).
Cada fala é verificada por ASR (Whisper small, local) e o WER fica em qa.json.
"""
import sys, os, re, json, unicodedata
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from asr import transcribe

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
M = os.environ.get("TTS_MODELS", "/tmp/claude-0/-home-user-ATX-family-dental/d7d0bf5e-2b54-532d-842a-8feb644dcc75/scratchpad/models")
SR = 24000

TEXT_FIXES = [(r"duopet ponto site", "DuoPet ponto saite"), (r"\bWhatsApp\b", "WhatsApp")]
PRON_FIXES = [
    (r"dˈuʊ pˈɛtʃi?", "dˈu o pˈɛtʃi"),       # DuoPet: "Dú-o Pé-tchi"
    (r"dˌuʊ pˈɛtʃi?", "dˈu o pˈɛtʃi"),
    (r"pˈɛtʃ(?!i)", "pˈɛtʃi"),                 # pet -> "pétchi" (pronúncia brasileira)
    (r"pˈets\b", "pˈɛts"),                     # pets -> "péts" (e aberto)
    (r"ɾə(?=[ptkbdgfvszʃʒmnlɾ])", "ɾ"),       # epêntese indevida: "sérətu" -> "sértu"
]

_k = None
def kokoro():
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro
        _k = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
    return _k

def phonemes(text):
    for a, b in TEXT_FIXES: text = re.sub(a, b, text)
    p = kokoro().tokenizer.phonemize(text, "pt-br")
    for a, b in PRON_FIXES: p = re.sub(a, b, p)
    return p

_piper = {}
def piper(voice, text, speed):
    import sherpa_onnx
    for a, b in [(r"duopet ponto site", "dúo péti ponto saite"), (r"DuoPet", "Dúo Péti"), (r"\bpets?\b", "péti")]:
        text = re.sub(a, b, text)
    if voice not in _piper:
        d = f"{M}/vits-piper-pt_BR-{voice}-medium"
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f"{d}/pt_BR-{voice}-medium.onnx", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data"), num_threads=4))
        _piper[voice] = sherpa_onnx.OfflineTts(cfg)
    g = _piper[voice].generate(text, sid=0, speed=speed)
    a = np.array(g.samples, dtype=np.float32)
    import scipy.signal as ss
    return ss.resample_poly(a, SR, g.sample_rate).astype(np.float32)

def synth(spec, text, speed):
    eng, voice = spec.split(":")
    if eng == "piper": return piper(voice, text, speed)
    a, sr = kokoro().create(phonemes(text), voice=voice, speed=speed, lang="pt-br", is_phonemes=True)
    assert sr == SR
    return a.astype(np.float32)

def trim(a, db=-58, pad=0.06):
    env = np.abs(a); thr = 10 ** (db / 20) * max(1e-6, env.max())
    idx = np.where(env > thr)[0]
    if len(idx) == 0: return a
    s = max(0, idx[0] - int(pad * SR)); e = min(len(a), idx[-1] + int(pad * SR))
    out = a[s:e].copy(); f = int(0.008 * SR)
    out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    return out

def norm_words(t):
    t = unicodedata.normalize("NFD", t.lower()); t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = t.replace("duopet.site", "duopet ponto site").replace("3", "tres")
    return re.sub(r"[^a-z0-9 ]", " ", t).split()

def wer(ref, hyp):
    r, h = norm_words(ref), norm_words(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), int); d[:, 0] = range(len(r) + 1); d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[-1, -1] / max(1, len(r))

def syll_weight(w):
    return max(1, len(re.findall(r"[aeiouáéíóúâêôãõà]+", w.lower())))

def main(spec):
    lines = json.load(open(f"{ROOT}/scripts/vo-lines.json"))["lines"]
    name = spec.split(":")[1]
    out_dir = f"{ROOT}/voice/{name}"; os.makedirs(out_dir, exist_ok=True)
    timings, qa = {}, {}
    for lid, L in lines.items():
        if "same" in L: continue
        chunks, words, t = [], [], 0.0
        for part in L["parts"]:
            a = trim(synth(spec, part["t"], part.get("s", 1.0)))
            dur = len(a) / SR
            ws = part["t"].split(); wt = [syll_weight(w) for w in ws]; tot = sum(wt); acc = 0
            for w, k in zip(ws, wt):
                words.append({"w": w, "start": round(t + dur * acc / tot, 3), "end": round(t + dur * (acc + k) / tot, 3)}); acc += k
            chunks.append(a); t += dur
            gap = part.get("p", 0)
            if gap: chunks.append(np.zeros(int(gap * SR), np.float32)); t += gap
        y = np.concatenate(chunks); y = y / max(1e-6, np.abs(y).max()) * 0.89
        path = f"{out_dir}/{lid}.wav"; sf.write(path, y, SR, subtype="PCM_24")
        padded = np.concatenate([np.zeros(int(0.5 * SR), np.float32), y, np.zeros(int(0.8 * SR), np.float32)])
        sf.write(f"{out_dir}/.asr.wav", padded, SR); hyp = transcribe(f"{out_dir}/.asr.wav")
        timings[lid] = {"dur": round(len(y) / SR, 3), "words": words}
        qa[lid] = {"wer": round(wer(L["caption"], hyp), 3), "asr": hyp, "ref": L["caption"]}
        print(f"{lid:4s} {timings[lid]['dur']:5.2f}s WER={qa[lid]['wer']:.2f} | {hyp}", flush=True)
    json.dump(timings, open(f"{out_dir}/timings.json", "w"), ensure_ascii=False, indent=1)
    json.dump(qa, open(f"{out_dir}/qa.json", "w"), ensure_ascii=False, indent=1)
    print("WER médio:", round(float(np.mean([v["wer"] for v in qa.values()])), 3))

if __name__ == "__main__":
    main(sys.argv[1])
