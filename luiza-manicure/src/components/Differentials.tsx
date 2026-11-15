import { IconHeart, IconHome, IconShield, IconSparkle } from "./icons";
import { Reveal, RevealItem, Stagger } from "./Reveal";

const ITEMS = [
  { Icon: IconSparkle, title: "Qualidade e capricho", text: "Dedicação aos detalhes para valorizar cada resultado." },
  { Icon: IconShield, title: "Higiene e segurança", text: "Compromisso com um atendimento cuidadoso e responsável." },
  {
    Icon: IconHeart,
    title: "Atendimento personalizado",
    text: "Cada cliente recebe atenção às suas preferências e necessidades.",
  },
  { Icon: IconHome, title: "Praticidade", text: "Consulte a possibilidade de atendimento no conforto da sua casa." },
];

export function Differentials() {
  return (
    <section id="diferenciais" aria-labelledby="diferenciais-title" className="section bg-porcelana">
      <div className="shell">
        <Reveal as="header" className="mx-auto max-w-2xl text-center">
          <h2 id="diferenciais-title" className="h2 text-cacau-soft">
            Mais do que beleza, <span className="serif-italic text-rose-ink">cuidado em cada detalhe.</span>
          </h2>
        </Reveal>

        <Stagger as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-5">
          {ITEMS.map(({ Icon, title, text }) => (
            <RevealItem
              as="li"
              key={title}
              className="group flex flex-col items-center rounded-[10px] border border-cacau/10 bg-[#fbf7f3] px-7 py-10 text-center transition-[transform,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[0_24px_40px_-30px_rgb(84_49_36/0.4)]"
            >
              <span className="inline-flex size-14 items-center justify-center rounded-full border border-rose/60 text-rose-ink">
                <Icon size={24} />
              </span>
              <h3 className="mt-7 font-serif text-[1.75rem] leading-[1.08] text-cacau-soft">{title}.</h3>
              <p className="mt-3 text-[0.96rem] leading-relaxed text-cacau-soft">{text}</p>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
