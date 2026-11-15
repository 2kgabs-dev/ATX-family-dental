import { SYMBOL, TAGLINE, WORDMARK } from "@/lib/brand-paths";

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
