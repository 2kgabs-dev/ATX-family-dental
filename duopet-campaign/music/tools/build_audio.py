"""Trilha original + efeitos + mixagem final para cada versão da campanha.

Lê compositions/src/data/timeline.json (fonte única de sincronia) e gera, por versão:
  music/<versão>_music.wav   sfx/<versão>_sfx.wav   voice/mix/<versão>_voice.wav   renders/audio/<versão>.wav (mix final)
Mix final: locução em primeiro plano, trilha com ducking (sidechain pela voz), -14 LUFS integrado, pico <= -1 dBFS.
Uso: python build_audio.py [versao ...]
"""
import json, os, sys
import numpy as np, soundfile as sf, scipy.signal as ss, pyloudnorm as pyln
sys.path.insert(0, os.path.dirname(__file__))
from synth import *  # noqa

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))
BEAT = 0.5  # 120 BPM
BAR = 2.0

# Progressões (MIDI)
A_MIN = [45, 52, 57, 60, 64]  # Am(add) grave
F_LYD = [41, 48, 57, 60, 64]  # Fmaj7 sem 3ª grave
C_MAJ9 = [36, 43, 52, 55, 59, 62]
GROOVE = [  # (raiz baixo, acorde pad, arpejo)
    (36, [48, 52, 55, 59], [60, 64, 67, 71, 72, 71, 67, 64]),  # Cmaj7
    (43, [47, 50, 55, 59], [59, 62, 67, 71, 74, 71, 67, 62]),  # G
    (45, [48, 52, 57, 60], [57, 60, 64, 69, 72, 69, 64, 60]),  # Am7
    (41, [45, 48, 53, 57], [57, 60, 65, 69, 72, 69, 65, 60]),  # Fmaj7
]


def bars(a, b):
    """Inícios de compasso (grid absoluto de 2 s) dentro de [a, b)."""
    first = np.ceil(a / BAR - 1e-6) * BAR
    return [x for x in np.arange(first, b - 1e-6, BAR)]


def beats(a, b, step=BEAT, offset=0.0):
    first = np.ceil((a - offset) / step - 1e-6) * step + offset
    return [x for x in np.arange(first, b - 1e-6, step)]


