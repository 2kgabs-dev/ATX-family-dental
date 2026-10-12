"""QA objetivo de áudio: espectrograma da mix com marcações de cena, separação voz/música e ASR da mix final."""
import sys, os, json, numpy as np, soundfile as sf, pyloudnorm as pyln
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, f"{ROOT}/voice/tools")
name = sys.argv[1]
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))["versions"][name]
mix, sr = sf.read(f"{ROOT}/renders/audio/{name}.wav")
mus, _ = sf.read(f"{ROOT}/music/{name}_music.wav")
fig, ax = plt.subplots(3, 1, figsize=(16, 9), sharex=True)
m = mix.mean(1)
ax[0].specgram(m, NFFT=2048, Fs=sr, noverlap=1024, cmap="magma", vmin=-120); ax[0].set_ylim(0, 8000); ax[0].set_title(f"{name} — mix final")
ax[1].specgram(mus.mean(1), NFFT=2048, Fs=sr, noverlap=1024, cmap="viridis", vmin=-120); ax[1].set_ylim(0, 5000); ax[1].set_title("trilha (sem ducking)")
# loudness de curto prazo (400 ms)
meter = pyln.Meter(sr)
hop = int(0.1 * sr); win = int(0.4 * sr)
ts, lv = [], []
for i in range(0, len(mix) - win, hop):
    seg = mix[i:i + win]
    rms = np.sqrt((seg ** 2).mean()) + 1e-9
    ts.append(i / sr); lv.append(20 * np.log10(rms))
ax[2].plot(ts, lv, lw=1); ax[2].set_ylim(-60, 0); ax[2].set_title("nível RMS (dBFS, janela 400 ms)")
for s in TL["scenes"]:
    for a in ax:
        a.axvline(s["start"], color="w" if a is not ax[2] else "k", lw=0.8, alpha=0.7)
    ax[2].text(s["start"] + 0.1, -5, s["type"], fontsize=8)
for e in TL["sfx"]:
    ax[2].plot([e["t"]], [-55], "r|")
plt.tight_layout()
out = f"{ROOT}/qa/audio_{name}.png"; plt.savefig(out, dpi=70); print(out)
# separação voz x música durante a fala
voice, _ = sf.read(f"{ROOT}/voice/mix/{name}_voice.wav")
