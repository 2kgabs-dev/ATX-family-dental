"""Gera scripts/02-roteiros-finais.md e storyboard/storyboard.md a partir da linha do tempo real (timecodes exatos)."""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))

VISUAL = {
    "Hook": ("Fundo creme (abertura da referência do cliente). Frame 1 já em movimento: a 'sua rotina' (academia, reunião, almoço…) rola e recebe checks. Na virada, os cards saem com desfoque e entra 'e a do / SEU PET?' com as letras se aproximando e escurecendo; os quatro pets espiando sobem da base. SAÍDA (v3): nos 8 últimos quadros a noite do caos cai de cima como uma cortina, com gravidade; o título e os pets caem junto, e o 1º papel do caos já entra em voo, com um tranco de câmera no pouso.",
             "SUA ROTINA EM DIA. → e a do SEU PET?", "Título 1 em máscara; título 2 em 'tracking settle'; pets com mola.", "Tic-tacs a cada check; pop na virada."),
    "HookList": ("Quatro objetos do dia a dia caem em cascata (SAÍDA v4: mergulho no ponto do '?' de 'ONDE?' direto para a montagem de vantagens) no tempo de cada palavra (post-it 'ração 2x 180g?', cartela, carteira de vacinação com '?? / ??', post-it 'vet quinta 15h??').",
                 "RAÇÃO, REMÉDIO, VACINA, CONSULTA… (letras caindo) → TÁ TUDO ONDE?", "Câmera na mão; objetos com mola e desfoque direcional.", "Batida de cartão a cada palavra; pop grave na pergunta."),
    "HookDemo": ("Mundo verde com órbitas; o app aparece no frame 1; um toque marca 'Passeio' e o anel vai de 60% para 80%. SAÍDA (v4): mergulho no ponto final terracota de 'ASSIM.' para a montagem (mesma transição nos 4 ganchos).",
                 "a rotina do seu pet, ASSIM.", "Celular em perspectiva 3D com aproximação lenta.", "Toque, check em duas notas, subida do anel."),
    "HookMulti": ("Cão e gato em recorte entram com mola; duas listas de cuidados (Thor e Mia) se embaralham. SAÍDA (v3): mergulho no ponto do '?' de 'PRA TUDO?': o ponto vira um disco terracota que cobre a tela e a montagem abre em íris com borda creme.",
                  "2 PETS. 2 ROTINAS. (letras dispersas) → 1 CABEÇA PRA TUDO? (máscara)", "Listas orbitam e se misturam.", "Pops, embaralhar, pop grave."),
    "HookPill": ("Cartela de comprimidos; os alvéolos piscam entre 'tomado' e 'não tomado'; '?' terracota. SAÍDA (v3): mergulho no ponto do '?' de 'ONTEM?'.",
                 "JÁ DEU O REMÉDIO HOJE? (máquina de escrever) → …OU FOI ONTEM? (entra em 3D)", "Cartela gira na virada.", "Pop grave; flip."),
    "Chaos": ("Fundo escuro. Objetos se acumulam no tempo de cada palavra (post-its, cartela, carteirinha, calendário, conversa de família, nota de pet shop). Em 'cabeça', tudo treme e um '?' terracota aparece; no fim, tudo é sugado para um único ponto de luz.",
              "RAÇÃO, / REMÉDIO, / VACINA, / CONSULTA… (letras caindo, como 'REMÉDIO' na referência) → ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Câmera na mão que aumenta; convergência com aceleração contínua e desfoque.", "Batidas de cartão, papel, riser, sucção."),
    "ChaosShort": ("Continuação do caos: calendário, conversa e nota se somam; tudo converge para o ponto de luz.", "ESPALHADO EM: CALENDÁRIO, MENSAGENS, MEMÓRIA.", "Igual ao caos do master.", "Papel, riser, sucção."),
    "ChaosContrast": ("Flash do 'antes' que converge para o ponto.", "ESPALHADO EM: …", "Igual ao caos.", "Papel, riser, sucção."),
    "Chaos15": ("Em 2,5 s, sete objetos entram de todos os lados e convergem para o ponto de luz.", "OS CUIDADOS DO SEU PET… → TUDO ESPALHADO? (letras dispersas)", "Câmera na mão.", "Batidas, riser, sucção."),
    "Reveal": ("TRANSIÇÃO-ASSINATURA (vinda da referência do cliente): o mesmo ponto creme em que o caos terminou se estica e vira a linha (match cut, v3), vira pata, vira batimento e fecha num anel com o selo do logo DuoPet no instante em que a voz diz 'DuoPet'. O anel abre como íris e revela o mundo verde, onde o celular sobe em perspectiva entre órbitas e partículas, com os cuidados entrando em ordem.",
               "cada cuidado / NO LUGAR CERTO.", "Linha contínua com morph ponto a ponto; selo com mola; íris; celular com mola lenta de baixo para cima.", "Traço desenhando, ticks nas formas, pop + brilho no selo, whoosh na íris. A trilha passa de menor para maior (Cmaj9)."),
    "Reveal15": ("Mesma transição-assinatura, comprimida.", "fica tudo / NUM LUGAR SÓ.", "Idem.", "Idem."),
    "Demo": ("ENTRADA (v3): corte seco no tempo forte com um punch curto (1,035→1); o celular está na mesma pose do fim da revelação, e o título anterior saiu por máscara antes do corte. Mundo verde contínuo (partículas e órbitas não pulam no corte). Tela Hoje do Thor: '3 de 5', anel 60%, 'Próximo: 18:00 · Passeio' destacado. O dedo toca 'Passeio': check, anel em 80%, '4 de 5', próximo 'Escovação 21:00'. Surge a pílula branca 'Passeio concluído · Agora · Thor'. No fim, 'Escovação' pulsa com o selo 'Falta 1 · 21:00'.",
             "01 — ROTINA · VEJA. → MARQUE. → SAIBA O QUE FALTA. (máquina de escrever, como 'CUIDE_' na referência)", "Celular gira levemente em 3D; aproximação de 1,18× antes do toque; recuo antes de 'falta'.", "Digitação, toque, check em duas notas, subida do anel, toast."),
    "Demo15": ("Toque em 'Passeio' → check → anel 80% → selo 'Falta 1'.", "01 — ROTINA · MARQUE. → VEJA O QUE FALTA.", "Idem.", "Idem."),
    "Benefits": ("ENTRADA (v3): o celular começa na pose exata do fim da demonstração (inclinado) e assenta durante o 1º giro. Capítulos como na referência, com giro 'chicote' (3D + desfoque) entre telas reais. 02 SAÚDE: tela de vacinas, e o cartão 'Próximo reforço · V10 · em 12 dias' sai da tela. 03 GASTOS: R$ 186,40 por categoria e por pet. 04 BRINCADEIRAS: 'Caça ao petisco', ícones orbitando o celular, bola quicando e selo 'Brincadeira guiada · 5 min'. Em 'cada pet da casa', a tela se abre na foto de 3 gatos e um pitbull; volta ao Perfil e o seletor troca Thor → Mia.",
                 "02 — SAÚDE · CUIDE. (3D) / 03 — GASTOS · CONTROLE. (cascata) / 04 — BRINCADEIRAS · BRINQUE. (letras dispersas) → CADA PET DA CASA. → CÃO OU GATO. (o terracota passa de CÃO para GATO)", "Chicote de 0,42 s; cartão de vidro em 3D; órbita de ícones; máscara tela → foto.", "Swooshes estéreo, moedas em gastos, apito, toque e pop na troca."),
    "MultiPet": ("ENTRADA (v3): o celular continua na pose e na tela do fim da demonstração e gira para o Perfil. Mundo verde. Perfil do Thor → seletor → Mia; chicote para a rotina da Mia (água, sachê, caixa de areia, brincadeira de caça, arranhador). Cão e gato em recorte nas laterais.",
                 "CÃO OU GATO. (troca de cor) → cada um com / A SUA ROTINA.", "Chicote 3D; recortes com mola.", "Swoosh, toque, pop."),
    "Emotion": ("ENTRADA (v3): a página creme sobe por cima do mundo verde (cantos arredondados que se fecham, sombra), e a cena anterior recua e escurece. Fundo creme, como na referência: 'cada dia MAIS LEVE.' com uma curva ascendente pontilhada que se desenha. Ao longo dela, os cuidados vão sendo marcados (07:00 Ração, 12:00 Passeio, 18:00 Remédio, 21:00 Brincar), com os filhotes no canto. O ponto final da curva abre em círculo a foto do gato com o border collie, com uma luz quente (light leak) passando pela foto.",
                "cada dia / MAIS LEVE. → mais tempo / JUNTOS.", "Curva desenhada com cabeça terracota; chips com mola; íris a partir do ponto final; Ken Burns lento.", "Traço, pops nos chips, whoosh na íris; a trilha abre para piano e pad."),
    "Montage": ("CORPO DO ANÚNCIO (v4): uma vantagem por plano, no ritmo das referências do cliente. Mundo verde com blobs de gradiente; em cada plano, uma palavra gigante atravessa a tela ATRÁS do celular 3D (Nomad), a tela real do app reage à fala e etiquetas de anotação (pílula creme + linha-guia até a tela, nunca com cara de notificação) mostram o dado. Trocas variadas: 'push' com desfoque direcional e rastro de luz, 'slam' (corte seco com soco de escala e flash) e 'rise' (a oferta sobe por baixo). Contador '01 / 11' das vantagens e 'IMAGENS ILUSTRATIVAS' no topo. Detalhe plano a plano na tabela abaixo.",
                "Palavra gigante por plano + título em pílulas no gancho/promessa", "Push 0,16–0,3 s (mais curto nas listas rápidas); slam com flash; rise na oferta; deriva lenta de câmera.", "Swoosh em cada push, impacto + pop grave nos slams, toque/check/anel na rotina, moeda em gastos, apito em brincar, pops nos selos. Trilha: groove com viradas antes dos slams, 'stop-time' na tríade e subida (hats abertos + sino uma oitava acima) na oferta."),
    "Montage15": ("Mesma linguagem da montagem, em 4 planos: gancho 'Tem cão e gato?', rotina (toque + anel), saúde/exames/gastos e oferta do Plus com o selo 'Sem cartão' circulado.", "TEM CÃO E GATO? · MARQUE · SAÚDE · 3 DIAS DE PLUS GRÁTIS.", "Idem.", "Idem."),
    "CTA": ("ENTRADA: o painel terracota sobe por cima da montagem e, no corte, continua subindo e revela o cartão creme. Símbolo com mola e órbita tracejada, 'DuoPet' digitado, título 'Saiba o que seu pet precisa hoje.' (é a fala), rótulo verde de duas linhas '3 dias de Plus grátis / sem cartão · sem cobrança automática' (lê como informação, sem seta e sem cara de botão), 'COMECE EM' + 'duopet.site' grande com brilho e sublinhado, rodapé 'Depois do teste, segue no Grátis (1 pet) · Imagens ilustrativas' e a foto da família de pets subindo. O cartão fica parado ~3 s depois do endereço.",
            "SAIBA O QUE SEU PET PRECISA HOJE. · 3 DIAS DE PLUS GRÁTIS · SEM CARTÃO · SEM COBRANÇA AUTOMÁTICA · duopet.site", "Wipe de cor; molas; digitação do nome; brilho e sublinhado na URL.", "Whoosh na varredura; motivo Sol–Dó–Mi no logo; acorde final na URL."),
    "CTA15": ("Mesmo cartão final, comprimido (a voz diz só o endereço).", "3 DIAS DE PLUS GRÁTIS · SEM CARTÃO · duopet.site", "Idem.", "Idem."),
}

