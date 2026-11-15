import type { WhatsAppEvent } from "@/lib/analytics";
import type { MessageKey } from "@/lib/whatsapp";
import { IconArrow, IconFoot, IconPetal, IconPolish } from "./icons";
import { Reveal, RevealItem, Stagger } from "./Reveal";
import { WhatsAppLink } from "./WhatsAppButton";

const SERVICES: {
  title: string;
  text: string;
  cta: string;
  message: MessageKey;
  event: WhatsAppEvent;
  Icon: typeof IconPolish;
}[] = [
  {
    title: "Manicure",
    text: "Unhas bem cuidadas, com acabamento caprichado e atenção aos detalhes.",
    cta: "Agendar manicure",
    message: "manicure",
    event: "manicure_whatsapp_click",
    Icon: IconPolish,
  },
  {
    title: "Depilação",
    text: "Um atendimento cuidadoso, pensado para proporcionar conforto e bem-estar.",
    cta: "Consultar depilação",
    message: "depilacao",
    event: "depilacao_whatsapp_click",
    Icon: IconPetal,
  },
  {
    title: "Plástica dos pés",
    text: "Um cuidado especial para renovar a sensação de maciez e conforto dos seus pés.",
    cta: "Agendar cuidado dos pés",
    message: "pes",
    event: "pes_whatsapp_click",
    Icon: IconFoot,
  },
];

export function Services() {
  return (
    <section id="servicos" aria-labelledby="servicos-title" className="section bg-porcelana">
      <div className="shell">
        <Reveal as="header" className="mx-auto max-w-2xl text-center">
          <h2 id="servicos-title" className="h2 text-cacau-soft">
            Cuidados pensados <span className="serif-italic text-rose-ink">para você.</span>
          </h2>
          <p className="lede mx-auto mt-6">Cada detalhe faz parte de um momento dedicado à sua beleza e bem-estar.</p>
        </Reveal>

        <Stagger as="ul" className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
          {SERVICES.map(({ title, text, cta, message, event, Icon }) => (
            <RevealItem as="li" key={title}>
              <WhatsAppLink
                message={message}
                event={event}
                className="group flex h-full flex-col items-center rounded-[10px] bg-tile px-8 pb-10 pt-12 text-center transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:bg-[#ead9ce] hover:shadow-[0_24px_40px_-30px_rgb(84_49_36/0.45)] md:px-10 md:pt-14"
              >
                <span className="inline-flex size-16 items-center justify-center rounded-full border border-rose/60 text-rose-ink transition-colors duration-500 group-hover:bg-porcelana/70">
                  <Icon size={28} />
                </span>
                <h3 className="h3 mt-8 text-cacau-soft">{title}.</h3>
                <p className="mt-4 max-w-[26ch] text-[0.98rem] leading-relaxed text-cacau-soft">{text}</p>
                <span className="text-link mt-auto pt-8">
                  {cta}
                  <IconArrow size={17} className="text-link-arrow" />
                </span>
              </WhatsAppLink>
            </RevealItem>
          ))}
        </Stagger>
        <p className="mt-8 text-center text-[0.9rem] text-cacau-soft">
          Consulte valores e disponibilidade pelo WhatsApp.
        </p>
      </div>
    </section>
  );
}
