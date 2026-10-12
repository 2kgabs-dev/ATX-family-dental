#!/usr/bin/env bash
# Fila de renderização: vídeo (Remotion, sem áudio) -> mux com a mix final (AAC 256k) -> renders/<pasta>/<nome>.mp4
set -u
cd "$(dirname "$0")"
ROOT=..
mkdir -p $ROOT/renders/_silent $ROOT/renders/master $ROOT/renders/performance $ROOT/renders/curto
declare -A NAME=( [master]="master/duopet_master" [perf_h1]="performance/duopet_perf-h1-dor" [perf_h2]="performance/duopet_perf-h2-demo" \
  [perf_h3]="performance/duopet_perf-h3-multipet" [perf_h4]="performance/duopet_perf-h4-remedio" [short15]="curto/duopet_curto" )
# duração arredondada (s) vem da linha do tempo, para o nome do arquivo acompanhar a locução
dur() { python3 -c "import json,math;print(math.ceil(json.load(open('src/data/timeline.json'))['versions']['$1']['duration']))"; }
VERSIONS=${VERSIONS:-"master perf_h1 perf_h2 perf_h3 perf_h4 short15"}
CAPS=${CAPS:-"leg sem"}
for v in $VERSIONS; do
  for c in $CAPS; do
    id="${v/_/-}-$c"
    sil="$ROOT/renders/_silent/$id.mp4"
    suffix=$([ "$c" = "leg" ] && echo "legendado" || echo "sem-legenda")
    out="$ROOT/renders/${NAME[$v]}_$(dur $v)s_${suffix}.mp4"
    echo "== $id $(date +%T)"
    CONC=${CONC:-4} node render.mjs video "$id" "$sil" 2>&1 | grep -v -E "emory|docker|lower amount" | tail -1
    ffmpeg -v error -y -i "$sil" -i "$ROOT/renders/audio/$v.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$out" && echo "OK $out"
  done
done
echo "FIM-PRINCIPAL $(date +%T)"
# modelos com o criador (animatic, sem áudio final)
if [ "${CREATOR:-1}" = "1" ]; then
  mkdir -p $ROOT/renders/criador
  for id in criador-a criador-b; do
    echo "== $id $(date +%T)"
    CONC=${CONC:-4} node render.mjs video "$id" "$ROOT/renders/criador/duopet_${id}_animatic.mp4" 2>&1 | grep -v -E "emory|docker|lower amount" | tail -1 && echo "OK $ROOT/renders/criador/duopet_${id}_animatic.mp4"
  done
  echo "FIM-CRIADOR $(date +%T)"
fi
