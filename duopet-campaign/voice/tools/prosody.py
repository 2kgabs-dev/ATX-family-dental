"""Prosódia mais viva (v3.1), inspirada no ritmo e na entonação das referências do cliente.
Por PSOLA (Praat/parselmouth), que mantém o timbre (formantes):
- expande a variação de altura em volta da mediana do trecho (expand) e sobe a voz (shift_st semitons);
- acelera a fala (dur < 1) sem cortar consoantes. Acelerar no próprio Kokoro come a 1ª consoante
  ("Ração" virava "Ação", "Vacinas" virava "Pacinas").
Não clona nenhuma voz: só muda a melodia e o ritmo da mesma voz sintética."""
import numpy as np
import parselmouth
from parselmouth.praat import call


def liven(y, sr, expand=1.35, shift_st=1.5, dur=1.0, fmin=110, fmax=520, pad=0.12):
    P = int(pad * sr)
    yp = np.concatenate([np.zeros(P, np.float32), y.astype(np.float32), np.zeros(P, np.float32)])
    snd = parselmouth.Sound(yp.astype(np.float64), sampling_frequency=sr)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=fmin, pitch_ceiling=fmax)
    f = pitch.selected_array["frequency"]; f = f[f > 0]
    manip = call(snd, "To Manipulation", 0.01, fmin, fmax)
    if len(f) >= 10 and (expand != 1.0 or shift_st):
        med = float(np.median(f)); k = 2 ** (shift_st / 12)
        tier = call(manip, "Extract pitch tier")
        call(tier, "Formula", f"{med} * (self / {med}) ^ {expand} * {k}")
        call([tier, manip], "Replace pitch tier")
    if dur != 1.0:
        dt = call("Create DurationTier", "dur", 0, snd.duration)
        call(dt, "Add point", 0, dur)
        call([manip, dt], "Replace duration tier")
    a = call(manip, "Get resynthesis (overlap-add)").values[0].astype(np.float32)
    Q = int(round(P * dur))
    return a[Q:len(a) - Q]
