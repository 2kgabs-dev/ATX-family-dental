"""Gera a locução de todas as falas de scripts/vo-lines.json para uma voz.

python build_vo.py kokoro:pf_dora                         -> voice/pf_dora/
python build_vo.py "kokoro:pf_dora*0.6+ef_dora*0.4" fem   -> voice/fem/   (mistura de vetores de estilo)
Saída: <ID>.wav + timings.json + qa.json. Variável SPEED_MUL multiplica a velocidade de todas as falas.
Pronúncia: correções no nível de fonema para "pet"/"DuoPet"/"site" (ver PRON_FIXES).
Tempos por palavra: alinhamento real com o ASR Parakeet TDT v3 (align.py); estimativa por sílabas só onde o ASR não casou.
Cada fala é verificada por dois ASR locais (Whisper small e Parakeet) e o WER fica em qa.json.
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
    (r"ɾə(?=[ptkbdgɡfvszʃʒmnlɾ])", "ɾ"),       # epêntese indevida: "sérətu" -> "sértu"
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
    if "*" in voice:  # mistura: "pf_dora*0.6+ef_dora*0.4"
        voice = sum(kokoro().get_voice_style(n) * float(w) for n, w in (x.split("*") for x in voice.split("+"))).astype(np.float32)
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

def split_merged(hyp):
    """O ASR junta "duopet ponto site" em "duopet.site": separa nas três palavras faladas."""
    out = []
    for w, t0, t1 in hyp:
        if re.sub(r"[^a-z]", "", w.lower()) == "duopetsite":
            d = t1 - t0; out += [("duopet", t0, t0 + .43 * d), ("ponto", t0 + .43 * d, t0 + .71 * d), ("site", t0 + .71 * d, t1)]
        else: out.append((w, t0, t1))
    return out

def word_times(script_words, y):
    from align import asr_words, align
    hyp, text = asr_words(y, SR); hyp = split_merged(hyp)
    pairs = align(script_words, hyp); dur = len(y) / SR
    T = [(hyp[pairs[i]][1], hyp[pairs[i]][2]) if i in pairs else None for i in range(len(script_words))]
    i = 0
    while i < len(T):  # interpola as não casadas pelo peso silábico entre as vizinhas
        if T[i] is not None: i += 1; continue
        j = i
        while j < len(T) and T[j] is None: j += 1
        a = T[i - 1][1] if i > 0 else 0.0; b = T[j][0] if j < len(T) else dur
        wt = [syll_weight(w) for w in script_words[i:j]]; tot = sum(wt); acc = 0
        for k in range(i, j):
            T[k] = (a + (b - a) * acc / tot, a + (b - a) * (acc + wt[k - i]) / tot); acc += wt[k - i]
        i = j
    return [{"w": w, "start": round(t0, 3), "end": round(max(t1, t0 + 0.06), 3), "asr": i in pairs}
            for i, (w, (t0, t1)) in enumerate(zip(script_words, T))], text

def main(spec, name=None):
    lines = json.load(open(f"{ROOT}/scripts/vo-lines.json"))["lines"]
    name = name or spec.split(":")[1]; mul = float(os.environ.get("SPEED_MUL", "1"))
    out_dir = f"{ROOT}/voice/{name}"; os.makedirs(out_dir, exist_ok=True)
    timings, qa = {}, {}
    for lid, L in lines.items():
        if "same" in L: continue
        chunks, script_words = [], []
        for part in L["parts"]:
            chunks.append(trim(synth(spec, part["t"], part.get("s", 1.0) * mul)))
            script_words += part["t"].split()
            gap = part.get("p", 0)
            if gap: chunks.append(np.zeros(int(gap * SR), np.float32))
        y = np.concatenate(chunks); y = y / max(1e-6, np.abs(y).max()) * 0.89
        path = f"{out_dir}/{lid}.wav"; sf.write(path, y, SR, subtype="PCM_24")
        words, ptext = word_times(script_words, y)
        padded = np.concatenate([np.zeros(int(0.5 * SR), np.float32), y, np.zeros(int(0.8 * SR), np.float32)])
        sf.write(f"{out_dir}/.asr.wav", padded, SR); hyp = transcribe(f"{out_dir}/.asr.wav"); os.remove(f"{out_dir}/.asr.wav")
        timings[lid] = {"dur": round(len(y) / SR, 3), "words": words}
        qa[lid] = {"wer": round(wer(L["caption"], hyp), 3), "wer_parakeet": round(wer(L["caption"], ptext), 3),
                   "asr": hyp, "asr_parakeet": ptext, "ref": L["caption"], "aligned": f"{sum(w['asr'] for w in words)}/{len(words)}"}
        print(f"{lid:4s} {timings[lid]['dur']:5.2f}s WER={qa[lid]['wer']:.2f}/{qa[lid]['wer_parakeet']:.2f} al={qa[lid]['aligned']} | {ptext}", flush=True)
    json.dump(timings, open(f"{out_dir}/timings.json", "w"), ensure_ascii=False, indent=1)
    json.dump(qa, open(f"{out_dir}/qa.json", "w"), ensure_ascii=False, indent=1)
    print("WER médio Whisper:", round(float(np.mean([v["wer"] for v in qa.values()])), 3),
          "| Parakeet:", round(float(np.mean([v["wer_parakeet"] for v in qa.values()])), 3))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
