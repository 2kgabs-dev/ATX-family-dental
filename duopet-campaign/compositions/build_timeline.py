"""Fonte única de sincronização: gera src/data/timeline.json.

Para cada versão (master, performance com 4 ganchos, 15s) define cenas, falas, legendas palavra a palavra,
pontos de sincronia (cues) usados pela animação e a lista de efeitos sonoros usada pela mixagem.
Uso: python3 build_timeline.py [voz]   (padrão: pm_alex)
"""
import json, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VOICE = sys.argv[1] if len(sys.argv) > 1 else "pm_alex"
FPS = 30
GRID = 0.25  # cortes no grid de colcheia a 120 BPM
LINES = json.load(open(f"{ROOT}/scripts/vo-lines.json"))["lines"]
TIM = json.load(open(f"{ROOT}/voice/{VOICE}/timings.json"))


def line(lid):
    L = LINES[lid]
    src = L.get("same", lid)
    return src, LINES[src], TIM[src]


def q(x):
    return math.ceil(x / GRID - 1e-9) * GRID


def build(spec, tail=1.0):
    """spec: lista de (scene_type, line_id, lead, extra_after). Retorna dict da versão."""
    t = 0.0
    scenes, vo, words_all = [], [], []
    for i, (stype, lid, lead, extra) in enumerate(spec):
        src, L, T = line(lid)
        is_last = i == len(spec) - 1
        length = q(lead + T["dur"] + (tail if is_last else 0.14) + extra)
        vstart = t + lead
        ws = [{"w": w["w"], "start": round(vstart + w["start"], 3), "end": round(vstart + w["end"], 3)} for w in T["words"]]
        scenes.append({"id": f"{i:02d}-{stype}", "type": stype, "line": src, "start": round(t, 3), "end": round(t + length, 3),
                       "voStart": round(vstart, 3), "voEnd": round(vstart + T["dur"], 3), "words": ws, "caption": L["caption"]})
        vo.append({"line": src, "file": f"voice/{VOICE}/{src}.wav", "start": round(vstart, 3), "dur": T["dur"]})
        # legenda: "duopet ponto site" vira "duopet.site"
        for k in range(len(ws) - 2):
            if ws[k]["w"].lower() == "duopet" and ws[k + 1]["w"].lower() == "ponto" and ws[k + 2]["w"].lower().startswith("site"):
                ws[k:k + 3] = [{"w": "duopet.site", "start": ws[k]["start"], "end": ws[k + 2]["end"]}]
                break
        words_all += ws
        t += length
    return {"duration": round(t, 3), "frames": int(round(t * FPS)), "scenes": scenes, "vo": vo, "words": words_all}


def word_time(scene, pattern, which="start", nth=0):
    hits = [w for w in scene["words"] if re.search(pattern, w["w"], re.I)]
    if len(hits) <= nth:
        raise ValueError(f"{pattern} não encontrado em {scene['line']}: {[w['w'] for w in scene['words']]}")
    return hits[nth][which]


