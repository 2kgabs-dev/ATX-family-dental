"""Fonte única de sincronização: gera src/data/timeline.json.

Para cada versão (master, performance com 4 ganchos, 15s) define cenas, falas, legendas palavra a palavra,
pontos de sincronia (cues) usados pela animação e a lista de efeitos sonoros usada pela mixagem.
Uso: python3 build_timeline.py [voz]   (padrão: fem_viva — Kokoro pf_dora 60% + ef_dora 40% com prosódia viva, ver voice/tools/prosody.py)
Legendas: cada cena recebe "captions" no formato Caption do @remotion/captions (ms absolutos, espaço antes de cada palavra,
pageBreakAfter em pontuação, no limite de caracteres e no fim da cena).
"""
import json, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VOICE = sys.argv[1] if len(sys.argv) > 1 else "fem_viva"
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
        ws = [{"w": w["w"], "start": round(vstart + w["start"], 3), "end": round(vstart + w["end"], 3), "asr": w.get("asr", True)} for w in T["words"]]
        scenes.append({"id": f"{i:02d}-{stype}", "type": stype, "line": src, "start": round(t, 3), "end": round(t + length, 3),
                       "voStart": round(vstart, 3), "voEnd": round(vstart + T["dur"], 3), "words": ws, "caption": L["caption"]})
        vo.append({"line": src, "file": f"voice/{VOICE}/{src}.wav", "start": round(vstart, 3), "dur": T["dur"]})
        # legenda: "duopet ponto site" vira "duopet.site"
        for k in range(len(ws) - 2):
            if ws[k]["w"].lower() == "duopet" and ws[k + 1]["w"].lower() == "ponto" and ws[k + 2]["w"].lower().startswith("site"):
                ws[k:k + 3] = [{"w": "duopet.site", "start": ws[k]["start"], "end": ws[k + 2]["end"]}]
                break
        scenes[-1]["captions"] = to_captions(ws)
        words_all += ws
        t += length
    return {"duration": round(t, 3), "frames": int(round(t * FPS)), "scenes": scenes, "vo": vo, "words": words_all}


MAX_CHARS, MAX_WEIGHT = 17, 3.0
# palavras que não devem ficar sozinhas no fim de uma página (artigos, preposições, conjunções curtas)
FUNC = set("a o as os e de do da dos das no na nos nas em que seu sua pra com ou é até ao à num cada se".split())


def _key(w):
    return re.sub(r"[^\wáéíóúâêôãõàç]", "", w.lower())


def _paginate(words):
    """Divide uma frase (sem pontuação interna) em páginas por programação dinâmica:
    ≤17 caracteres, peso ≤3 (palavra funcional pesa 0,5), sem terminar página em palavra funcional, páginas equilibradas."""
    n = len(words); total = len(" ".join(words)); k = max(1, math.ceil(total / 15)); T = total / k
    best = [0.0] + [math.inf] * n; prev = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(j - 1, -1, -1):
            chunk = words[i:j]; chars = len(" ".join(chunk))
            weight = sum(0.5 if _key(w) in FUNC else 1 for w in chunk)
            if len(chunk) > 1 and (chars > MAX_CHARS or weight > MAX_WEIGHT): break
            c = 1 + ((chars - T) / T) ** 2
            if j < n and _key(chunk[-1]) in FUNC: c += 3
            if best[i] + c < best[j]: best[j], prev[j] = best[i] + c, i
    cuts, j = [], n
    while j > 0: cuts.append(j); j = prev[j]
    return sorted(cuts)


def to_captions(ws):
    """Palavras -> Caption[] (@remotion/captions), com quebra de página editorial em pontuação + _paginate."""
    caps = [{"text": (" " if k else "") + w["w"], "startMs": round(w["start"] * 1000), "endMs": round(w["end"] * 1000),
             "timestampMs": round((w["start"] + w["end"]) * 500), "confidence": 1.0 if w.get("asr", True) else 0.5} for k, w in enumerate(ws)]
    start = 0
    for k, w in enumerate(ws):
        if re.search(r"[,.…?!:]$", w["w"]) or k == len(ws) - 1:
            for c in _paginate([x["w"] for x in ws[start:k + 1]]):
                caps[start + c - 1]["pageBreakAfter"] = True
            start = k + 1
    return caps


def word_time(scene, pattern, which="start", nth=0):
    hits = [w for w in scene["words"] if re.search(pattern, w["w"], re.I)]
    if len(hits) <= nth:
        raise ValueError(f"{pattern} não encontrado em {scene['line']}: {[w['w'] for w in scene['words']]}")
    return hits[nth][which]


