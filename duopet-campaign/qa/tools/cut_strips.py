"""QA de transições: para cada corte entre cenas, extrai quadros em volta do corte (−8, −4, −2, 0, +2, +4, +8 quadros)
do MP4 renderizado e monta uma tira por corte. Saída: qa/report/cuts/<versão>_<n>_<A>-<B>.jpg

python3 qa/tools/cut_strips.py <versão> <arquivo.mp4>
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))
OFFS = [-8, -4, -2, 0, 2, 4, 8]


def frame_at(mp4, f, fps):
    out = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(0, f) / fps:.4f}", "-i", mp4, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                         capture_output=True, check=True).stdout
    from io import BytesIO
    return Image.open(BytesIO(out)).convert("RGB")


def main(version, mp4):
    v = TL["versions"][version]; fps = TL["fps"]
    od = f"{ROOT}/qa/report/cuts"; os.makedirs(od, exist_ok=True)
    W, H = 216, 384
    for i in range(len(v["scenes"]) - 1):
        a, b = v["scenes"][i], v["scenes"][i + 1]
        cut = round(b["start"] * fps)
        strip = Image.new("RGB", (W * len(OFFS), H + 22), "white"); d = ImageDraw.Draw(strip)
        for k, o in enumerate(OFFS):
            strip.paste(frame_at(mp4, cut + o, fps).resize((W, H)), (k * W, 22))
            d.text((k * W + 6, 5), f"{o:+d}f ({(cut + o) / fps:.2f}s)", fill="black")
        p = f"{od}/{version}_{i:02d}_{a['type']}-{b['type']}.jpg"; strip.save(p, quality=82); print(p)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
