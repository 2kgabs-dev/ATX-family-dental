"use client";

import { AnimatePresence, m } from "motion/react";
import { useId, useState } from "react";
import { IconPlus } from "./icons";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

const QA = [
  {
    q: "Quais serviços estão disponíveis?",
    a: "Manicure, depilação e plástica dos pés. Para saber os detalhes de cada serviço, fale com a Luiza pelo WhatsApp.",
  },
  {
    q: "A LUIZA atende a domicílio?",
    a: "Sim, a Luiza oferece atendimento a domicílio. Envie seu bairro pelo WhatsApp para consultar a disponibilidade no seu endereço.",
  },
  {
    q: "Como consultar os valores?",
    a: "Os valores são informados diretamente pelo WhatsApp, de acordo com o serviço que você escolher.",
  },
  {
    q: "Como agendar um horário?",
    a: "Envie uma mensagem pelo WhatsApp com o serviço desejado. A Luiza responde com as opções disponíveis e vocês combinam os detalhes. O horário fica reservado após a confirmação dela.",
  },
  {
    q: "Quais regiões são atendidas?",
    a: "As regiões de atendimento são confirmadas pelo WhatsApp. Informe seu bairro na mensagem para verificar a disponibilidade.",
  },
  {
    q: "Como consultar os horários disponíveis?",
    a: "Pelo WhatsApp: a agenda é combinada diretamente com a profissional.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="duvidas" aria-labelledby="faq-title" className="section bg-porcelana">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <h2 id="faq-title" className="h2 text-cacau-soft">
            Perguntas <span className="serif-italic text-rose-ink">frequentes.</span>
          </h2>
          <p className="lede mt-6">Não encontrou sua dúvida? A Luiza responde pelo WhatsApp.</p>
          <div className="mt-8">
            <WhatsAppButton variant="link" event="faq_whatsapp_click">
              Tirar uma dúvida
            </WhatsAppButton>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.08}>
          <ul className="border-t border-cacau/15">
            {QA.map((item, i) => {
              const isOpen = open === i;
              const btnId = `${base}-q${i}`;
              const panelId = `${base}-a${i}`;
              return (
                <li key={item.q} className="border-b border-cacau/15">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex min-h-[72px] w-full items-center justify-between gap-6 py-5 text-left font-serif text-[1.55rem] leading-snug text-cacau-soft md:text-[1.8rem]"
                    >
                      {item.q}
                      <span
                        aria-hidden="true"
                        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-cacau/20 transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-out)] group-hover:border-cacau/45 ${
                          isOpen ? "rotate-45 bg-nude/60" : ""
                        }`}
                      >
                        <IconPlus size={18} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[60ch] pb-7 pr-14 text-cacau-soft">{item.a}</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
