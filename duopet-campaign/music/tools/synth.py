"""Biblioteca mínima de síntese (numpy/scipy) para trilha e efeitos originais do DuoPet.
Tudo é gerado do zero: não há samples de terceiros, portanto não há questão de licença.
"""
import numpy as np
import scipy.signal as ss

SR = 48000
RNG = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env_adsr(n, a=0.005, d=0.1, s=0.6, r=0.2, sus_len=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    if sus_len is None:
        sus_n = max(0, n - a_n - d_n - r_n)
    else:
        sus_n = int(sus_len * SR)
    e = np.concatenate([np.linspace(0, 1, max(1, a_n)), np.linspace(1, s, max(1, d_n)), np.full(sus_n, s), np.linspace(s, 0, max(1, r_n))])
    if len(e) < n:
        e = np.concatenate([e, np.zeros(n - len(e))])
    return e[:n]


def exp_env(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, fc, order=2):
    b, a = ss.butter(order, min(0.99, fc / (SR / 2)), "low")
    return ss.lfilter(b, a, x, axis=0)


def hp(x, fc, order=2):
    b, a = ss.butter(order, max(1e-4, fc / (SR / 2)), "high")
    return ss.lfilter(b, a, x, axis=0)


def bp(x, lo, hi, order=2):
    b, a = ss.butter(order, [max(1e-4, lo / (SR / 2)), min(0.99, hi / (SR / 2))], "band")
    return ss.lfilter(b, a, x, axis=0)


def sweep_filter(x, f0, f1, kind="low", q=0.7, block=256):
    """Filtro com frequência de corte variável (state-variable, processado por blocos)."""
    out = np.zeros_like(x)
    n = len(x)
    lowst, bandst = 0.0, 0.0
    fcs = np.geomspace(max(20, f0), max(20, f1), n)
    damp = 1.0 / q
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fcs[i], SR / 6) / SR)
        low = lowst + f * bandst
        high = x[i] - low - damp * bandst
        band = f * high + bandst
        lowst, bandst = low, band
        out[i] = low if kind == "low" else (band if kind == "band" else high)
    return out


def saw(freq, dur, detune=0.0):
    t = t_axis(dur)
    ph = (freq * (1 + detune)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def sine(freq, dur, phase=0.0):
    return np.sin(2 * np.pi * freq * t_axis(dur) + phase)


def noise(dur):
    return RNG.standard_normal(int(dur * SR))


def pan(mono, p):
    """p em [-1, 1] (equal power)."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def place(buf, clip, t, gain=1.0):
    i = int(round(t * SR))
    if clip.ndim == 1:
        clip = np.stack([clip, clip], 1)
    if i >= len(buf):
        return
    if i < 0:
        clip = clip[-i:]
        i = 0
    n = min(len(clip), len(buf) - i)
    buf[i:i + n] += clip[:n] * gain


def make_ir(dur=2.2, decay=0.55, bright=6000, seed=3):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    e = np.exp(-np.arange(n) / (decay * SR))
    ir = np.stack([lp(r.standard_normal(n), bright) * e, lp(r.standard_normal(n), bright) * e], 1)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0)).max()


IR_HALL = None


def reverb(x, mix=0.25, ir=None):
    global IR_HALL
    if ir is None:
        if IR_HALL is None:
            IR_HALL = make_ir()
        ir = IR_HALL
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    wet = np.stack([ss.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - mix) + wet * mix


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


def normalize(x, peak=0.9):
    m = np.abs(x).max()
    return x if m == 0 else x / m * peak


# ---------------- instrumentos ----------------

def kick(dur=0.45, f0=130, f1=44, punch=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * exp_env(n, 0.16)
    click = hp(noise(dur), 2500) * exp_env(n, 0.004) * 0.35 * punch
    return soft_clip(body + click, 1.4)


def clap(dur=0.35):
    n = int(dur * SR)
    x = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        m = n - i
        x[i:] += bp(noise(m / SR), 900, 4200) * exp_env(m, 0.012 if k < 2 else 0.11)
    return x * 0.9


def hat(dur=0.06, open_=False):
    n = int((0.22 if open_ else dur) * SR)
    x = hp(noise(n / SR), 7500, 3) * exp_env(n, 0.06 if open_ else 0.014)
    return x * 0.6


def shaker(dur=0.09):
    n = int(dur * SR)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return bp(noise(dur), 4500, 11000) * e * 0.35


def marimba(midi, dur=0.6, bright=1.0):
    f = note_hz(midi)
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.32) + 0.35 * bright * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05) + 0.12 * bright * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02)
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return x * 0.6


def bell(midi, dur=2.0):
    f = note_hz(midi)
    n = int(dur * SR)
    t = np.arange(n) / SR
    partials = [(1, 1.0, 1.4), (2.76, 0.42, 0.6), (5.4, 0.22, 0.3), (8.93, 0.1, 0.15), (2.0, 0.25, 1.0)]
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in partials)
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return x * 0.35


def pluck(midi, dur=0.5, cutoff=3500):
    """Karplus-Strong."""
    f = note_hz(midi)
    n = int(dur * SR)
    period = max(2, int(SR / f))
    buf = RNG.uniform(-1, 1, period)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.5 * (buf[i % period] + buf[(i + 1) % period]) * 0.996
    return lp(out, cutoff) * 0.7


def pad(midis, dur, cutoff=1800, attack=0.6, release=0.8, detune=0.006, bright_end=None):
    x = np.zeros(int(dur * SR))
    for m in midis:
        f = note_hz(m)
        for d in (-detune, 0, detune):
            x += saw(f, dur, d) * 0.18
    if bright_end:
        x = sweep_filter(x, cutoff, bright_end, "low", q=0.9)
    else:
        x = lp(x, cutoff, 2)
    e = env_adsr(len(x), a=attack, d=0.3, s=0.85, r=release)
    return x * e / max(1, len(midis)) * 1.4


def piano(midi, dur=1.6, vel=0.8):
    f = note_hz(midi)
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(1, 8):
        inh = 1 + 0.0004 * k * k
        x += (vel ** (k * 0.4)) / k * np.sin(2 * np.pi * f * k * inh * t) * np.exp(-t / (1.3 / k ** 0.6))
    x[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    hammer = lp(noise(dur), 3000) * exp_env(n, 0.006) * 0.08
    return (x + hammer) * 0.25


def sub(midi, dur, glide=None):
    f = note_hz(midi)
    x = sine(f, dur) + 0.25 * sine(2 * f, dur)
    e = env_adsr(len(x), a=0.008, d=0.08, s=0.8, r=0.06)
    return soft_clip(x * e, 1.3) * 0.55


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    nz = sweep_filter(noise(dur) * 0.5, 300, 9000, "band", q=1.4)
    f = 200 * (2 ** (3 * t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    e = (t / dur) ** 2.2
    return (nz + tone) * e


def impact(dur=2.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 34 + 50 * np.exp(-t / 0.12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    nz = lp(noise(dur), 1800) * np.exp(-t / 0.09) * 0.5
    return soft_clip(boom + nz, 1.5) * 0.9
