"""Gera scripts/02-roteiros-finais.md e storyboard/storyboard.md a partir da linha do tempo real (timecodes exatos)."""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))

VISUAL = {
    "Hook": ("Fundo creme (abertura da referência do cliente). Frame 1 já em movimento: a 'sua rotina' (academia, reunião, almoço…) rola e recebe checks. Na virada, os cards saem com desfoque e entra 'e a do / SEU PET?' com as letras se aproximando e escurecendo; os quatro pets espiando sobem da base. SAÍDA (v3): a câmera mergulha no '?' terracota até a cor tomar a tela, e o caos abre em círculo a partir do mesmo ponto (12 quadros).",
             "SUA ROTINA EM DIA. → e a do SEU PET?", "Título 1 em máscara; título 2 em 'tracking settle'; pets com mola.", "Tic-tacs a cada check; pop na virada."),
    "HookList": ("Quatro objetos do dia a dia caem em cascata no tempo de cada palavra (post-it 'ração 2x 180g?', cartela, carteira de vacinação com '?? / ??', post-it 'vet quinta 15h??').",
                 "RAÇÃO, REMÉDIO, VACINA, CONSULTA… (letras caindo) → TÁ TUDO ONDE?", "Câmera na mão; objetos com mola e desfoque direcional.", "Batida de cartão a cada palavra; pop grave na pergunta."),
    "HookDemo": ("Mundo verde com órbitas; o app aparece no frame 1; um toque marca 'Passeio' e o anel vai de 60% para 80%. SAÍDA (v3): whip pan para a esquerda, com desfoque direcional, até o 'antes'.",
                 "a rotina do seu pet, ASSIM.", "Celular em perspectiva 3D com aproximação lenta.", "Toque, check em duas notas, subida do anel."),
    "HookMulti": ("Cão e gato em recorte entram com mola; duas listas de cuidados (Thor e Mia) se embaralham. SAÍDA (v3): mergulho no '?' de 'PRA TUDO?'.",
                  "2 PETS. 2 ROTINAS. (letras dispersas) → 1 CABEÇA PRA TUDO? (máscara)", "Listas orbitam e se misturam.", "Pops, embaralhar, pop grave."),
    "HookPill": ("Cartela de comprimidos; os alvéolos piscam entre 'tomado' e 'não tomado'; '?' terracota. SAÍDA (v3): whip pan vertical.",
                 "JÁ DEU O REMÉDIO HOJE? (máquina de escrever) → …OU FOI ONTEM? (entra em 3D)", "Cartela gira na virada.", "Pop grave; flip."),
    "Chaos": ("Fundo escuro. Objetos se acumulam no tempo de cada palavra (post-its, cartela, carteirinha, calendário, conversa de família, nota de pet shop). Em 'cabeça', tudo treme e um '?' terracota aparece; no fim, tudo é sugado para um único ponto de luz.",
              "RAÇÃO, / REMÉDIO, / VACINA, / CONSULTA… (letras caindo, como 'REMÉDIO' na referência) → ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Câmera na mão que aumenta; convergência com aceleração contínua e desfoque.", "Batidas de cartão, papel, riser, sucção."),
    "ChaosShort": ("Continuação do caos: calendário, conversa e nota se somam; tudo converge para o ponto de luz.", "ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Igual ao caos do master.", "Papel, riser, sucção."),
    "ChaosContrast": ("Flash do 'antes' que converge para o ponto.", "ESPALHADO EM: …", "Igual ao caos.", "Papel, riser, sucção."),
    "Chaos15": ("Em 2,5 s, sete objetos entram de todos os lados e convergem para o ponto de luz.", "OS CUIDADOS DO SEU PET… → TUDO ESPALHADO? (letras dispersas)", "Câmera na mão.", "Batidas, riser, sucção."),
    "Reveal": ("TRANSIÇÃO-ASSINATURA (vinda da referência do cliente): o mesmo ponto creme em que o caos terminou se estica e vira a linha (match cut, v3), vira pata, vira batimento e fecha num anel com o selo do logo DuoPet no instante em que a voz diz 'DuoPet'. O anel abre como íris e revela o mundo verde, onde o celular sobe em perspectiva entre órbitas e partículas, com os cuidados entrando em ordem.",
               "cada cuidado / NO LUGAR CERTO.", "Linha contínua com morph ponto a ponto; selo com mola; íris; celular com mola lenta de baixo para cima.", "Traço desenhando, ticks nas formas, pop + brilho no selo, whoosh na íris. A trilha passa de menor para maior (Cmaj9)."),
    "Reveal15": ("Mesma transição-assinatura, comprimida.", "fica tudo / NUM LUGAR SÓ.", "Idem.", "Idem."),
    "Demo": ("ENTRADA (v3): fusão de 8 quadros; o celular está na mesma pose do fim da revelação, então só o título troca. Mundo verde contínuo (partículas e órbitas não pulam no corte). Tela Hoje do Thor: '3 de 5', anel 60%, 'Próximo: 18:00 · Passeio' destacado. O dedo toca 'Passeio': check, anel em 80%, '4 de 5', próximo 'Escovação 21:00'. Surge a pílula branca 'Passeio concluído · Agora · Thor'. No fim, 'Escovação' pulsa com o selo 'Falta 1 · 21:00'.",
             "01 — ROTINA · VEJA. → MARQUE. → SAIBA O QUE FALTA. (máquina de escrever, como 'CUIDE_' na referência)", "Celular gira levemente em 3D; aproximação de 1,18× antes do toque; recuo antes de 'falta'.", "Digitação, toque, check em duas notas, subida do anel, toast."),
    "Demo15": ("Toque em 'Passeio' → check → anel 80% → selo 'Falta 1'.", "01 — ROTINA · MARQUE. → VEJA O QUE FALTA.", "Idem.", "Idem."),
    "Benefits": ("ENTRADA (v3): o celular começa na pose exata do fim da demonstração (inclinado) e assenta durante o 1º giro. Capítulos como na referência, com giro 'chicote' (3D + desfoque) entre telas reais. 02 SAÚDE: tela de vacinas, e o cartão 'Próximo reforço · V10 · em 12 dias' sai da tela. 03 GASTOS: R$ 186,40 por categoria e por pet. 04 BRINCADEIRAS: 'Caça ao petisco', ícones orbitando o celular, bola quicando e selo 'Brincadeira guiada · 5 min'. Em 'cada pet da casa', a tela se abre na foto de 3 gatos e um pitbull; volta ao Perfil e o seletor troca Thor → Mia.",
                 "02 — SAÚDE · CUIDE. (3D) / 03 — GASTOS · CONTROLE. (cascata) / 04 — BRINCADEIRAS · BRINQUE. (letras dispersas) → CADA PET DA CASA. → CÃO OU GATO. (o terracota passa de CÃO para GATO)", "Chicote de 0,42 s; cartão de vidro em 3D; órbita de ícones; máscara tela → foto.", "Swooshes estéreo, moedas em gastos, apito, toque e pop na troca."),
    "MultiPet": ("ENTRADA (v3): o celular continua na pose e na tela do fim da demonstração e gira para o Perfil. Mundo verde. Perfil do Thor → seletor → Mia; chicote para a rotina da Mia (água, sachê, caixa de areia, brincadeira de caça, arranhador). Cão e gato em recorte nas laterais.",
                 "CÃO OU GATO. (troca de cor) → cada um com / A SUA ROTINA.", "Chicote 3D; recortes com mola.", "Swoosh, toque, pop."),
    "Emotion": ("ENTRADA (v3): a página creme sobe por cima do mundo verde (cantos arredondados que se fecham, sombra), e a cena anterior recua e escurece. Fundo creme, como na referência: 'cada dia MAIS LEVE.' com uma curva ascendente pontilhada que se desenha. Ao longo dela, os cuidados vão sendo marcados (07:00 Ração, 12:00 Passeio, 18:00 Remédio, 21:00 Brincar), com os filhotes no canto. O ponto final da curva abre em círculo a foto do gato com o border collie, com uma luz quente (light leak) passando pela foto.",
                "cada dia / MAIS LEVE. → mais tempo / JUNTOS.", "Curva desenhada com cabeça terracota; chips com mola; íris a partir do ponto final; Ken Burns lento.", "Traço, pops nos chips, whoosh na íris; a trilha abre para piano e pad."),
    "CTA": ("ENTRADA (v3): o painel terracota sobe por cima da cena anterior e, no corte, continua subindo e revela o cartão final creme (como na referência): o símbolo entra com mola, 'DuoPet' é 'digitado', 'SISTEMA DE GESTÃO PARA CÃES E GATOS', 'Saiba o que seu pet precisa hoje.', pílula verde '✓ 3 dias grátis · sem cartão' (sem seta, não é botão), 'duopet.site' grande com sublinhado terracota e 'No celular ou no computador · sem instalar'. Grupo de pets subindo na base.",
            "SAIBA O QUE SEU PET PRECISA HOJE. · 3 DIAS GRÁTIS · SEM CARTÃO · duopet.site", "Wipe de cor; molas; digitação do nome; sublinhado em ease in-out.", "Whoosh na varredura; motivo Sol–Dó–Mi no logo; acorde final na URL."),
    "CTA15": ("Mesmo cartão final, comprimido.", "3 DIAS GRÁTIS · SEM CARTÃO · duopet.site", "Idem.", "Idem."),
}

