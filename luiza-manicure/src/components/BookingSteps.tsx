"use client";

import { m } from "motion/react";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

const STEPS = [
  { title: "Escolha seu serviço", text: "Conheça os cuidados disponíveis." },
  { title: "Converse pelo WhatsApp", text: "Entre em contato para consultar valores e disponibilidade." },
  {
    title: "Combine seu horário",
    text: "Escolha uma opção disponível e confirme os detalhes diretamente com a profissional.",
  },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function BookingSteps() {
  return (
    <section id="agendar" aria-labelledby="agendar-title" className="section bg-porcelana">
      <div className="shell">
        <Reveal as="header" className="max-w-3xl">
          <h2 id="agendar-title" className="h2">
            Seu próximo momento de autocuidado está <span className="serif-italic text-rose-ink">a poucos passos.</span>
          </h2>
        </Reveal>

        <m.ol
          className="relative mt-16 grid gap-12 md:mt-24 md:grid-cols-3 md:gap-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -18% 0px" }}
        >
          {/* fio que liga as etapas: o momento da página */}
          <m.span
            aria-hidden="true"
            className="absolute left-[27px] top-2 bottom-2 w-px origin-top bg-rose/60 md:left-7 md:right-0 md:top-7 md:bottom-auto md:h-px md:w-auto md:origin-left"
            variants={{ hidden: { scaleX: 0, scaleY: 0 }, show: { scaleX: 1, scaleY: 1 } }}
            transition={{ duration: 1.6, ease: EASE }}
          />
          {STEPS.map((step, i) => (
            <m.li
              key={step.title}
              className="relative grid grid-cols-[56px_1fr] gap-x-6 md:block"
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.35 }}
            >
              <span className="relative z-[1] inline-flex size-14 items-center justify-center rounded-full border border-rose/60 bg-porcelana font-serif text-[1.35rem] font-semibold tabular-nums text-rose-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="md:mt-9 md:pr-6">
                <h3 className="h3">{step.title}</h3>
                <p className="mt-3 max-w-[32ch] text-cacau-soft">{step.text}</p>
              </div>
            </m.li>
          ))}
        </m.ol>

        <Reveal className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 md:mt-20" delay={0.1}>
          <WhatsAppButton event="steps_whatsapp_click">Quero agendar meu horário</WhatsAppButton>
          <p className="text-[0.88rem] text-cacau-soft">
            O horário fica reservado depois que a Luiza confirmar pela conversa.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