# planos da montagem (v4): texto na tela e o que a imagem prova; só funcionalidades verificadas na auditoria
SHOT = {
    "hook": ("TEM [CÃO] / E [GATO]?", "Produto no quadro 0: celular com a tela Hoje; cão e gato em recorte sobem da base; palavras em pílulas creme."),
    "promessa": ("DuoPet · O QUE CADA UM / PRECISA [HOJE]", "Slam + flash; selo da marca (símbolo + nome) antes de 2 s; zoom no resumo do dia; círculo à mão em HOJE."),
    "contraste": ("GUARDADA.", "Post-it, cartela, receita e carteira de vacina são sugados para dentro do celular; etiqueta 'Documentos · Thor — Receita guardada'."),
    "rotina": ("MARQUE.", "Cursor toca 'Passeio' na fala 'Marcou?': check, anel 60%→80%, 'Próximo' muda; etiquetas 'Anel do dia — 4 de 5 feitos' e 'O que falta — Escovação · 21:00' com linha-guia."),
    "multipet": ("CÃO + GATO.", "Perfil do Thor → seletor → Mia no 'gato'; recortes de cão e gato entram pelas laterais."),
    "pronta": ("PRONTA.", "Rotina sugerida da Mia (gato) entra linha a linha; etiquetas 'Gato · Mia — Rotina sugerida' e 'Cão ou gato — Pronta no cadastro'."),
    "recorrencia": ("REPETE.", "Pílulas 'Todo dia', 'Seg · Qua · Sex', 'A cada 3 dias' (recorrências reais do app)."),
    "saude": ("SAÚDE.", "Tela de vacinas e remédios; ícone 3D de seringa; etiqueta 'Vacina · na tela — Reforço da V10' apontando a linha."),
    "documentos": ("DOCS.", "Pasta 3D com órbita tracejada; cartões 'Receita · PDF', 'Exame de sangue · PDF', 'Carteirinha · Foto' abrem em leque."),
    "gastos": ("GASTOS.", "Tela de gastos com barras crescendo; etiquetas 'Total do mês — R$ 186,40' e 'Por categoria e por pet'."),
    "semana": ("SEMANA.", "Etiquetas '86% concluída', '7 dias seguidos', 'Peso · Thor 32,4 kg ↗' (dados de exemplo)."),
    "brincar": ("BRINCAR.", "Tela Brincar; bola 3D; etiquetas 'Brincadeira guiada — Passo a passo' e 'Sons de brinquedo — Para cão e gato'."),
    "instalar": ("WEB.", "Monitor 3D com órbita; pílulas 'Navegador do celular', 'ou do computador', 'Nada para baixar'."),
    "triade": ("ROTINA. SAÚDE. GASTOS.", "Recapitulação em 3 palavras gigantes, uma por batida, fundo verde → terracota → verde-noite; 'TUDO NUM LUGAR SÓ'."),
    "gratis": ("COMECE / GRÁTIS.", "Slam; presente 3D; pílula 'Plano Grátis · 1 pet — rotina, check-in e saúde na tela'."),
    "plus": ("(OU) TESTE O PLUS · ATÉ 2 PETS / 3 DIAS DE PLUS GRÁTIS.", "Sobe por baixo; selos 'Sem cartão', 'Sem cobrança automática', 'Depois, segue no Grátis' entram quando a voz diz cada um; círculo à mão em 'Sem cartão'."),
}

