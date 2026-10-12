"""Síntese de locução local (sem envio de dados a terceiros).
Motores: Kokoro-82M (Apache-2.0) via kokoro-onnx e Piper pt_BR (datasets CC0) via sherpa-onnx.
Uso: python tts.py <engine:voice> <speed> <out.wav> "<texto>"
"""
import sys, os, numpy as np, soundfile as sf
M = os.environ.get("TTS_MODELS", "/tmp/claude-0/-home-user-ATX-family-dental/d7d0bf5e-2b54-532d-842a-8feb644dcc75/scratchpad/models")
_cache = {}

def kokoro(voice, speed, text):
    from kokoro_onnx import Kokoro
    k = _cache.get("k") or Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
    _cache["k"] = k
    samples, sr = k.create(text, voice=voice, speed=speed, lang="pt-br")
    return samples, sr

def piper(voice, speed, text):
    import sherpa_onnx
    key = "p_" + voice
    if key not in _cache:
        d = f"{M}/vits-piper-pt_BR-{voice}-medium"
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{d}/pt_BR-{voice}-medium.onnx",
                tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data", length_scale=1.0/speed,
                noise_scale=0.667, noise_scale_w=0.8), num_threads=4))
        _cache[key] = sherpa_onnx.OfflineTts(cfg)
    a = _cache[key].generate(text, sid=0, speed=speed)
    return np.array(a.samples, dtype=np.float32), a.sample_rate

def synth(spec, speed, text):
    eng, voice = spec.split(":")
    return (kokoro if eng == "kokoro" else piper)(voice, speed, text)

if __name__ == "__main__":
    spec, speed, out, text = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
    s, sr = synth(spec, speed, text)
    sf.write(out, s, sr)
    print(out, sr, round(len(s)/sr, 2))
