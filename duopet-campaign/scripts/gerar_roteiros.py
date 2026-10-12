"""Gera scripts/02-roteiros-finais.md e storyboard/storyboard.md a partir da linha do tempo real (timecodes exatos)."""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))

VISUAL = {
    "Hook": ("Frame 1 já em movimento: lista da 'sua rotina' (academia, reunião, almoço…) rola e recebe checks terracota. Na virada ('e a do seu pet?') os cards explodem com desfoque de movimento e o cão preto em grande-angular salta de baixo com mola.",
             "SUA ROTINA EM DIA. → E A DO SEU PET?", "Câmera na mão sutil; cards com motion blur na dispersão; cão com mola (overshoot).", "Tic-tacs a cada check; pop + mola na entrada do cão."),
    "HookList": ("Quatro objetos do dia a dia caem em cascata, cada um no tempo exato da palavra: post-it 'ração 2x 180g?', cartela de comprimidos, carteira de vacinação com '?? / ??', post-it 'vet quinta 15h??'.",
                 "RAÇÃO, REMÉDIO, VACINA, CONSULTA… → TÁ TUDO ONDE?", "Câmera na mão; cada objeto entra com mola e desfoque direcional.", "Batida de cartão a cada palavra; pop grave na pergunta."),
    "HookDemo": ("Fundo creme; o app já aparece no frame 1 com a rotina do Thor; um toque marca 'Passeio' e o anel anda de 60% para 80%.",
                 "A ROTINA DO SEU PET.", "Telefone em leve perspectiva 3D com aproximação lenta.", "Toque, 'check' em duas notas, subida suave do anel."),
    "HookMulti": ("Cão e gato em recorte entram com mola; abaixo, duas listas de cuidados (Thor e Mia) se embaralham.",
                  "2 PETS. 2 ROTINAS. → 1 CABEÇA PRA TUDO?", "Listas orbitam e se misturam.", "Pops; embaralhar de cartas; pop grave."),
    "HookPill": ("Cartela de comprimidos gigante; os alvéolos piscam entre 'tomado' e 'não tomado'; um '?' terracota gira.",
                 "JÁ DEU O REMÉDIO HOJE? → …OU FOI ONTEM?", "Cartela gira na virada.", "Pop grave; 'flip' na virada."),
    "Chaos": ("Objetos se acumulam no tempo de cada palavra (post-its, cartela, carteirinha, calendário, conversa de família, nota de pet shop). Em 'cabeça', tudo treme e um '?' terracota aparece; no fim, tudo é sugado para um único ponto de luz.",
              "RAÇÃO, / REMÉDIO, / VACINA, / CONSULTA… → ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Câmera na mão que aumenta de intensidade; convergência com aceleração contínua e desfoque.", "Batidas de cartão, papel; riser de 1,6 s; sucção."),
    "ChaosShort": ("Continuação do caos: calendário, conversa e nota fiscal se somam aos objetos; tudo converge para um ponto de luz.",
                   "ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Igual ao caos do master, mais curto.", "Papel, riser, sucção."),
    "ChaosContrast": ("Flash do 'antes': objetos espalhados que convergem para um ponto.", "ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Igual ao caos.", "Papel, riser, sucção."),
    "Chaos15": ("Em 2,5 s, sete objetos entram de todos os lados e convergem para o ponto de luz.", "OS CUIDADOS DO SEU PET… → TUDO ESPALHADO?", "Câmera na mão.", "Batidas, riser, sucção."),
    "Reveal": ("TRANSIÇÃO-ASSINATURA: o ponto de luz vira um disco creme que toma a tela; os cuidados (Água, Alimentação, Medicamento, Passeio, Escovação) saem do centro e se encaixam em ordem; a câmera recua de 2,35× para 1× e revela que tudo está dentro do app, num iPhone. O logo DuoPet entra com mola no nome da marca.",
               "Logo DuoPet (símbolo + nome)", "Wipe circular (ease in-out) → assentamento em mola com escalonamento de 90 ms → recuo de câmera com curva lenta-longa.", "Impacto grave + brilho; cliques suaves a cada linha que encaixa; pop no logo. A trilha muda de menor para maior (Cmaj9)."),
    "Reveal15": ("Mesma transição-assinatura, comprimida.", "Logo DuoPet", "Idem.", "Impacto + brilho."),
    "Demo": ("Tela Hoje do Thor: 'Rotina de hoje 3 de 5', anel em 60%, 'Próximo: 18:00 · Passeio' destacado. O dedo toca 'Passeio': o círculo preenche, o check se desenha, o anel vai a 80%, o contador vira '4 de 5' e o próximo passa a ser 'Escovação 21:00'. Aparece o toast real do app 'Passeio concluído · Agora · Thor'. No fim, 'Escovação' pulsa e surge o selo 'Falta 1 · 21:00'.",
             "VEJA. → MARQUE. → SAIBA O QUE FALTA.", "Telefone gira levemente em 3D; aproximação de 1,34× no anel logo após o toque; recuo antes de 'falta'.", "Toque, check em duas notas, subida do anel, toast."),
    "Demo15": ("Toque em 'Passeio' → check → anel 80% → selo 'Falta 1'.", "MARQUE. → VEJA O QUE FALTA.", "Idem, mais curto.", "Toque, check, anel."),
    "Benefits": ("Giro de cubo 3D entre telas reais: Saúde (V10 reforço em 12 dias, Antirrábica, remédio em uso, receita em PDF) → Gastos (R$ 186,40 no mês; por categoria e por pet) → Brincar ('Caça ao petisco · 5 min' e sons de brinquedo com equalizador), com o dálmata saindo de trás do telefone. Em 'cada pet da casa', a tela se abre numa fotografia de 3 gatos e um pitbull; depois volta para o Perfil, onde o seletor troca de Thor para Mia.",
                 "SAÚDE. / GASTOS. / BRINCADEIRAS. → CADA PET DA CASA. → CÃO OU GATO? → UM PERFIL PARA CADA PET.", "Cubo 3D de 0,5 s (ease in-out) por benefício; máscara retangular que expande da tela para o quadro inteiro (interface → foto real).", "Swooshes estéreo, moedas suaves em gastos, apito de brinquedo, toque e pop na troca de pet."),
    "MultiPet": ("Perfil do Thor → toque no seletor → Mia; giro 3D para a rotina da Mia (água, sachê, caixa de areia, brincadeira de caça, arranhador). Cão e gato em recorte nas laterais.",
                 "CÃO E GATO, 1 CONTA. → CADA UM COM A SUA ROTINA.", "Cubo 3D; recortes entram com mola.", "Swoosh, toque, pop."),
    "Emotion": ("A tela do perfil se abre (máscara) numa fotografia: gato e border collie juntos, com luz quente e Ken Burns lento.",
                "MENOS COISA NA CABEÇA. → MAIS TEMPO JUNTOS.", "Máscara retangular que expande; zoom lento de 7%.", "Ar/ambiente; a trilha abre para piano e pad (Fmaj7 → G)."),
    "CTA": ("A foto encolhe até o lugar do símbolo; o logo entra com mola e o nome desliza. Abaixo: 'Saiba o que seu pet precisa hoje.' (mesma frase do topo da landing), selos '✓ 3 dias grátis' e '✓ sem cartão' (selos, não botões), 'duopet.site' grande com sublinhado terracota, e 'No celular ou no computador · sem instalar'. Na base, quatro pets espiando sobem.",
            "SAIBA O QUE SEU PET PRECISA HOJE. · 3 DIAS GRÁTIS · SEM CARTÃO · duopet.site", "Morph foto → símbolo; molas suaves; sublinhado em ease in-out.", "Motivo da marca (Sol–Dó–Mi em sinos) no logo; acorde final (Dó maior) sincronizado com a URL, com fade no último frame."),
    "CTA15": ("Logo, selos da oferta e URL.", "3 DIAS GRÁTIS · SEM CARTÃO · duopet.site", "Molas.", "Motivo da marca + acorde final."),
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