# Transição de cada corte. frames a 30 qps. "None" = corte seco, quando a continuidade já está dentro das cenas
# (caos → revelação: o ponto vira a linha; demo → benefícios/multi-pet: o celular continua na mesma pose e gira).
CUTS = {
    # ganchos → caos: todos com o mesmo "mergulho" no ponto terracota do título (o A/B mede o gancho, não a transição).
    # Pontos medidos nos renders: centro do ponto do "?" / do ponto final.
    # master: cortina noturna que cai (dentro das cenas, sem Transition). O master já tem duas íris (revelação e emoção);
    # um 3º círculo aqui viraria repetição. O mergulho fica para os ganchos de performance.
    ("HookDemo", "ChaosContrast"): dict(preset="dive", frames=14, params=dict(x=564, y=463, r0=13)),  # ponto de ASSIM.
    ("HookMulti", "ChaosShort"): dict(preset="dive", frames=14, params=dict(x=841, y=542, r0=15)),  # "?" de PRA TUDO?
    ("HookPill", "ChaosShort"): dict(preset="dive", frames=14, params=dict(x=676, y=558, r0=16)),  # "?" de ONTEM?
    # lista → caos (H1): mesmo plano dos dois lados, só o título sai por máscara (dentro da cena). Corte seco.
    # caos → revelação: o ponto creme vira a linha (dentro das cenas). Corte seco.
    # revelação → demo: celular idêntico; o título da revelação sai por máscara nos 6 últimos quadros. Corte seco no tempo forte.
    # demo → benefícios/multi-pet: mesma pose, a demo limpa o quadro e o giro começa no corte. Corte seco.
    # portal: a tela do celular (Perfil, creme) vira o papel creme da cena emocional. Retângulo da tela do telefone em PH.
    ("Benefits", "Emotion"): dict(preset="portal", frames=14, params=dict(x=279.0, y=489.0, w=522.0, h=1129.5, r=68.0)),
    # o painel terracota atravessa o corte com velocidade casada (CTA continua a subida)
    ("Emotion", "CTA"): dict(preset="colorWipe", frames=16),
    ("MultiPet", "CTA"): dict(preset="colorWipe", frames=16),
    ("Demo15", "CTA15"): dict(preset="colorWipe", frames=16),
    # v4: a revelação sai em chicote para a montagem de vantagens; a montagem termina na varredura terracota
    ("Reveal", "Montage"): dict(preset="whip", frames=10, params=dict(dir="left")),
    ("Reveal15", "Montage15"): dict(preset="whip", frames=10, params=dict(dir="left")),
    ("Montage", "CTA"): dict(preset="colorWipe", frames=16),
    # v4 performance: gancho → montagem pelo mesmo "mergulho" no ponto do título (o A/B mede o gancho, não a transição)
    ("HookList", "Montage"): dict(preset="dive", frames=14, params=dict(x=605, y=587, r0=15)),  # ponto do "?" de ONDE? (medido no render)
    ("HookDemo", "Montage"): dict(preset="dive", frames=14, params=dict(x=564, y=463, r0=13)),
    ("HookMulti", "Montage"): dict(preset="dive", frames=14, params=dict(x=841, y=542, r0=15)),
    ("HookPill", "Montage"): dict(preset="dive", frames=14, params=dict(x=676, y=558, r0=16)),
    ("Montage15", "CTA15"): dict(preset="colorWipe", frames=16),
}