def compose(v):
    dur = v["duration"] + 0.6
    N = int(dur * SR)
    dry = np.zeros((N, 2))
    wet = np.zeros((N, 2))  # vai para o reverb
    drums = np.zeros((N, 2))
    bass = np.zeros((N, 2))
    scenes = v["scenes"]
    cta = next((s for s in scenes if s["type"].startswith("CTA")), None)
    secs = v["music"]
    K = kick()
    CL = clap()
    for si, sec in enumerate(secs):
        a, b, mood = sec["start"], sec["end"], sec["mood"]
        nxt = secs[si + 1]["mood"] if si + 1 < len(secs) else None
        if mood == "tension":
            span = b - a
            # pad escuro
            p = pad(A_MIN, span + 0.6, cutoff=700, attack=0.4, release=0.6, bright_end=1500)
            place(wet, pan(p, 0) * 0.55, a)
            # pulso de baixo em colcheias, crescendo
            for x in beats(a, b - 0.5, 0.25):
                k = (x - a) / span
                place(bass, lp(saw(note_hz(33), 0.2), 300 + 900 * k) * env_adsr(int(0.2 * SR), 0.004, 0.05, 0.3, 0.1) * (0.25 + 0.35 * k), x)
            # "relógio" (tic-tac) alternando lados
            for i, x in enumerate(beats(a, b - 0.5, 0.25)):
                k = (x - a) / span
                tick_ = bp(noise(0.03), 2500, 6000) * exp_env(int(0.03 * SR), 0.006)
                place(drums, pan(tick_, -0.5 if i % 2 else 0.5) * (0.35 + 0.3 * k), x)
            # batida de coração: kick no 1 e no "e" do 1
            for x in bars(a, b - 0.5):
                place(drums, K * 0.8, x)
                place(drums, K * 0.45, x + 0.25)
            # segunda metade: hats em semicolcheia
            for x in beats(a + span * 0.5, b - 0.5, 0.125):
                place(drums, hat() * 0.25, x)
        elif mood == "reveal":
            place(wet, pan(pad(C_MAJ9, b - a + 1.2, cutoff=900, attack=0.05, release=1.2, bright_end=5000), 0) * 0.75, a)
            place(bass, sub(24, min(3.0, b - a)) * 0.9, a)
            arp = [60, 64, 67, 71, 74, 76, 79, 83]
            for i, m in enumerate(arp):
                place(wet, pan(bell(m + 12, 1.6), -0.6 + 1.2 * i / len(arp)) * 0.35, a + 0.12 + i * 0.125)
            # condução leve para o groove
            for x in beats(a + 2.0, b, 0.25):
                place(drums, hat() * 0.22, x)
            for x in beats(b - 1.0, b, 0.5):
                place(drums, K * 0.5, x)
        elif mood == "groove":
            for bi, x in enumerate(bars(a, b)):
                root, chord, arp = GROOVE[bi % 4]
                L = min(BAR, b - x)
                place(wet, pan(pad(chord, L + 0.3, cutoff=2200, attack=0.08, release=0.3), 0) * 0.32, x)
                # baixo: raiz no 1, oitava no "e" do 2, raiz no 3, quinta no "e" do 4
                for off, m, ln in [(0, root, 0.4), (0.75, root + 12, 0.2), (1.0, root, 0.4), (1.75, root + 7, 0.2)]:
                    if off < L:
                        place(bass, sub(m, ln) * 0.85, x + off)
                # marimba em colcheias
                for i, m in enumerate(arp):
                    if i * 0.25 < L:
                        place(dry, pan(marimba(m, 0.5), -0.35 if i % 2 else 0.35) * 0.30, x + i * 0.25)
                # bateria
                for off in (0.0, 1.0):
                    if off < L:
                        place(drums, K * 0.95, x + off)
                for off in (0.5, 1.5):
                    if off < L:
                        place(drums, pan(CL, 0.05) * 0.55, x + off)
                for k8 in range(8):
                    off = k8 * 0.25
                    if off < L:
                        place(drums, pan(hat(open_=(k8 % 2 == 1)), 0.25) * (0.28 if k8 % 2 else 0.18), x + off)
                for k16 in range(16):
                    off = k16 * 0.125
                    if off < L:
                        place(drums, pan(shaker(), -0.3) * (0.22 if k16 % 2 else 0.12), x + off)
            if nxt in ("warm", "sting"):
                place(drums, pan(riser(1.0), 0) * 0.25, b - 1.0)
        elif mood == "warm":
            chords = [[41, 53, 57, 60, 64], [43, 55, 59, 62, 65]]  # Fmaj7 → G7sus-ish
            half = (b - a) / 2
            for i, ch in enumerate(chords):
                x = a + i * half
                place(wet, pan(pad(ch, half + 0.8, cutoff=1400, attack=0.3, release=0.8), 0) * 0.45, x)
                for j, m in enumerate(ch[1:]):
                    place(wet, pan(piano(m + 12, 2.2, 0.6), -0.4 + 0.25 * j) * 0.45, x + j * 0.19)
                place(bass, sub(ch[0] - 12, half) * 0.6, x)
            for x in beats(a, b, 0.25):
                place(drums, pan(shaker(), 0.3) * 0.08, x)
        elif mood == "sting":
            logo = cta["cues"]["logo"] if cta else a + 0.2
            url = cta["cues"]["url"] if cta else b - 2
            # motivo da marca: Sol–Dó–Mi
            for i, m in enumerate([79, 84, 88]):
                place(wet, pan(bell(m, 2.6), -0.3 + 0.3 * i) * 0.55, logo + i * 0.22)
                place(dry, pan(marimba(m - 12, 0.8), 0) * 0.25, logo + i * 0.22)
            place(wet, pan(pad([48, 55, 60, 64, 67, 71], b - logo + 0.5, cutoff=1600, attack=0.5, release=1.0, bright_end=3500), 0) * 0.45, logo)
            place(bass, sub(36, 1.2) * 0.7, logo)
            # groove leve até perto da URL
            for x in bars(logo + 0.6, url - 0.4):
                for off in (0.0, 1.0):
                    if x + off < url - 0.4:
                        place(drums, K * 0.6, x + off)
                for k8 in range(8):
                    if x + k8 * 0.25 < url - 0.4:
                        place(drums, hat() * 0.15, x + k8 * 0.25)
            # acorde final ("botão") sincronizado com a URL, cauda até o fim
            place(drums, K * 0.9, url)
            for m in [60, 64, 67, 72, 76]:
                place(wet, pan(piano(m, b - url + 0.6, 0.85), 0) * 0.35, url)
                place(wet, pan(bell(m + 12, b - url + 0.6), 0) * 0.18, url + 0.03)
            place(bass, sub(24, b - url) * 0.7, url)
    # sidechain do kick em pad/marimba/baixo nas seções de groove (bombeamento, como na referência do cliente)
    pump = np.ones(N)
    for sec in secs:
        if sec["mood"] in ("groove", "sting"):
            for x in bars(sec["start"], sec["end"]):
                for off in (0.0, 1.0):
                    i = int((x + off) * SR)
                    if i < N:
                        L = min(int(0.45 * SR), N - i)
                        env = 1 - 0.45 * np.exp(-np.arange(L) / (0.09 * SR))
                        pump[i:i + L] = np.minimum(pump[i:i + L], env)
    wet_r = reverb(wet, mix=0.38) * pump[:, None]
    mix = dry * pump[:, None] + wet_r + bass * 0.9 * pump[:, None] ** 0.5 + reverb(drums, mix=0.08)
    mix = hp(mix, 30)
    # fade final sincronizado com o último frame
    end = int(v["duration"] * SR)
    fade = int(0.35 * SR)
    mix[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    mix[end:] = 0
    return mix[:end]


# ---------------- efeitos ----------------

def sfx_clip(name, dur=None):
    n = lambda d: int(d * SR)
    if name == "whoosh_soft":
        d = dur or 0.55
        x = sweep_filter(noise(d), 400, 2600, "band", q=1.2)
        x *= np.sin(np.linspace(0, np.pi, n(d))) ** 1.5
        return x * 0.5
    if name == "swoosh_3d":
        d = 0.5
        x = sweep_filter(noise(d), 600, 3500, "band", q=1.5) * np.sin(np.linspace(0, np.pi, n(d))) ** 2
        pnv = np.linspace(-0.8, 0.8, n(d))
        a = (pnv + 1) * np.pi / 4
        return np.stack([x * np.cos(a), x * np.sin(a)], 1) * 0.6
    if name == "tick":
        d = 0.04
        return (np.sin(2 * np.pi * 2900 * t_axis(d)) * exp_env(n(d), 0.006) + hp(noise(d), 5000) * exp_env(n(d), 0.002) * 0.3) * 0.5
    if name in ("pop", "pop_big"):
        d = 0.12 if name == "pop" else 0.25
        tt = t_axis(d)
        f = (300 if name == "pop" else 140) + (700 if name == "pop" else 500) * np.exp(-tt / 0.02)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(n(d), 0.03 if name == "pop" else 0.07)
        if name == "pop_big":
            x += lp(noise(d), 1500) * exp_env(n(d), 0.02) * 0.4
        return x * 0.7
    if name == "boing":
        d = 0.35
        tt = t_axis(d)
        f = 330 + 160 * np.sin(2 * np.pi * 9 * tt) * np.exp(-tt / 0.12)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(n(d), 0.1) * 0.35
    if name == "card_slap":
        d = 0.18
        x = lp(noise(d), 2800) * exp_env(n(d), 0.018) + np.sin(2 * np.pi * 120 * t_axis(d)) * exp_env(n(d), 0.04) * 0.8
        return x * 0.7
    if name == "paper":
        d = 0.22
        g = (RNG.random(n(d)) > 0.992).astype(float)
        g = np.convolve(g, np.hanning(160), "same") * exp_env(n(d), 0.08)
        return bp(noise(d), 2000, 6000) * g * 0.6
    if name == "riser":
        return riser(dur or 1.6) * 0.8
    if name == "suck":
        d = 0.45
        x = sweep_filter(noise(d), 4000, 300, "band", q=1.4) * np.linspace(0, 1, n(d)) ** 2.5
        return x * 0.8
    if name == "impact":
        return reverb(impact(2.0), mix=0.35)
    if name in ("shimmer", "logo_sting"):
        d = 1.6
        x = np.zeros(n(d))
        for i, m in enumerate([84, 88, 91, 95, 96, 100]):
            c = bell(m, d - i * 0.07)
            x[int(i * 0.07 * SR):int(i * 0.07 * SR) + len(c)] += c[: n(d) - int(i * 0.07 * SR)] * 0.5
        return reverb(x, mix=0.5) * 0.6
    if name == "click_soft":
        d = 0.06
        return (np.sin(2 * np.pi * 1800 * t_axis(d)) * exp_env(n(d), 0.008) + hp(noise(d), 3000) * exp_env(n(d), 0.0015) * 0.4) * 0.5
    if name == "tap":
        d = 0.08
        return (np.sin(2 * np.pi * 230 * t_axis(d)) * exp_env(n(d), 0.012) + hp(noise(d), 2000) * exp_env(n(d), 0.002) * 0.5) * 0.7
    if name == "check":
        d = 0.5
        x = marimba(88, d, 0.6)
        y = marimba(95, d - 0.07, 0.6)
        x[int(0.07 * SR):] += y[: len(x) - int(0.07 * SR)]
        return reverb(x, mix=0.25) * 0.7
    if name == "ring":
        d = 0.45
        tt = t_axis(d)
        f = 600 + 380 * (tt / d)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n(d))) * 0.18
    if name == "toast":
        d = 0.4
        x = sweep_filter(noise(d), 1200, 3000, "band", q=1.2) * np.sin(np.linspace(0, np.pi, n(d))) * 0.3
        c = marimba(81, d, 0.4) * 0.4
        return x + c
    if name == "coin":
        d = 0.45
        x = bell(96, d) + 0.6 * np.concatenate([np.zeros(int(0.08 * SR)), bell(100, d - 0.08)])
        return x * 0.4
    if name == "squeak":
        d = 0.22
        tt = t_axis(d)
        f = 1400 + 900 * np.sin(np.pi * tt / d) + 60 * np.sin(2 * np.pi * 30 * tt)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n(d))) * 0.3
    if name == "shuffle":
        d = 0.5
        x = np.zeros(n(d))
        for i in range(7):
            c = bp(noise(0.05), 1500, 6000) * exp_env(n(0.05), 0.01)
            k = int(i * 0.06 * SR)
            x[k:k + len(c)] += c
        return x * 0.6
    if name == "flip":
        d = 0.3
        x = sweep_filter(noise(d), 800, 4000, "band", q=1.3) * np.sin(np.linspace(0, np.pi, n(d))) ** 2 * 0.5
        x[n(0.22):n(0.22) + n(0.02)] += hp(noise(0.02), 2000) * 0.5
        return x
    if name == "draw":
        d = dur or 0.5
        tt = t_axis(d)
        x = sweep_filter(noise(d), 2500, 7000, "band", q=2.0) * np.sin(np.linspace(0, np.pi, n(d))) * 0.35
        x += np.sin(2 * np.pi * np.cumsum(500 + 700 * tt / d) / SR) * np.sin(np.linspace(0, np.pi, n(d))) * 0.08
        return x
    if name == "typing":
        d = 0.42
        x = np.zeros(n(d))
        for k in range(6):
            c = hp(noise(0.012), 2500) * exp_env(n(0.012), 0.002)
            i = int(k * 0.07 * SR)
            x[i:i + len(c)] += c * (0.8 + 0.2 * RNG.random())
        return x * 0.6
    if name == "air":
        d = dur or 2.5
        return lp(noise(d), 1200) * np.sin(np.linspace(0, np.pi, n(d))) ** 2 * 0.2
    raise ValueError(name)


