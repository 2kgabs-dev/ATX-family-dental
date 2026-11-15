import { IconHeart, IconHome, IconShield, IconSparkle } from "./icons";

const ITEMS = [
  { Icon: IconSparkle, label: ["Qualidade", "e capricho"] },
  { Icon: IconShield, label: ["Higiene", "e segurança"] },
  { Icon: IconHeart, label: ["Atendimento", "personalizado"] },
  { Icon: IconHome, label: ["Atendimento", "a domicílio"] },
];

/** Faixa de diferenciais logo abaixo da Hero (ícone em círculo + rótulo em caixa-alta). */
export function TrustBar() {
  return (
    <section aria-label="Diferenciais em destaque" className="bg-band">
      <ul className="shell grid grid-cols-2 gap-x-4 gap-y-8 py-10 lg:grid-cols-4 lg:py-12">
        {ITEMS.map(({ Icon, label }, i) => (
          <li
            key={label.join(" ")}
            className={`flex flex-col items-center gap-3 text-center lg:flex-row lg:justify-center lg:gap-4 lg:px-6 lg:text-left ${i > 0 ? "lg:border-l lg:border-cacau/15" : ""}`}
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-rose/70 text-rose-ink">
              <Icon size={22} />
            </span>
            <span className="caps text-[0.68rem] leading-[1.55] tracking-[0.18em] text-cacau">
              {label[0]}
              <br />
              {label[1]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