MOOD = {"tension": "Tensão (Lá menor, pulso de baixo em semicolcheias, tic-tac, batida de coração)", "reveal": "Descoberta (impacto + Cmaj9 abrindo + arpejo de sinos)",
        "groove": "Groove positivo (120 BPM, C–G–Am–F, marimba, palmas)", "warm": "Abertura emocional (piano + pad, Fmaj7 → G)", "sting": "Assinatura (Sol–Dó–Mi + acorde final)"}

NAMES = {"master": "Comercial principal (cinematográfico)", "perf_h1": "Performance — Gancho H1 (dor/lista, controle)", "perf_h2": "Performance — Gancho H2 (demo primeiro)",
         "perf_h3": "Performance — Gancho H3 (multi-pet)", "perf_h4": "Performance — Gancho H4 (momento de dúvida)", "short15": "Anúncio curto (15 s)"}


def tc(x):
    return f"{int(x // 60):02d}:{x % 60:05.2f}"


out = ["# DuoPet — Roteiros finais com timecode (Fase 5)", "", f"Gerado a partir de `compositions/src/data/timeline.json` (voz `{TL['voice']}`, {TL['fps']} fps). Os timecodes são os do arquivo renderizado.", ""]
sb = ["# DuoPet — Storyboard (Fase 6)", "", "Quadros-chave renderizados: `storyboard/<versão>.jpg` (um quadro por cena, no meio da fala).", ""]
for name, v in TL["versions"].items():
    out += [f"## {NAMES[name]} — `{name}` · {v['duration']:.2f} s", ""]
    out += ["| Tempo | Cena | Locução | Texto na tela |", "|---|---|---|---|"]
    for s in v["scenes"]:
        out.append(f"| {tc(s['start'])}–{tc(s['end'])} | {s['type']} | {s['caption']} | {VISUAL[s['type']][1]} |")
    out += ["", "**Trilha:** " + " → ".join(f"{MOOD[m['mood']].split(' (')[0]} ({tc(m['start'])})" for m in v["music"]), ""]
    sb += [f"## {NAMES[name]} — `{name}`", "", f"![{name}]({name}.jpg)", ""]
    for i, s in enumerate(v["scenes"], 1):
        d = VISUAL[s["type"]]
        sb += [f"**{i}. {s['type']}** · {tc(s['start'])}–{tc(s['end'])}", f"- Imagem: {d[0]}", f"- Texto: {d[1]}", f"- Movimento: {d[2]}", f"- Som: {d[3]}", f"- Locução: “{s['caption']}”", ""]
open(f"{ROOT}/scripts/02-roteiros-finais.md", "w").write("\n".join(out))
os.makedirs(f"{ROOT}/storyboard", exist_ok=True)
open(f"{ROOT}/storyboard/storyboard.md", "w").write("\n".join(sb))
print("ok")
