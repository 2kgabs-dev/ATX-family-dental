"""Folha de contato de stills para revisão visual: python sheet.py out.jpg img1.png img2.png ... [--w 360]"""
import sys
from PIL import Image, ImageDraw
args = sys.argv[1:]
w = 360
if "--w" in args:
    i = args.index("--w"); w = int(args[i + 1]); del args[i:i + 2]
out, files = args[0], args[1:]
ims = [Image.open(f).convert("RGB") for f in files]
h = int(ims[0].height * w / ims[0].width)
cols = min(len(ims), 6)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y))
    d.text((x + 4, y + h + 4), f.split("/")[-1][-24:], fill=(230, 230, 230))
sheet.save(out, quality=85)
print(out, sheet.size)
