"""Tempos reais por palavra para as legendas: ASR Parakeet TDT 0.6B v3 (NVIDIA, CC-BY-4.0, multilíngue com pt)
via sherpa-onnx, local. Os tokens do ASR são agrupados em palavras e alinhados (Levenshtein) às palavras
do roteiro; palavras não reconhecidas recebem tempo interpolado entre as vizinhas."""
import os, re, unicodedata, numpy as np, soundfile as sf
M = os.environ.get("TTS_MODELS", "/tmp/claude-0/-home-user-ATX-family-dental/d7d0bf5e-2b54-532d-842a-8feb644dcc75/scratchpad/models")
D = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
_rec = None

def rec():
    global _rec
    if _rec is None:
        import sherpa_onnx
        _rec = sherpa_onnx.OfflineRecognizer.from_transducer(
            encoder=f"{D}/encoder.int8.onnx", decoder=f"{D}/decoder.int8.onnx", joiner=f"{D}/joiner.int8.onnx",
            tokens=f"{D}/tokens.txt", model_type="nemo_transducer", num_threads=6)
    return _rec

def asr_words(y, sr, pad=0.4):
    """[(palavra, início, fim)] no tempo de y (sem o silêncio de borda)."""
    import scipy.signal as ss
    a = ss.resample_poly(y, 16000, sr).astype(np.float32) if sr != 16000 else y.astype(np.float32)
    a = np.concatenate([np.zeros(int(pad * 16000), np.float32), a, np.zeros(int(pad * 16000), np.float32)])
    s = rec().create_stream(); s.accept_waveform(16000, a); rec().decode_stream(s)
    r = s.result; toks, ts = list(r.tokens), list(r.timestamps)
    durs = list(getattr(r, "durations", []) or [])
    words = []
    for i, (tk, t0) in enumerate(zip(toks, ts)):
        t1 = t0 + (durs[i] if i < len(durs) and durs[i] > 0 else 0.08)
        if not re.search(r"\w", tk):
            continue  # pontuação
        if tk.startswith((" ", "▁")) or not words:
            words.append([tk.lstrip(" ▁"), t0, t1])
        else:
            words[-1][0] += tk; words[-1][2] = t1
    out = []
    for w, t0, t1 in words:
        w = w.strip()
        if not re.search(r"\w", w): continue
        out.append((w, max(0.0, t0 - pad), max(0.0, t1 - pad)))
    return out, r.text

def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

def align(script_words, hyp):
    """script_words: lista de str. hyp: [(w,t0,t1)]. Retorna [(w, t0, t1, casado?)]."""
    R = [norm(w) for w in script_words]; H = [norm(h[0]) for h in hyp]
    n, m = len(R), len(H)
    def cost(a, b):
        if a == b: return 0
        if a and b and (a.startswith(b) or b.startswith(a) or {a, b} == {"pra", "para"}): return 0.4
        return 1
    d = np.zeros((n + 1, m + 1)); d[:, 0] = np.arange(n + 1); d[0, :] = np.arange(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + cost(R[i - 1], H[j - 1]))
    i, j, pairs = n, m, {}
    while i > 0 and j > 0:
        if d[i, j] == d[i - 1, j - 1] + cost(R[i - 1], H[j - 1]):
            if cost(R[i - 1], H[j - 1]) < 1: pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif d[i, j] == d[i - 1, j] + 1: i -= 1
        else: j -= 1
    return pairs