def cut_spec(a, b):
    return CUTS.get((a, b))


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
                if T == "Chaos" and k == "ração":
                    continue  # no master o 1º papel pousa com a cortina (som no corte)
                sfx.append(dict(n="card_slap" if k in ("ração", "remédio", "vacina", "consulta") else "paper", t=tt - 0.04, g=0.55 if k in ("ração", "remédio", "vacina", "consulta") else 0.22))
            c["converge"] = s["end"] - 0.95
            sfx += [dict(n="riser", t=s["end"] - 1.6, g=0.6, dur=1.6), dict(n="suck", t=c["converge"] + 0.1, g=0.55)]
        elif T in ("Reveal", "Reveal15"):
            c["impact"] = s["start"]
            c["brand"] = word_time(s, r"duopet")
            c["place"] = word_time(s, r"^lugar|^só") if any(re.search(r"^lugar|^só", w["w"]) for w in s["words"]) else s["voEnd"] - 0.6
            c["kicker"] = word_time(s, r"^cada|^fica") if any(re.search(r"^cada|^fica", w["w"]) for w in s["words"]) else c["brand"] + 0.5
            c["text"] = ["cada cuidado", "No lugar certo"] if s["line"] in ("M3", "P3") else ["fica tudo", "Num lugar só"]
            # transição-assinatura: traço desenhando → pata/batimento → selo com logo → íris → app sobe
            sfx += [dict(n="impact", t=s["start"], g=0.6), dict(n="draw", t=s["start"], g=0.5), dict(n="tick", t=s["start"] + 0.5, g=0.3),
                    dict(n="tick", t=s["start"] + 0.68, g=0.3), dict(n="pop_big", t=s["start"] + 0.84, g=0.6), dict(n="shimmer", t=s["start"] + 0.86, g=0.4),
                    dict(n="whoosh_soft", t=s["start"] + 1.45, g=0.5, dur=0.7), dict(n="swoosh_3d", t=s["start"] + 1.6, g=0.35)]
            for k in range(5):
                sfx.append(dict(n="click_soft", t=s["start"] + 1.95 + k * 0.08, g=0.25))
        elif T in ("Demo", "Demo15"):
            c["see"] = s["voStart"]
            c["tap"] = word_time(s, r"^mar[cq]") + 0.1
            c["left"] = word_time(s, r"^falta") - 0.25
            sfx += [dict(n="tap", t=c["tap"], g=0.6), dict(n="check", t=c["tap"] + 0.06, g=0.7),
                    dict(n="ring", t=c["tap"] + 0.2, g=0.4), dict(n="toast", t=c["tap"] + 0.5, g=0.35)]
            for tt in ([c["see"] - 0.2, c["tap"] - 0.45, c["left"] - 0.15] if s["type"] == "Demo" else [c["see"] - 0.25, c["left"] - 0.1]):
                sfx.append(dict(n="typing", t=tt, g=0.3))
        elif T in ("Montage", "Montage15"):
            # um plano por trecho da fala (parts com "shot" em scripts/vo-lines.json); o plano começa 0,12 s antes da 1ª palavra
            shots, wi = [], 0
            for part in LINES[s["line"]]["parts"]:
                n = len(part["t"].split())
                if part.get("shot") and wi < len(s["words"]):
                    ws = s["words"][wi:wi + n]
                    shots.append({"key": part["shot"], "t0": round(ws[0]["start"] - 0.12, 3), "words": [[w["w"], w["start"]] for w in ws]})
                wi += n
            shots[0]["t0"] = min(shots[0]["t0"], s["start"] + 0.05)
            c["shots"] = shots
            ends = [sh["t0"] for sh in shots[1:]] + [s["end"]]
            # a tela já escreve a fala em letra grande nesses planos: legenda desligada (sem texto duplicado)
            # (+0,07 s: a página do plano mudo some exatamente quando a 1ª palavra do plano seguinte aparece)
            c["muteCaps"] = [[sh["t0"] - 0.05, e + 0.07] for sh, e in zip(shots, ends) if sh["key"] in ("hook", "promessa", "triade", "gratis", "plus")]
            def wt(sh, pat, nth=0, fb=None):
                hits = [tt for w, tt in sh["words"] if re.search(pat, w, re.I)]
                return hits[nth] if len(hits) > nth else (fb if fb is not None else sh["t0"] + 0.5)
            enter = {"promessa": "slam", "triade": "slam", "gratis": "slam", "plus": "rise"}
            for k, sh in enumerate(shots):
                key, t0 = sh["key"], sh["t0"]
                if k > 0:
                    mode = enter.get(key, "push")
                    if mode == "push":
                        sfx.append(dict(n="swoosh_3d", t=t0 - 0.28, g=0.42))
                    elif mode == "slam":
                        sfx += [dict(n="impact", t=t0 - 0.02, g=0.42), dict(n="pop_big", t=t0, g=0.35)]
                    else:
                        sfx.append(dict(n="whoosh_soft", t=t0 - 0.35, g=0.55, dur=0.45))
                if key == "hook":
                    # assinatura sonora: o "check" de duas notas do app abre o anúncio (e o motivo Sol–Dó–Mi fecha no cartão)
                    sfx += [dict(n="check", t=s["start"] + 0.2, g=0.55), dict(n="pop", t=wt(sh, r"^gato") - 0.1, g=0.45), dict(n="boing", t=wt(sh, r"^gato"), g=0.25)]
                elif key == "promessa":
                    sfx += [dict(n="logo_sting", t=t0 + 0.05, g=0.35), dict(n="draw", t=wt(sh, r"^hoje"), g=0.35)]
                elif key == "contraste":
                    sfx += [dict(n="suck", t=t0 + 0.1, g=0.5), dict(n="pop", t=t0 + 0.75, g=0.35)]
                elif key == "rotina":
                    tap = max(t0 + 0.35, wt(sh, r"^marc", 0, t0 + 0.4) + 0.32)
                    sfx += [dict(n="tap", t=tap, g=0.55), dict(n="check", t=tap + 0.06, g=0.6), dict(n="ring", t=tap + 0.15, g=0.3), dict(n="toast", t=tap + 0.2, g=0.3)]
                elif key == "multipet":
                    tap = wt(sh, r"^gato", 0, t0 + 0.75) - 0.08
                    sfx += [dict(n="tap", t=tap, g=0.45), dict(n="pop", t=tap + 0.05, g=0.35)]
                elif key == "gastos":
                    sfx.append(dict(n="coin", t=t0 + 0.25, g=0.3))
                elif key == "brincar":
                    sfx += [dict(n="pop", t=t0 + 0.3, g=0.28), dict(n="squeak", t=wt(sh, r"^sons", 0, t0 + 1.3), g=0.3)]
                elif key == "triade":
                    step = max(0.3, (ends[k] - t0) / 3)
                    sfx += [dict(n="impact", t=t0 + j * step - 0.02, g=0.35) for j in (1, 2)]
                elif key == "gratis":
                    sfx.append(dict(n="shimmer", t=t0 + 0.1, g=0.3))
                elif key == "plus":
                    sem0 = wt(sh, r"^sem$", 0, t0 + 1.4)
                    sem1 = wt(sh, r"^sem$", 1, sem0 + 0.6)
                    sfx += [dict(n="pop", t=sem0 - 0.08, g=0.4), dict(n="draw", t=sem0 + 0.25, g=0.3), dict(n="pop", t=sem1 - 0.08, g=0.4), dict(n="pop", t=sem1 + 0.6, g=0.35)]
                else:
                    sfx.append(dict(n="pop", t=t0 + 0.3, g=0.28))
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
            draw_dur = max(0.6, c["warm"] - 0.35 - (s["start"] + 0.15))
            sfx += [dict(n="air", t=s["start"], g=0.4, dur=2.5), dict(n="draw", t=s["start"] + 0.15, g=0.35)]
            for f in (0.18, 0.42, 0.66, 0.88):
                sfx.append(dict(n="pop", t=s["start"] + 0.15 + draw_dur * f, g=0.3))
            sfx.append(dict(n="whoosh_soft", t=c["warm"] - 0.15, g=0.45, dur=0.8))
            sfx.append(dict(n="shimmer", t=c["warm"] + 0.05, g=0.22))  # luz quente (light leak) sobre a foto
        elif T in ("CTA", "CTA15"):
            c["logo"] = s["voStart"] if s["words"][0]["w"].lower().startswith("duopet") else s["start"] + 0.2
            hit = [w for w in s["words"] if re.search(r"^(teste|três)", w["w"], re.I)]
            spoken_head = s["words"][0]["w"].lower().startswith("saiba")  # v4: a locução do cartão É o título
            c["head"] = s["voStart"] - 0.05 if spoken_head else c["logo"] + (0.7 if T == "CTA" else 0.25)
            # v4: a oferta já foi falada no plano "plus"; no cartão ela entra logo depois do título
            c["offer"] = hit[0]["start"] if hit else c["head"] + (0.75 if T == "CTA" else 0.3)
            c["offerVis"] = max(c["offer"], s["start"] + 0.3)  # a varredura terracota cobre a oferta até ~0,27 s
            c["url"] = [w for w in s["words"] if re.search(r"^duopet", w["w"], re.I)][-1]["start"]  # a última menção ao endereço
            sfx += [dict(n="whoosh_soft", t=s["start"] - 0.22, g=0.55, dur=0.55), dict(n="logo_sting", t=c["logo"], g=0.7), dict(n="typing", t=c["logo"] + 0.15, g=0.25),
                    dict(n="pop", t=c["offerVis"], g=0.4), dict(n="click_soft", t=c["url"], g=0.35)]
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
    # transições entre cenas (lidas por src/components/Transitions.tsx) + o som de cada uma
    for a, b in zip(v["scenes"], v["scenes"][1:]):
        c = cut_spec(a["type"], b["type"])
        a["cutAfter"] = c
        cut = b["start"]
        # cortes feitos dentro das cenas
        if (a["type"], b["type"]) == ("Hook", "Chaos"):
            sfx += [dict(n="whoosh_soft", t=cut - 0.30, g=0.45, dur=0.30), dict(n="card_slap", t=cut + 0.067, g=0.7)]
        if (a["type"], b["type"]) == ("HookList", "ChaosShort"):
            sfx += [dict(n="tick", t=cut, g=0.5)]
        if a["type"].startswith("Reveal") and b["type"].startswith("Demo"):
            sfx += [dict(n="whoosh_soft", t=cut - 0.2, g=0.2, dur=0.2), dict(n="tick", t=cut, g=0.45)]
        if not c:
            continue
        cut = b["start"]
        if c["preset"] in ("zoomThrough", "dive"):
            sfx += [dict(n="whoosh_soft", t=cut - 0.32, g=0.55, dur=0.45), dict(n="impact", t=cut - 0.02, g=0.35)]
        elif c["preset"] == "whip":
            sfx += [dict(n="swoosh_3d", t=cut - 0.2, g=0.6)]
        elif c["preset"] in ("sheet", "portal"):
            sfx += [dict(n="whoosh_soft", t=cut - 0.25, g=0.45, dur=0.5), dict(n="paper", t=cut + 0.05, g=0.18)]
        elif c["preset"] == "lightLeak":
            sfx += [dict(n="shimmer", t=cut - 0.15, g=0.28)]
    v["sfx"] = sorted([dict(x, t=round(max(0, x["t"]), 3)) for x in sfx], key=lambda x: x["t"])
    # mapa de seções musicais (troca de clima na revelação, pausa emocional e assinatura)
    secs = []
    for s in v["scenes"]:
        mood = {"Hook": "tension", "HookList": "tension", "HookDemo": "groove", "HookMulti": "tension", "HookPill": "tension",
                "Chaos": "tension", "ChaosShort": "tension", "ChaosContrast": "tension", "Chaos15": "tension",
                "Reveal": "reveal", "Reveal15": "reveal", "Demo": "groove", "Demo15": "groove", "Benefits": "groove", "MultiPet": "groove",
                "Emotion": "warm", "CTA": "sting", "CTA15": "sting", "Montage": "groove", "Montage15": "groove"}[s["type"]]
        if secs and secs[-1]["mood"] == mood:
            secs[-1]["end"] = s["end"]
        else:
            secs.append({"mood": mood, "start": s["start"], "end": s["end"]})
    v["music"] = secs
    return v