def build_sfx(v):
    N = int((v["duration"] + 0.6) * SR)
    buf = np.zeros((N, 2))
    for e in v["sfx"]:
        c = sfx_clip(e["n"], e.get("dur"))
        place(buf, c, e["t"], e["g"])
    return reverb(buf, mix=0.07)[: int(v["duration"] * SR)]


# ---------------- voz ----------------

def compressor(x, thr_db=-20, ratio=3.0, attack=0.005, release=0.12):
    env = np.abs(x)
    a_c, r_c = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    out = np.zeros_like(env)
    lvl = 0.0
    for i in range(0, len(env), 32):  # bloco de 32 amostras
        v_ = env[i:i + 32].max()
        lvl = a_c * lvl + (1 - a_c) * v_ if v_ > lvl else r_c * lvl + (1 - r_c) * v_
        out[i:i + 32] = lvl
    db = 20 * np.log10(np.maximum(out, 1e-6))
    gr = np.where(db > thr_db, (thr_db - db) * (1 - 1 / ratio), 0)
    return x * 10 ** (gr / 20)


def peaking(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A]
    return ss.lfilter(b, a, x)


def build_voice(v):
    N = int(v["duration"] * SR)
    buf = np.zeros(N)
    for item in v["vo"]:
        a, sr = sf.read(f"{ROOT}/{item['file']}", dtype="float64")
        a = ss.resample_poly(a, SR, sr)
        a = hp(a, 85)
        a = peaking(a, 180, -1.5, 0.8)  # menos "embolado"
        a = peaking(a, 3200, 2.5, 0.9)  # presença
        a = compressor(a, -22, 2.6)
        i = int(item["start"] * SR)
        n = min(len(a), N - i)
        buf[i:i + n] += a[:n]
    return np.stack([buf, buf], 1)


