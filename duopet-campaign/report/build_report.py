"""Gera report/index.html (página do relatório da campanha) a partir dos arquivos reais do projeto."""
import base64, html, json, math, os, subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = f"{ROOT}/report"
TL = json.load(open(f"{ROOT}/compositions/src/data/timeline.json"))
E = html.escape


def img64(path, maxw=None):
    if maxw:
        tmp = f"{OUT}/_tmp.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", f"scale='min({maxw},iw)':-2", "-q:v", "4", tmp])
        path = tmp
    b = base64.b64encode(open(path, "rb").read()).decode()
    return f"data:image/jpeg;base64,{b}"


def qa(name):
    p = f"{ROOT}/qa/report/{name}.json"
    return json.load(open(p)) if os.path.exists(p) else None


def secs(v):
    return math.ceil(TL["versions"][v]["duration"])


# mesmos nomes de compositions/queue.sh (a duração arredondada vem da linha do tempo)
RENDERS = [
    ("master", "Master · montagem de vantagens", f"renders/master/duopet_master_{secs('master')}s"),
    ("perf_h1", "Performance · H1 dor/lista (controle)", f"renders/performance/duopet_perf-h1-dor_{secs('perf_h1')}s"),
    ("perf_h2", "Performance · H2 demo no 1º frame", f"renders/performance/duopet_perf-h2-demo_{secs('perf_h2')}s"),
    ("perf_h3", "Performance · H3 multi-pet", f"renders/performance/duopet_perf-h3-multipet_{secs('perf_h3')}s"),
    ("perf_h4", "Performance · H4 'já deu o remédio?'", f"renders/performance/duopet_perf-h4-remedio_{secs('perf_h4')}s"),
    ("short15", "Curto", f"renders/curto/duopet_curto_{secs('short15')}s"),
]

MATRIX = [
    ("Força do gancho", 8, "v4: produto no quadro 0 (celular com a tela Hoje), chamada direta ao público multi-pet ('Tem cão e gato?') com cão e gato em recorte e o 'check' do app como assinatura sonora. Os ganchos de performance (dor, demo, multi-pet, remédio) mergulham pelo ponto do título direto na montagem. Só o hook rate real valida."),
    ("Identificação com a dor", 6, "No master a dor virou um contraste curto ('Nada de receita perdida': os papéis são sugados para o celular). A dor concreta ficou nos ganchos H1, H3 e H4, que são os que vão a teste."),
    ("Clareza da solução", 9, "A tela real do app aparece em 12 dos 16 planos, com causa e efeito (toque → check → anel → 'o que falta')."),
    ("Benefícios demonstrados", 9, "11 vantagens verificadas na auditoria, uma por plano, com contador '01 / 11': rotina, multi-pet, rotina por espécie, recorrência, saúde, documentos, gastos, semana e peso, brincadeiras e sons, sem instalar."),
    ("Diferenciação", 7, "Cão e gato na mesma conta, rotina pronta por espécie, sem instalar e um plano Grátis de verdade. Ainda falta comparar explicitamente com agenda e app de carteirinha; isso fica para a landing."),
    ("Qualidade do motion design", 8, "Linguagem das 5 referências: palavra gigante atrás do celular 3D, etiquetas de anotação com linha-guia, ícones 3D com órbita, cursor, círculo à mão, tríade final, trocas variadas (push com desfoque e rastro de luz, slam com flash, rise). Limites: 3D em CSS (sem modelo de celular real) e renderização por software."),
    ("Naturalidade da narração", 5, "Ainda é a voz sintética local (inteligível, mas sem interpretação). A troca por voz premium (Higgsfield/ElevenLabs, pt-BR) está pronta para rodar assim que os créditos forem ativados; o pipeline re-sincroniza tudo sozinho."),
    ("Qualidade de áudio", 7, "Trilha original com arranjo guiado pelos planos (viradas antes dos slams, stop-time na tríade, subida na oferta), efeito de UI em cada ação, ducking, −14 LUFS e pico ≤ −1 dBTP."),
    ("Ritmo e retenção", 8, "Um plano a cada 1,3–2,5 s, com micro-movimento contínuo; listas rápidas de 0,6–0,8 s na performance. O master tem 36 s, acima da faixa de 21–34 s recomendada pelo TikTok: use as versões de 27–28 s para aquisição."),
    ("Clareza do CTA", 9, "CTA falado e escrito, igual ao topo da landing ('Saiba o que seu pet precisa hoje') + oferta + 'sem cartão · sem cobrança automática' + URL grande, parado ~3 s. Nenhum botão falso."),
    ("Credibilidade", 8, "Só funções que existem, nenhuma notificação (as etiquetas foram redesenhadas para não parecer push), 'imagens ilustrativas' nos planos com dados de exemplo. Falta o rótulo de IA ao publicar (voz sintética e fotos da marca geradas por IA)."),
    ("Potencial de conversão", 8, "Hipótese, não previsão: produto cedo, vantagens empilhadas e risco zero colado na oferta são as alavancas mais citadas na pesquisa. O resultado real depende da cobrança ativa, da confirmação por e-mail e da UTM no cadastro."),
]