MOOD = {"tension": "Tensão (Lá menor, pulso de baixo em semicolcheias, tic-tac, batida de coração)", "reveal": "Descoberta (impacto + Cmaj9 abrindo + arpejo de sinos)",
        "groove": "Groove positivo (120 BPM, C–G–Am–F, marimba, palmas; na montagem: viradas, stop-time na tríade e subida na oferta)", "warm": "Abertura emocional (piano + pad, Fmaj7 → G)", "sting": "Assinatura (Sol–Dó–Mi + acorde final)"}

NAMES = {"master": "Comercial principal (montagem de vantagens)", "perf_h1": "Performance — Gancho H1 (dor/lista, controle)", "perf_h2": "Performance — Gancho H2 (demo primeiro)",
         "perf_h3": "Performance — Gancho H3 (multi-pet)", "perf_h4": "Performance — Gancho H4 (momento de dúvida)", "short15": "Anúncio curto (até 15 s)"}


def tc(x):
    return f"{int(x // 60):02d}:{x % 60:05.2f}"


out = ["# DuoPet — Roteiros finais com timecode (Fase 5)", "", f"Gerado a partir de `compositions/src/data/timeline.json` (voz `{TL['voice']}`, {TL['fps']} fps). Os timecodes são os do arquivo renderizado.", ""]
sb = ["# DuoPet — Storyboard (Fase 6)", "", "Quadros-chave renderizados: `storyboard/<versão>.jpg` (um quadro por cena, no meio da fala).", ""]
for name, v in TL["versions"].items():
    out += [f"## {NAMES[name]} — `{name}` · {v['duration']:.2f} s", ""]
    out += ["| Tempo | Cena | Locução | Texto na tela |", "|---|---|---|---|"]
    for s in v["scenes"]:
        if s.get("cues", {}).get("shots"):
            shots = s["cues"]["shots"]
            ends = [x["t0"] for x in shots[1:]] + [s["end"]]
            for sh, e in zip(shots, ends):
                fala = " ".join(w for w, _ in sh["words"])
                out.append(f"| {tc(max(0, sh['t0']))}–{tc(e)} | {s['type']} · {sh['key']} | {fala} | {SHOT[sh['key']][0]} |")
        else:
            out.append(f"| {tc(s['start'])}–{tc(s['end'])} | {s['type']} | {s['caption']} | {VISUAL[s['type']][1]} |")
    out += ["", "**Trilha:** " + " → ".join(f"{MOOD[m['mood']].split(' (')[0]} ({tc(m['start'])})" for m in v["music"]), ""]
    sb += [f"## {NAMES[name]} — `{name}`", "", f"![{name}]({name}.jpg)", ""]
    for i, s in enumerate(v["scenes"], 1):
        d = VISUAL[s["type"]]
        sb += [f"**{i}. {s['type']}** · {tc(s['start'])}–{tc(s['end'])}", f"- Imagem: {d[0]}", f"- Texto: {d[1]}", f"- Movimento: {d[2]}", f"- Som: {d[3]}", f"- Locução: “{s['caption']}”", ""]
        for sh in s.get("cues", {}).get("shots", []):
            sb += [f"  - `{sh['key']}` {tc(max(0, sh['t0']))} — “{' '.join(w for w, _ in sh['words'])}” · Tela: {SHOT[sh['key']][0]} · {SHOT[sh['key']][1]}"]
        if s.get("cues", {}).get("shots"):
            sb += [""]
open(f"{ROOT}/scripts/02-roteiros-finais.md", "w").write("\n".join(out))
os.makedirs(f"{ROOT}/storyboard", exist_ok=True)
open(f"{ROOT}/storyboard/storyboard.md", "w").write("\n".join(sb))
print("ok")
