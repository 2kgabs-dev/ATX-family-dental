"""Storyboard a partir dos renders finais: 2 quadros por cena (entrada e meio da fala), com legenda de cena e timecode."""
import json, math, os, subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))
_s = lambda v: math.ceil(TL["versions"][v]["duration"])  # mesmos nomes de compositions/queue.sh
FILES = {"master": f"master/duopet_master_{_s('master')}s_sem-legenda.mp4", "perf_h1": f"performance/duopet_perf-h1-dor_{_s('perf_h1')}s_sem-legenda.mp4",
         "perf_h2": f"performance/duopet_perf-h2-demo_{_s('perf_h2')}s_sem-legenda.mp4", "perf_h3": f"performance/duopet_perf-h3-multipet_{_s('perf_h3')}s_sem-legenda.mp4",
         "perf_h4": f"performance/duopet_perf-h4-remedio_{_s('perf_h4')}s_sem-legenda.mp4", "short15": f"curto/duopet_curto_{_s('short15')}s_sem-legenda.mp4"}
try:
    FONT = ImageFont.truetype(f"{ROOT}/compositions/node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf", 22)
    FONT_S = ImageFont.truetype(f"{ROOT}/compositions/node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf", 17)
except Exception:
    FONT = FONT_S = ImageFont.load_default()

W, H = 300, 533
for name, rel in FILES.items():
    src = f"{ROOT}/renders/{rel}"
    if not os.path.exists(src):
        print("faltando", rel)
        continue
    v = TL["versions"][name]
    shots = []
    for s in v["scenes"]:
        if s.get("cues", {}).get("shots"):  # montagem: 1 quadro por plano (60% do plano)
            sh = s["cues"]["shots"]
            ends = [x["t0"] for x in sh[1:]] + [s["end"]]
            for x, e in zip(sh, ends):
                shots.append(({**s, "type": f"{s['type']} · {x['key']}"}, max(0.05, x["t0"] + (e - x["t0"]) * 0.6)))
            continue
        for t in (s["start"] + min(0.35, (s["end"] - s["start"]) * 0.15), (s["voStart"] + s["voEnd"]) / 2):
            shots.append((s, t))
    cols = min(len(shots), 7)
    rows = (len(shots) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * W, rows * (H + 70)), (244, 242, 238))
    d = ImageDraw.Draw(sheet)
    tmp = f"{ROOT}/storyboard/_f.png"
    for i, (s, t) in enumerate(shots):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={W}:{H}", tmp])
        x, y = (i % cols) * W, (i // cols) * (H + 70)
        sheet.paste(Image.open(tmp), (x, y))
        d.text((x + 8, y + H + 8), f"{s['type']}", fill=(32, 59, 45), font=FONT)
        d.text((x + 8, y + H + 38), f"{int(t // 60):02d}:{t % 60:05.2f}", fill=(90, 95, 89), font=FONT_S)
    os.remove(tmp)
    sheet.save(f"{ROOT}/storyboard/{name}.jpg", quality=86)
    print("ok", name)
