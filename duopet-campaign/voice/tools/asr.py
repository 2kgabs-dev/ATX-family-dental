"""Transcrição local (Whisper small via sherpa-onnx) para QA de inteligibilidade da locução."""
import sys, os, numpy as np, soundfile as sf, sherpa_onnx, scipy.signal as ss
M = os.environ.get("TTS_MODELS", "/tmp/claude-0/-home-user-ATX-family-dental/d7d0bf5e-2b54-532d-842a-8feb644dcc75/scratchpad/models")
_r = None
def recognizer():
    global _r
    if _r is None:
        d = f"{M}/sherpa-onnx-whisper-small"
        _r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx",
            decoder=f"{d}/small-decoder.int8.onnx", tokens=f"{d}/small-tokens.txt", language="pt", task="transcribe", num_threads=4)
    return _r
def transcribe(path):
    a, sr = sf.read(path, dtype="float32")
    if a.ndim > 1: a = a.mean(1)
    if sr != 16000:
        a = ss.resample_poly(a, 16000, sr).astype(np.float32); sr = 16000
    r = recognizer(); s = r.create_stream(); s.accept_waveform(sr, a); r.decode_stream(s)
    return s.result.text.strip()
if __name__ == "__main__":
    for p in sys.argv[1:]: print(p, "=>", transcribe(p))
