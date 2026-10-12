"""QA dos arquivos RENDERIZADOS (não do projeto): especificação, frames pretos, congelamentos, loudness/true peak,
inteligibilidade (ASR da mix final) e folhas de prévia em tamanho de celular.
Uso: python video_qa.py renders/master/duopet_master_45s_legendado.mp4 [...]
Saída: qa/report/<arquivo>.json + qa/report/<arquivo>_mobile.jpg
"""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, f"{ROOT}/voice/tools")
OUT = f"{ROOT}/qa/report"
os.makedirs(OUT, exist_ok=True)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(p):
    r = run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height,r_frame_rate,sample_rate,channels,bit_rate,pix_fmt:format=duration,bit_rate", "-of", "json", p])
    return json.loads(r.stdout)


def black(p):
    r = run(["ffmpeg", "-i", p, "-vf", "blackdetect=d=0.05:pix_th=0.06", "-an", "-f", "null", "-"])
    return re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r.stderr)


def freeze(p):
    r = run(["ffmpeg", "-i", p, "-vf", "freezedetect=n=0.0008:d=0.9", "-an", "-f", "null", "-"])
    starts = re.findall(r"freeze_start: ([\d.]+)", r.stderr)
    durs = re.findall(r"freeze_duration: ([\d.]+)", r.stderr)
    return list(zip(starts, durs))


def loud(p):
    r = run(["ffmpeg", "-i", p, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"])
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r.stderr)
    return {"integrated_lufs": float(i[-1]) if i else None, "true_peak_dbfs": float(tp[-1]) if tp else None}


def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").replace("duopet.site", "duopet ponto site")
    return re.sub(r"[^a-z0-9 ]", " ", t).split()


def wer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), int)
    d[:, 0] = range(len(r) + 1)
    d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[-1, -1] / max(1, len(r))


def asr_check(p, version):
    from asr import transcribe
    import soundfile as sf
    tl = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))["versions"][version]
    wav = f"{OUT}/_tmp.wav"
    run(["ffmpeg", "-y", "-v", "error", "-i", p, "-ac", "1", "-ar", "16000", wav])
    a, sr = sf.read(wav)
    res = []
    for s in tl["scenes"]:
        seg = a[int((s["voStart"] - 0.1) * sr): int((s["voEnd"] + 0.15) * sr)]
        seg = np.concatenate([np.zeros(sr // 2), seg, np.zeros(int(0.8 * sr))])
        sf.write(wav, seg, sr)
        hyp = transcribe(wav)
        res.append({"scene": s["type"], "ref": s["caption"], "asr": hyp, "wer": round(wer(s["caption"], hyp), 3)})
    os.remove(wav)
    return res


def mobile_sheet(p, name, every=1.5):
    """Frames reduzidos ao tamanho de uma tela de celular (360×640 px ≈ visualização real) para checar legibilidade."""
    from PIL import Image, ImageDraw
    tmp = f"{OUT}/_frames"
    os.makedirs(tmp, exist_ok=True)
    for f in os.listdir(tmp):
        os.remove(f"{tmp}/{f}")
    run(["ffmpeg", "-v", "error", "-i", p, "-vf", f"fps=1/{every},scale=360:640:flags=lanczos", f"{tmp}/f_%03d.png"])
    fs = sorted(os.listdir(tmp))
    cols = 8
    rows = (len(fs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 360, rows * 660), (30, 30, 30))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(fs):
        x, y = (i % cols) * 360, (i // cols) * 660
        sheet.paste(Image.open(f"{tmp}/{f}"), (x, y))
        d.text((x + 6, y + 643), f"{i * every:.1f}s", fill=(220, 220, 220))
    out = f"{OUT}/{name}_mobile.jpg"
    sheet.save(out, quality=82)
    for f in fs:
        os.remove(f"{tmp}/{f}")
    return out


if __name__ == "__main__":
    for p in sys.argv[1:]:
        name = os.path.basename(p).replace(".mp4", "")
        version = {"master": "master", "perf-h1": "perf_h1", "perf-h2": "perf_h2", "perf-h3": "perf_h3", "perf-h4": "perf_h4", "curto": "short15"}[
            next(k for k in ["master", "perf-h1", "perf-h2", "perf-h3", "perf-h4", "curto"] if k in name)]
        rep = {"file": os.path.relpath(p, ROOT), "probe": probe(p), "black_segments": black(p), "freezes": freeze(p), "loudness": loud(p)}
        rep["asr"] = asr_check(p, version)
        rep["asr_mean_wer"] = round(float(np.mean([x["wer"] for x in rep["asr"]])), 3)
        rep["mobile_sheet"] = os.path.relpath(mobile_sheet(p, name), ROOT)
        json.dump(rep, open(f"{OUT}/{name}.json", "w"), ensure_ascii=False, indent=1)
        v = [s for s in rep["probe"]["streams"] if s.get("width")][0]
        print(f"{name}: {v['width']}x{v['height']} {v['r_frame_rate']} {v['codec_name']} | dur {float(rep['probe']['format']['duration']):.2f}s | "
              f"pretos {len(rep['black_segments'])} | congelados {len(rep['freezes'])} | {rep['loudness']} | WER {rep['asr_mean_wer']}")
