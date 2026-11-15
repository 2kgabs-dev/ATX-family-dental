import { MONOGRAM, SYMBOL, TAGLINE, WORDMARK } from "@/lib/brand-paths";

type Tone = "light" | "dark";

/** Símbolo botânico de três folhas (vetor gerado em scripts/build-assets.mjs). */
export function Symbol({
  className,
  leafColor = "var(--color-rose)",
  stemColor,
  title,
}: {
  className?: string;
  leafColor?: string;
  stemColor?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox={SYMBOL.viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={SYMBOL.stem} fill="none" stroke={stemColor ?? leafColor} strokeWidth={1.1} strokeLinecap="round" />
      <path d={SYMBOL.leaves} fill={leafColor} />
    </svg>
  );
}

/** Logotipo horizontal: símbolo + LUIZA + MANICURE & BELEZA. */
export function Logo({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const ink = tone === "light" ? "var(--color-cacau)" : "var(--color-porcelana)";
  const leaf = tone === "light" ? "var(--color-rose)" : "var(--color-nude)";
  const sub = tone === "light" ? "var(--color-rose-ink)" : "var(--color-nude)";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Symbol className="h-[2.35em] w-auto shrink-0" leafColor={leaf} />
      <span className="flex flex-col gap-[0.32em]">
        <svg viewBox={WORDMARK.viewBox} className="h-[1em] w-auto" aria-hidden="true">
          <path transform={`translate(${WORDMARK.tx} ${WORDMARK.ty})`} d={WORDMARK.d} fill={ink} />
        </svg>
        <svg viewBox={TAGLINE.viewBox} className="h-[0.36em] w-auto" aria-hidden="true">
          <path transform={`translate(${TAGLINE.tx} ${TAGLINE.ty})`} d={TAGLINE.d} fill={sub} />
        </svg>
      </span>
      <span className="sr-only">LUIZA Manicure &amp; Beleza</span>
    </span>
  );
}

/** Monograma em cápsula: "L" sobre o ramo (inspirado no arco editorial). */
export function Monogram({ className }: { className?: string }) {
  const m = MONOGRAM;
  return (
    <svg viewBox={m.viewBox} className={className} aria-hidden="true">
      <rect x="0.75" y="0.75" width={m.w - 1.5} height={m.h - 1.5} rx={(m.w - 1.5) / 2} fill="var(--color-porcelana)" stroke="var(--color-rose-ink)" strokeWidth="1" />
      <path transform={`translate(${m.lx} ${m.ly})`} d={m.l} fill="var(--color-rose-ink)" />
      <g transform={`translate(${m.symX} ${m.symY}) scale(${m.symScale})`}>
        <path d={SYMBOL.stem} fill="none" stroke="var(--color-rose)" strokeWidth={1.3} strokeLinecap="round" />
        <path d={SYMBOL.leaves} fill="var(--color-rose)" />
      </g>
    </svg>
  );
}

/** Ramo botânico em traço fino (decorativo), no espírito das referências. */
export function Sprig({ className }: { className?: string }) {
  const leaves: [number, number, number][] = [
    [50, 204, -38], [69, 186, 36], [47, 164, -32], [67, 144, 38], [48, 122, -26],
    [69, 102, 40], [55, 80, -20], [74, 62, 42], [63, 40, -12], [78, 25, 30],
  ];
  return (
    <svg viewBox="0 0 120 240" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round">
      <path d="M60 238C58 182 52 122 72 6" />
      {leaves.map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={4.4} ry={11} transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
    </svg>
  );
}
