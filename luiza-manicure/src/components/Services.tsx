import type { WhatsAppEvent } from "@/lib/analytics";
import type { MessageKey } from "@/lib/whatsapp";
import { IconFoot, IconPetal, IconPolish } from "./icons";
import { Reveal, RevealItem, Stagger } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

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
        <Reveal as="header" className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="servicos-title" className="h2 md:col-span-7">
            Cuidados pensados <span className="serif-italic text-rose-ink">para você.</span>
          </h2>
          <p className="lede md:col-span-5 md:justify-self-end md:text-right">
            Cada detalhe faz parte de um momento dedicado à sua beleza e bem-estar.
          </p>
        </Reveal>

        <Stagger as="ul" className="mt-14 grid border-t border-cacau/12 md:mt-20 md:grid-cols-3">
          {SERVICES.map(({ title, text, cta, message, event, Icon }) => (
            <RevealItem
              as="li"
              key={title}
              className="group relative flex flex-col border-b border-cacau/12 py-10 transition-colors duration-500 md:border-b-0 md:border-l md:px-9 md:py-12 md:first:border-l-0 md:first:pl-0 lg:px-11"
            >
              <span className="mb-8 inline-flex size-[68px] items-center justify-center rounded-full bg-nude/40 text-rose-ink transition-[transform,background-color] duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:bg-nude/70 md:mb-10">
                <Icon size={32} />
              </span>
              <h3 className="h3">{title}</h3>
              <p className="mt-4 max-w-[30ch] text-cacau-soft">{text}</p>
              <div className="mt-auto pt-8">
                <WhatsAppButton variant="link" message={message} event={event}>
                  {cta}
                </WhatsAppButton>
              </div>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