def build():
    h = []
    h.append("""<title>DuoPet · Tudo no seu lugar</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap">
<style>
/* Layout: coluna editorial única (max 920px) com faixas de mídia que vazam até 1200px; tokens da marca DuoPet (CSS de produção). */
:root{
  --bg:#f4f2ee; --surface:#ffffff; --sunken:#ebe8e2; --ink:#141a16; --muted:#5a5f59; --forest:#203b2d; --accent:#a94e33; --accent-bg:#f6e4dd;
  --line:rgba(20,26,22,.12); --good:#2e6a45; --warn:#8a5a00;
  --display:'Geist','Helvetica Neue',Arial,sans-serif; --body:'Geist','Helvetica Neue',Arial,sans-serif; --mono:'Geist Mono',ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#0e1311;--surface:#151c18;--sunken:#1c2520;--ink:#f1efe9;--muted:#a3aaa4;--forest:#9fd0b2;--accent:#e69a7f;--accent-bg:#3a241c;--line:rgba(244,242,238,.14);--good:#8fd0a5;--warn:#e6c07a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0e1311;--surface:#151c18;--sunken:#1c2520;--ink:#f1efe9;--muted:#a3aaa4;--forest:#9fd0b2;--accent:#e69a7f;--accent-bg:#3a241c;--line:rgba(244,242,238,.14);--good:#8fd0a5;--warn:#e6c07a;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.6;padding-inline:20px;padding-block:0 64px}
.wrap{max-width:920px;margin:0 auto}
.wide{max-width:1200px;margin:0 auto}
header{padding-block:56px 28px;border-bottom:1px solid var(--line)}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
h1{font-family:var(--display);font-weight:800;font-size:clamp(40px,7vw,76px);line-height:.95;letter-spacing:-.045em;margin:14px 0 18px;text-transform:uppercase;text-wrap:balance}
h1 .dot{color:var(--accent)}
h2{font-family:var(--display);font-weight:750;font-size:clamp(24px,3.4vw,32px);letter-spacing:-.03em;line-height:1.1;margin:0 0 14px;text-wrap:balance}
h3{font-size:17px;margin:0 0 6px;letter-spacing:-.01em}
p{margin:0 0 12px;max-width:68ch}
section{padding-block:40px;border-bottom:1px solid var(--line);display:grid;gap:14px}
.lead{font-size:19px;color:var(--ink);max-width:62ch}
.summary{display:grid;gap:10px;padding:0;margin:0;list-style:none;counter-reset:s}
.summary li{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:baseline;max-width:74ch}
.summary li::before{counter-increment:s;content:counter(s);font-family:var(--mono);font-size:13px;color:var(--accent)}
.videos{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}
.vid{display:grid;gap:8px;min-width:0}
.vid video{width:100%;aspect-ratio:9/16;background:#000;border-radius:16px;display:block;max-width:100%}
.vid .cap{font-size:14px;color:var(--muted)}
.tbl{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--surface)}
table{border-collapse:collapse;width:100%;font-size:14.5px;min-width:560px}
th,td{text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-family:var(--mono);font-weight:500;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);background:var(--sunken)}
tr:last-child td{border-bottom:0}
td.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.pill{display:inline-block;font-size:12px;font-weight:600;padding:2px 9px;border-radius:20px;background:var(--sunken);color:var(--muted);white-space:nowrap}
.pill.ok{background:color-mix(in srgb,var(--good) 16%,transparent);color:var(--good)}
.pill.warn{background:color-mix(in srgb,var(--warn) 18%,transparent);color:var(--warn)}
.score{display:grid;grid-template-columns:minmax(150px,220px) 1fr 34px;gap:12px;align-items:center}
.bar{height:10px;border-radius:10px;background:var(--sunken);overflow:hidden}
.bar i{display:block;height:100%;background:var(--forest)}
.bar i.low{background:var(--accent)}
.scores{display:grid;gap:14px}
.scores .why{grid-column:1/-1;font-size:14px;color:var(--muted);margin:-6px 0 4px;max-width:80ch}
.board{overflow-x:auto;border-radius:14px;border:1px solid var(--line);background:var(--surface)}
.board img{display:block;max-width:none;height:auto;width:1600px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
.note{border-left:3px solid var(--accent);padding:10px 16px;background:var(--accent-bg);border-radius:0 12px 12px 0;max-width:74ch}
code{font-family:var(--mono);font-size:.88em;background:var(--sunken);padding:1px 6px;border-radius:6px;overflow-wrap:anywhere}
a{color:var(--forest)}
.src{font-size:13px;color:var(--muted)}
@media (prefers-reduced-motion: reduce){*{scroll-behavior:auto}}
</style>
<div class="wrap">
<header>
  <div class="eyebrow">Campanha de aquisição · Brasil · out/2026 · 9:16</div>
  <h1>DuoPet<br>tudo no seu lugar<span class="dot">.</span></h1>
  <p class="lead">Um master com 11 vantagens em motion design, quatro variações de performance com ganchos diferentes e um anúncio curto, todos construídos sobre a interface real do app, com a oferta real no fim (<strong>3 dias de Plus grátis, sem cartão e sem cobrança automática</strong>) e uma promessa que o produto cumpre: <strong>saber o que o seu pet precisa hoje</strong>.</p>
</header>
""")
    # resumo
    h.append("""<section><h2>Resumo</h2><ol class="summary">
<li><span><strong>Público prioritário: tutores com 2+ pets.</strong> São 58% dos tutores (Serasa/Opinion Box, set/2025) e os que precisam pagar, porque o plano Grátis cobre 1 pet.</span></li>
<li><span><strong>Promessa:</strong> "Saiba o que seu pet precisa hoje", a mesma frase do topo da landing, demonstrada na tela (marcar o passeio faz o anel ir de 60% para 80%).</span></li>
<li><span><strong>Oferta no fim:</strong> "Comece grátis com um pet. Ou três dias de Plus: sem cartão, sem cobrança automática." Verificada no site e no código em 12/10/2026.</span></li>
<li><span><strong>Correção de rota:</strong> o vídeo anterior dizia "LEMBRE" com um sino, mas o DuoPet não envia notificação (FAQ oficial). Os novos filmes não prometem lembrete.</span></li>
<li><span><strong>Antes de pôr verba:</strong> confirmar que a cobrança (Asaas) está ativa em produção e salvar a UTM no cadastro. Sem isso, não dá para saber qual criativo gera assinatura.</span></li>
<li><span><strong>Maior melhoria possível:</strong> trocar a voz sintética (já está tudo pronto para gerar a voz premium assim que os créditos do Higgsfield forem ativados) e testar um conceito UGC com tutor real ao lado do motion.</span></li>
</ol></section>
""")
    # vídeos
    h.append('<section class="wide"><div class="wrap"><h2>Assista</h2><p>Prévias em resolução reduzida. Os arquivos finais (1080×1920, H.264, AAC) estão na pasta <code>renders/</code>, com e sem legenda.</p></div><div class="videos">')
    for key, label in [("master", f"Master · {secs('master')} s"), ("perf_h1", f"Performance H1 · {secs('perf_h1')} s"), ("perf_h3", f"Performance H3 multi-pet · {secs('perf_h3')} s"), ("short15", f"Curto · {secs('short15')} s")]:
        h.append(f'<div class="vid"><video controls playsinline preload="metadata" src="{key}.mp4"></video><div class="cap">{E(label)}</div></div>')
    h.append("</div></section>")
    # entregáveis + QA
    rows = []
    for key, label, base in RENDERS:
        for suf in ("legendado", "sem-legenda"):
            q = qa(os.path.basename(base) + "_" + suf)
            if q:
                vs = [s for s in q["probe"]["streams"] if s.get("width")][0]
                dur = float(q["probe"]["format"]["duration"])
                L = q["loudness"]
                ok = not q["black_segments"] and not q["freezes"] and L["true_peak_dbfs"] is not None and L["true_peak_dbfs"] <= -1.0
                rows.append(f'<tr><td>{E(label)}<br><code>{E(os.path.basename(base))}_{suf}.mp4</code></td><td class="num">{dur:.1f} s</td><td class="num">{vs["width"]}×{vs["height"]} · {vs["r_frame_rate"].split("/")[0]} fps</td>'
                            f'<td class="num">{L["integrated_lufs"]:.1f} LUFS<br>{L["true_peak_dbfs"]:.1f} dBTP</td><td class="num">{len(q["black_segments"])} / {len(q["freezes"])}</td><td class="num">{q["asr_mean_wer"]*100:.0f}%</td>'
                            f'<td><span class="pill {"ok" if ok else "warn"}">{"aprovado" if ok else "revisar"}</span></td></tr>')
    h.append("""<section><h2>Entregáveis e QA dos arquivos renderizados</h2>
<p>O QA rodou sobre os MP4 finais, não sobre o projeto. Frames pretos e congelamentos foram detectados pelo ffmpeg; loudness e true peak em EBU R128. A inteligibilidade foi medida pela transcrição automática da mix final, cena a cena (WER = taxa de palavras erradas; a maior parte dos erros está no nome "DuoPet", que o reconhecedor não conhece).</p>
<div class="tbl"><table><thead><tr><th>Arquivo</th><th>Duração</th><th>Formato</th><th>Áudio</th><th>Pretos / congelados</th><th>WER</th><th>Status</th></tr></thead><tbody>""" + "".join(rows) + """</tbody></table></div>
<div class="cols">
<div><h3>Também entregue</h3><p>Locução (falas isoladas, casting com 3 vozes, trilhas de voz por versão), trilha e efeitos por versão (stems), storyboard, roteiros com timecode, 2 modelos de corte com o criador (animatic), projeto-fonte editável em Remotion e o plano de testes.</p></div>
<div><h3>Não entregue (e por quê)</h3><p>Locução humana e gravação do Japa Dorama: não havia gravações autorizadas. Filmagem real de tutor com pet: não havia material; a cena usa a fotografia oficial da marca, gerada por IA.</p></div>
</div></section>""")
    # decisões
    h.append("""<section><h2>O que mudou na v4 (e por quê)</h2>
<p>Pedido: mais vantagens, foco em venda e motion design profissional no estilo das 5 referências. A pesquisa de conversão (fontes em <code>research/03-referencias.md</code>, seção 6) mudou a estrutura: <strong>produto no quadro 0 → promessa com a marca → vantagens empilhadas → oferta com risco zero → cartão final</strong>.</p>
<div class="tbl"><table><thead><tr><th>Alavanca (evidência)</th><th>Como entrou no filme</th></tr></thead><tbody>
<tr><td>Produto e mensagem nos 3 primeiros segundos (TikTok)</td><td>Quadro 0 já tem o celular com a tela Hoje, cão e gato e "TEM CÃO E GATO?"</td></tr>
<tr><td>Marca + mensagem até 5 s: 1,7× (Meta × Toluna, correlacional)</td><td>Selo DuoPet em ~1,3 s junto com "O QUE CADA UM PRECISA HOJE"</td></tr>
<tr><td>Produto mais de uma vez: 2,7×; vantagens com texto: 5,3× (Meta × Toluna)</td><td>11 vantagens, uma por plano, sobre a UI real, com contador "01 / 11"</td></tr>
<tr><td>Risco zero colado na oferta (VWO; Procon/Reclame Aqui sobre renovação automática)</td><td>"3 DIAS DE PLUS GRÁTIS" + selos "Sem cartão" (circulado), "Sem cobrança automática", "Depois, segue no Grátis", no tempo da fala</td></tr>
<tr><td>Preço zero (Shampanier, Mazar e Ariely, 2007)</td><td>Plano "GRÁTIS." · "Plano Grátis · 1 pet" (verdadeiro)</td></tr>
<tr><td>CTA falado e escrito: 1,9× (Meta × Toluna); proibido imitar botão/notificação (Meta)</td><td>Fala igual ao topo da landing; oferta em rótulo de duas linhas; etiquetas de dado com linha-guia até a tela, sem cara de push</td></tr>
</tbody></table></div>
<p class="src">Linguagem visual das referências do cliente (Mercury, Zei, Temvo, Nomad e 4.roues): palavra gigante atrás do objeto, pílulas de vidro, ícones 3D com órbita tracejada, cursor clicando, círculo à mão, rastro de luz nas trocas e recapitulação em três palavras.</p>
</section>""")
    # storyboard
    sb = f"{ROOT}/storyboard/master.jpg"
    if os.path.exists(sb):
        h.append(f'<section class="wide"><div class="wrap"><h2>Storyboard · master</h2><p>Um quadro por plano da montagem (e dois por cena nas demais), extraídos do arquivo final. Role para o lado. Os storyboards das outras versões estão em <code>storyboard/</code>.</p></div><div class="board"><img alt="Storyboard do master com quadros-chave de cada cena" src="{img64(sb, 2000)}"></div></section>')
    # ganchos
    h.append("""<section><h2>Ganchos em teste</h2><p>Doze ganchos foram pontuados (interrupção, relevância, clareza sem som, veracidade, produto cedo). Os quatro escolhidos testam hipóteses diferentes, não só frases diferentes.</p>
<div class="tbl"><table><thead><tr><th>Versão</th><th>Primeiros 3 s</th><th>Hipótese</th></tr></thead><tbody>
<tr><td>H1 · controle</td><td>"Ração, remédio, vacina, consulta… tá tudo onde?"</td><td>Dor reconhecível com uma lista concreta retém melhor</td></tr>
<tr><td>H2</td><td>App no frame 1; o dedo marca "Passeio"</td><td>Mostrar o produto logo de cara traz clique mais qualificado</td></tr>
<tr><td>H3</td><td>"Dois pets, duas rotinas… e quem guarda tudo é a sua cabeça?"</td><td>Falar com quem tem 2+ pets melhora a relação cadastro → assinatura</td></tr>
<tr><td>H4</td><td>"Já deu o remédio hoje… ou foi ontem?"</td><td>Um momento específico supera a dor genérica</td></tr>
</tbody></table></div></section>""")
    # matriz
    sc = []
    for name, n, why in MATRIX:
        sc.append(f'<div class="score"><strong>{E(name)}</strong><div class="bar" role="img" aria-label="{n} de 10"><i class="{"low" if n <= 5 else ""}" style="width:{n*10}%"></i></div><span class="num" style="font-variant-numeric:tabular-nums;text-align:right">{n}</span><p class="why">{E(why)}</p></div>')
    avg = sum(n for _, n, _ in MATRIX) / len(MATRIX)
    h.append(f"""<section><h2>Avaliação 0–10</h2><p>Notas com critério observável, sem prever sucesso. Média {avg:.1f}. Depois da veiculação, troque as hipóteses pelos dados reais.</p><div class="scores">{''.join(sc)}</div></section>""")
    # testes + funil
    h.append("""<section><h2>Testes e medição</h2>
<div class="tbl"><table><thead><tr><th>Teste</th><th>Compara</th><th>Decide por</th></tr></thead><tbody>
<tr><td>A · Dor × demo</td><td>H1 × H2</td><td>Custo por cadastro e % com 1º check no dia 0</td></tr>
<tr><td>B · Profundidade (conceito)</td><td>Master 36 s × H2 27 s</td><td>% de assinatura em 7 dias e custo por cadastro</td></tr>
<tr><td>C · Locução × criador</td><td>H1 × corte A do Japa Dorama</td><td>Custo por cadastro e e-mail confirmado</td></tr>
<tr><td>D · Curto × longo</td><td>Curto 11 s × H1</td><td>Custo por cadastro <em>e</em> % de assinatura em 7 dias</td></tr>
<tr><td>E · Multi-pet</td><td>H3 no público multi-pet × H1 amplo</td><td>CAC</td></tr>
</tbody></table></div>
<p>Evento de otimização da fase 1: <strong>cadastro</strong> (não visualização). Regra de corte: ≥ 50 cadastros por braço ou 2× o custo-alvo gasto sem cadastro. Exemplo de UTM: <code>https://duopet.site/?utm_source=meta&amp;utm_medium=paid_social&amp;utm_campaign=dp_cadastro_202610&amp;utm_content=prf28_h3_multi&amp;utm_term=multipet</code></p>
</section>
<section><h2>Funil: o que resolver primeiro</h2>
<div class="tbl"><table><thead><tr><th>Ponto</th><th>Por que importa</th><th>Recomendação</th></tr></thead><tbody>
<tr><td>Cobrança em produção</td><td>Relatório interno de 05/10 diz "vermelho para vendas sem homologação"</td><td>Confirmar um Pix real em <code>/app/assinatura</code> antes de escalar</td></tr>
<tr><td>UTM no cadastro</td><td>Sem isso não há CAC por criativo</td><td>Gravar <code>utm_*</code>, <code>fbclid</code> e <code>ttclid</code> no perfil</td></tr>
<tr><td>Confirmação de e-mail antes do uso</td><td>Quem vem do Instagram sai para o e-mail e não volta</td><td>Medir; se a perda for alta, deixar entrar e confirmar depois, ou login com Google</td></tr>
<tr><td>Multi-pet fora do hero</td><td>O público que mais assina não se vê no topo</td><td>Variação de landing para <code>utm_term=multipet</code> com o Plus em destaque</td></tr>
<tr><td>"Rotina compartilhada" listada como recurso</td><td>No Premium está "em breve"</td><td>Marcar "em breve" também ali</td></tr>
</tbody></table></div></section>""")
    # pesquisa
    h.append("""<section><h2>Base de pesquisa</h2>
<div class="cols">
<div><h3>58% têm mais de um pet</h3><p>70% veem o pet como da família; 56% gastam até R$ 300/mês; 40% dividem as despesas.</p><p class="src">Serasa + Opinion Box, 1.618 entrevistas, 27/08–08/09/2025. <a href="https://www.serasa.com.br/imprensa/os-beneficios-emocionais-de-ter-um-pet/" target="_blank" rel="noopener">serasa.com.br</a></p></div>
<div><h3>164,6 mi de pets</h3><p>63,7 mi de cães e 32,2 mi de gatos; os gatos crescem mais rápido (+4,5%).</p><p class="src">Censo Pet IPB 2024, via <a href="https://www.petfoodforumbrasil.com/ultimas-noticias/article/15750669/censo-pet-brasil-ultrapassa-164-milhes-com-destaque-para-gatos-e-pequenos-animais" target="_blank" rel="noopener">Pet Food Forum Brasil</a> (fonte secundária)</p></div>
<div><h3>Concorrentes vendem lembrete</h3><p>Guiavet, Flockr e DailyPet prometem alerta. O DuoPet não envia push, então disputa outro território: a rotina do dia, cão e gato juntos, tudo num lugar.</p><p class="src">Panorama Pet Vet, Canaltech, App Store</p></div>
<div><h3>Testes curtos convertem menos</h3><p>Em apps de assinatura, testes de ≤ 4 dias têm conversão mediana menor que os longos. É um motivo para testar 7 dias de Plus.</p><p class="src"><a href="https://www.revenuecat.com/blog/growth/free-trial-length" target="_blank" rel="noopener">RevenueCat</a> (apps mobile; referência indireta)</p></div>
</div></section>""")
    h.append("""<section><h2>O que preciso de você</h2><ol class="summary">
<li><span>Ativar os créditos do Higgsfield (teste grátis ou plano) para eu gerar a voz feminina premium em pt-BR; o custo medido é de 1,5 crédito para a fala do master.</span></li>
<li><span>Confirmar se a assinatura (Asaas) está ativa em produção.</span></li>
<li><span>Link do perfil do Japa Dorama e, se houver, as gravações autorizadas.</span></li>
<li><span>Se quiser voz humana: o locutor grava as falas do roteiro em <code>voice/README.md</code> e eu remonto tudo.</span></li>
<li><span>Onde guardar o projeto: ele está numa sessão temporária na nuvem e precisa ir para um repositório para não se perder.</span></li>
</ol></section></div>""")
    open(f"{OUT}/index.html", "w").write("\n".join(h))
    if os.path.exists(f"{OUT}/_tmp.jpg"):
        os.remove(f"{OUT}/_tmp.jpg")
    print("ok", os.path.getsize(f"{OUT}/index.html") // 1024, "KB")


if __name__ == "__main__":
    build()