def add_cues(v):
    """Pontos de sincronia por tipo de cena (em segundos absolutos) + SFX."""
    sfx = []
    for s in v["scenes"]:
        c = {}
        T = s["type"]
        if T == "Hook":
            c["turn"] = word_time(s, r"^e$", nth=0) - 0.05  # "…e a do seu pet?"
            c["petWord"] = word_time(s, r"^pet")
            sfx += [dict(n="whoosh_soft", t=s["start"] + 0.02, g=0.5), dict(n="tick", t=s["start"] + 0.45, g=0.35), dict(n="tick", t=s["start"] + 0.85, g=0.35),
                    dict(n="tick", t=s["start"] + 1.25, g=0.35), dict(n="pop_big", t=c["turn"], g=0.8), dict(n="boing", t=c["turn"] + 0.05, g=0.35)]
        elif T in ("Chaos", "ChaosShort", "ChaosContrast", "Chaos15"):
            keys = []
            for pat in [r"^ração", r"^remédio", r"^vacina", r"^consulta", r"^calendário", r"^whatsapp", r"^cabeça", r"^espalhados", r"^cuidados"]:
                try:
                    keys.append((pat.strip("^"), word_time(s, pat)))
                except ValueError:
                    pass
            c["keys"] = {k: round(tt - 0.04, 3) for k, tt in keys}
            for k, tt in keys:
                sfx.append(dict(n="card_slap" if k in ("ração", "remédio", "vacina", "consulta") else "paper", t=tt - 0.04, g=0.55 if k in ("ração", "remédio", "vacina", "consulta") else 0.22))
            c["converge"] = s["end"] - 0.95
            sfx += [dict(n="riser", t=s["end"] - 1.6, g=0.6, dur=1.6), dict(n="suck", t=c["converge"] + 0.1, g=0.55)]
        elif T in ("Reveal", "Reveal15"):
            c["impact"] = s["start"]
            c["brand"] = word_time(s, r"duopet")
            c["place"] = word_time(s, r"^lugar|^só") if any(re.search(r"^lugar|^só", w["w"]) for w in s["words"]) else s["voEnd"] - 0.6
            sfx += [dict(n="impact", t=s["start"], g=0.75), dict(n="shimmer", t=s["start"] + 0.05, g=0.45)]
            for k in range(5):
                sfx.append(dict(n="click_soft", t=s["start"] + 0.18 + k * 0.09, g=0.28))
            sfx.append(dict(n="pop", t=c["brand"] - 0.03, g=0.5))
        elif T in ("Demo", "Demo15"):
            c["see"] = s["voStart"]
            c["tap"] = word_time(s, r"^mar[cq]") + 0.1
            c["left"] = word_time(s, r"^falta") - 0.25
            sfx += [dict(n="whoosh_soft", t=s["start"], g=0.35), dict(n="tap", t=c["tap"], g=0.6), dict(n="check", t=c["tap"] + 0.06, g=0.7),
                    dict(n="ring", t=c["tap"] + 0.2, g=0.4), dict(n="toast", t=c["tap"] + 0.55, g=0.35)]
        elif T == "Benefits":
            c["health"] = word_time(s, r"^vacinas") - 0.1
            c["money"] = word_time(s, r"^gastos") - 0.1
            c["play"] = word_time(s, r"^brincadeiras") - 0.1
            c["pets"] = word_time(s, r"^pra") - 0.05
            c["switch"] = word_time(s, r"^gato") - 0.1
            sfx += [dict(n="swoosh_3d", t=c["health"], g=0.45), dict(n="swoosh_3d", t=c["money"], g=0.45), dict(n="coin", t=c["money"] + 0.35, g=0.3),
                    dict(n="swoosh_3d", t=c["play"], g=0.45), dict(n="squeak", t=c["play"] + 0.35, g=0.35), dict(n="whoosh_soft", t=c["pets"], g=0.4),
                    dict(n="tap", t=c["switch"], g=0.5), dict(n="pop", t=c["switch"] + 0.05, g=0.4)]
        elif T == "MultiPet":
            c["switch"] = word_time(s, r"^conta") - 0.05
            c["routine"] = word_time(s, r"^rotina")
            sfx += [dict(n="swoosh_3d", t=s["start"], g=0.45), dict(n="tap", t=c["switch"], g=0.5), dict(n="pop", t=c["switch"] + 0.05, g=0.4),
                    dict(n="click_soft", t=c["routine"], g=0.3)]
        elif T == "Emotion":
            c["warm"] = word_time(s, r"^mais")
            sfx += [dict(n="air", t=s["start"], g=0.5, dur=2.5)]
        elif T in ("CTA", "CTA15"):
            c["logo"] = s["voStart"] if s["words"][0]["w"].lower().startswith("duopet") else s["start"] + 0.2
            c["offer"] = word_time(s, r"^(teste|três)")
            c["url"] = word_time(s, r"^duopet", nth=1 if s["words"][0]["w"].lower().startswith("duopet") else 0)
            sfx += [dict(n="logo_sting", t=c["logo"], g=0.7), dict(n="pop", t=c["offer"], g=0.4), dict(n="click_soft", t=c["url"], g=0.35)]
        elif T in ("HookList",):
            c["items"] = [word_time(s, p) - 0.04 for p in [r"^ração", r"^remédio", r"^vacina", r"^consulta"]]
            c["where"] = word_time(s, r"^tudo|^tá") - 0.05
            sfx += [dict(n="card_slap", t=x, g=0.55) for x in c["items"]] + [dict(n="pop_big", t=c["where"], g=0.7)]
        elif T == "HookDemo":
            c["tap"] = s["start"] + 0.55
            c["pet"] = word_time(s, r"^pet")
            sfx += [dict(n="tap", t=c["tap"], g=0.6), dict(n="check", t=c["tap"] + 0.06, g=0.7), dict(n="ring", t=c["tap"] + 0.2, g=0.4)]
        elif T == "HookMulti":
            c["two"] = word_time(s, r"^rotinas") - 0.05
            c["head"] = word_time(s, r"^cabeça") - 0.1
            sfx += [dict(n="pop", t=s["start"] + 0.05, g=0.5), dict(n="pop", t=s["start"] + 0.35, g=0.5), dict(n="shuffle", t=c["two"], g=0.5), dict(n="pop_big", t=c["head"], g=0.6)]
        elif T == "HookPill":
            c["or"] = word_time(s, r"^ou") - 0.05
            sfx += [dict(n="pop_big", t=s["start"] + 0.05, g=0.7), dict(n="flip", t=c["or"], g=0.55)]
        s["cues"] = {k: (round(vv, 3) if isinstance(vv, (int, float)) else vv) for k, vv in c.items()}
    v["sfx"] = sorted([dict(x, t=round(max(0, x["t"]), 3)) for x in sfx], key=lambda x: x["t"])
    # mapa de seções musicais (troca de clima na revelação, pausa emocional e assinatura)
    secs = []
    for s in v["scenes"]:
        mood = {"Hook": "tension", "HookList": "tension", "HookDemo": "groove", "HookMulti": "tension", "HookPill": "tension",
                "Chaos": "tension", "ChaosShort": "tension", "ChaosContrast": "tension", "Chaos15": "tension",
                "Reveal": "reveal", "Reveal15": "reveal", "Demo": "groove", "Demo15": "groove", "Benefits": "groove", "MultiPet": "groove",
                "Emotion": "warm", "CTA": "sting", "CTA15": "sting"}[s["type"]]
        if secs and secs[-1]["mood"] == mood:
            secs[-1]["end"] = s["end"]
        else:
            secs.append({"mood": mood, "start": s["start"], "end": s["end"]})
    v["music"] = secs
    return v


