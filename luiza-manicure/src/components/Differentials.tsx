import { IconHeart, IconHome, IconShield, IconSparkle } from "./icons";
import { Symbol } from "./Logo";
import { Reveal, RevealItem, Stagger } from "./Reveal";

const ITEMS = [
  { Icon: IconSparkle, title: "Qualidade e capricho", text: "Dedicação aos detalhes para valorizar cada resultado." },
  { Icon: IconShield, title: "Higiene e segurança", text: "Compromisso com um atendimento cuidadoso e responsável." },
  { Icon: IconHeart, title: "Atendimento personalizado", text: "Cada cliente recebe atenção às suas preferências e necessidades." },
  { Icon: IconHome, title: "Praticidade", text: "Consulte a possibilidade de atendimento no conforto da sua casa." },
];

export function Differentials() {
  return (
    <section id="diferenciais" aria-labelledby="diferenciais-title" className="section bg-porcelana-deep">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5 lg:sticky lg:top-[calc(var(--header-h)+48px)] lg:self-start">
          <h2 id="diferenciais-title" className="h2">
            Mais do que beleza, <span className="serif-italic text-rose-ink">cuidado em cada detalhe.</span>
          </h2>
          <figure className="mt-12 hidden items-center gap-5 lg:flex">
            <Symbol className="h-16 w-auto shrink-0" />
            <blockquote className="serif-italic text-[1.6rem] leading-tight text-cacau-soft">
              A beleza está nos detalhes.
            </blockquote>
          </figure>
        </Reveal>

        <Stagger as="ul" className="grid gap-px overflow-hidden rounded-[28px] bg-cacau/10 sm:grid-cols-2 lg:col-span-7">
          {ITEMS.map(({ Icon, title, text }) => (
            <RevealItem as="li" key={title} className="group bg-porcelana-deep p-8 transition-colors duration-500 hover:bg-porcelana md:p-10">
              <Icon size={30} className="text-oliva-ink transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
              <h3 className="mt-8 font-serif text-[1.65rem] font-semibold leading-tight">{title}</h3>
              <p className="mt-3 text-cacau-soft">{text}</p>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