VERSIONS = {
    # v4: a montagem de vantagens É o corpo do anúncio (produto no quadro 0, marca antes de 5 s, oferta e risco zero no fim)
    "master": [("Montage", "V4M", 0.06, 0.1), ("CTA", "V4E", 0.2, 0)],
    "perf_h1": [("HookList", "H1", 0.1, 0), ("Montage", "V4P", 0.12, 0.1), ("CTA", "V4E", 0.2, 0)],
    "perf_h2": [("HookDemo", "H2", 0.12, 0.2), ("Montage", "V4P", 0.12, 0.1), ("CTA", "V4E", 0.2, 0)],
    "perf_h3": [("HookMulti", "H3", 0.1, 0), ("Montage", "V4P", 0.12, 0.1), ("CTA", "V4E", 0.2, 0)],
    "perf_h4": [("HookPill", "H4", 0.12, 0.1), ("Montage", "V4P", 0.12, 0.1), ("CTA", "V4E", 0.2, 0)],
    "short15": [("Montage15", "V4S", 0.06, 0.1), ("CTA15", "V4E15", 0.12, 0)],
}

if __name__ == "__main__":
    out = {"fps": FPS, "width": 1080, "height": 1920, "voice": VOICE, "versions": {}}
    for name, spec in VERSIONS.items():
        v = add_cues(build(spec, tail=0.9 if name == "short15" else 1.1))
        out["versions"][name] = v
        print(f"{name:8s} {v['duration']:6.2f}s  " + " | ".join(f"{s['type']} {s['end']-s['start']:.2f}" for s in v["scenes"]))
    os.makedirs(f"{ROOT}/compositions/src/data", exist_ok=True)
    json.dump(out, open(f"{ROOT}/compositions/src/data/timeline.json", "w"), ensure_ascii=False, indent=1)