VERSIONS = {
    "master": [("Hook", "M1", 0.15, 0), ("Chaos", "M2", 0.18, 0.1), ("Reveal", "M3", 0.28, 0.05), ("Demo", "M4", 0.18, 0.05),
               ("Benefits", "M5", 0.15, 0.05), ("Emotion", "M6", 0.25, 0.1), ("CTA", "M7", 0.2, 0)],
    "perf_h1": [("HookList", "H1", 0.1, 0), ("ChaosShort", "P2a", 0.12, 0.1), ("Reveal", "P3", 0.22, 0), ("Demo", "P4", 0.15, 0),
                ("MultiPet", "P5", 0.12, 0), ("CTA", "P6", 0.15, 0)],
    "perf_h2": [("HookDemo", "H2", 0.12, 0.2), ("ChaosContrast", "P2b", 0.12, 0.1), ("Reveal", "P3", 0.22, 0), ("Demo", "P4", 0.15, 0),
                ("MultiPet", "P5", 0.12, 0), ("CTA", "P6", 0.15, 0)],
    "perf_h3": [("HookMulti", "H3", 0.1, 0), ("ChaosShort", "P2a", 0.12, 0.1), ("Reveal", "P3", 0.22, 0), ("Demo", "P4", 0.15, 0),
                ("MultiPet", "P5", 0.12, 0), ("CTA", "P6", 0.15, 0)],
    "perf_h4": [("HookPill", "H4", 0.12, 0.1), ("ChaosShort", "P2a", 0.12, 0.1), ("Reveal", "P3", 0.22, 0), ("Demo", "P4", 0.15, 0),
                ("MultiPet", "P5", 0.12, 0), ("CTA", "P6", 0.15, 0)],
    "short15": [("Chaos15", "S1", 0.08, 0.15), ("Reveal15", "S2", 0.12, 0), ("Demo15", "S3", 0.1, 0.1), ("CTA15", "S4", 0.12, 0)],
}

if __name__ == "__main__":
    out = {"fps": FPS, "width": 1080, "height": 1920, "voice": VOICE, "versions": {}}
    for name, spec in VERSIONS.items():
        v = add_cues(build(spec, tail=0.9 if name == "short15" else 1.1))
        out["versions"][name] = v
        print(f"{name:8s} {v['duration']:6.2f}s  " + " | ".join(f"{s['type']} {s['end']-s['start']:.2f}" for s in v["scenes"]))
    os.makedirs(f"{ROOT}/compositions/src/data", exist_ok=True)
    json.dump(out, open(f"{ROOT}/compositions/src/data/timeline.json", "w"), ensure_ascii=False, indent=1)