def duck_env(voice, depth_db=-8.5, attack=0.03, release=0.35):
    e = np.abs(voice[:, 0])
    e = ss.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], e)
    on = (e > 0.02).astype(float)
    # suaviza ataque/release
    out = np.zeros_like(on)
    lvl = 0.0
    a_c, r_c = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    for i in range(0, len(on), 64):
        tgt = on[i:i + 64].max()
        lvl = a_c * lvl + (1 - a_c) * tgt if tgt > lvl else r_c * lvl + (1 - r_c) * tgt
        out[i:i + 64] = lvl
    return 10 ** (depth_db * out / 20)


def limiter(x, ceiling_db=-1.0, lookahead=0.005, release=0.08):
    ceil = 10 ** (ceiling_db / 20)
    peak = np.abs(x).max(1)
    la = int(lookahead * SR)
    pk = ss.maximum_filter1d(peak, size=2 * la + 1) if hasattr(ss, "maximum_filter1d") else None
    if pk is None:
        from scipy.ndimage import maximum_filter1d
        pk = maximum_filter1d(peak, size=2 * la + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    r_c = np.exp(-1 / (release * SR))
    gs = np.copy(g)
    for i in range(1, len(gs)):
        gs[i] = g[i] if g[i] < gs[i - 1] else r_c * gs[i - 1] + (1 - r_c) * g[i]
    return x * gs[:, None]


def build(name):
    v = TL["versions"][name]
    os.makedirs(f"{ROOT}/renders/audio", exist_ok=True)
    os.makedirs(f"{ROOT}/voice/mix", exist_ok=True)
    music = compose(v)
    sfx = build_sfx(v)
    voice = build_voice(v)
    N = int(v["duration"] * SR)
    music, sfx, voice = music[:N], sfx[:N], voice[:N]
    meter = pyln.Meter(SR)
    # níveis relativos por loudness
    def set_lufs(x, target):
        l = meter.integrated_loudness(x)
        return x * 10 ** ((target - l) / 20), l
    voice_n, _ = set_lufs(voice, -16.0)
    music_n, _ = set_lufs(music, -25.0)
    sfx_n, _ = set_lufs(sfx, -28.5)
    music_d = music_n * duck_env(voice_n)[:, None]
    mix = voice_n + music_d + sfx_n
    target = -14.0
    pre, _ = set_lufs(mix, target)
    for _ in range(4):  # compensa a perda de loudness do limitador
        lim = limiter(pre, -1.6)
        l = meter.integrated_loudness(lim)
        if abs(l - target) < 0.15:
            break
        pre = pre * 10 ** ((target - l) / 20)
    mix = lim
    final_l = meter.integrated_loudness(mix)
    peak = 20 * np.log10(np.abs(mix).max())
    sf.write(f"{ROOT}/music/{name}_music.wav", normalize(music, 0.8), SR, subtype="PCM_24")
    sf.write(f"{ROOT}/sfx/{name}_sfx.wav", normalize(sfx, 0.8), SR, subtype="PCM_24")
    sf.write(f"{ROOT}/voice/mix/{name}_voice.wav", normalize(voice_n, 0.9), SR, subtype="PCM_24")
    sf.write(f"{ROOT}/renders/audio/{name}.wav", mix, SR, subtype="PCM_24")
    print(f"{name}: {v['duration']:.2f}s  LUFS={final_l:.1f}  pico={peak:.1f} dBFS")
    return final_l, peak


if __name__ == "__main__":
    names = sys.argv[1:] or list(TL["versions"].keys())
    for nm in names:
        build(nm)
