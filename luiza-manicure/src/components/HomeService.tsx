"use client";

import { m } from "motion/react";
import { SYMBOL } from "@/lib/brand-paths";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Painel grande com texto centralizado (estilo editorial), arcos finos ao fundo. */
export function HomeService() {
  return (
    <section id="domicilio" aria-labelledby="domicilio-title" className="bg-porcelana pb-[clamp(84px,11vw,150px)]">
      <div className="shell">
        <div className="on-dark relative isolate overflow-hidden rounded-[18px] bg-taupe px-6 py-20 text-center text-porcelana sm:px-12 md:py-28">
          {/* arcos de porta, desenhados ao entrar na tela */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMax meet"
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 mx-auto h-[92%] w-full max-w-[720px] opacity-60"
          >
            {[0, 1, 2].map((i) => (
              <m.path
                key={i}
                d={`M${80 - i * 34} 300 V${150 + i * 6} A${120 + i * 34} ${120 + i * 34} 0 0 1 ${320 + i * 34} ${150 + i * 6} V300`}
                fill="none"
                stroke="var(--color-nude)"
                strokeOpacity={0.5 - i * 0.14}
                strokeWidth="0.8"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 2.2, ease: EASE, delay: i * 0.2 }}
              />
            ))}
          </svg>

          <Reveal className="mx-auto max-w-3xl">
            <svg viewBox={SYMBOL.viewBox} aria-hidden="true" className="mx-auto h-12 w-auto">
              <path d={SYMBOL.stem} fill="none" stroke="var(--color-nude)" strokeWidth={1.1} strokeLinecap="round" />
              <path d={SYMBOL.leaves} fill="var(--color-nude)" />
            </svg>
            <h2 id="domicilio-title" className="h2 mt-8 text-porcelana">
              Seu momento de beleza, <span className="serif-italic block text-nude">no conforto da sua casa.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-[32rem] text-[1.08rem] leading-relaxed text-porcelana/85">
              Mais praticidade para sua rotina, com atendimento personalizado e o cuidado que você merece.
            </p>
            <p className="caps mt-9 text-nude">
              Comodidade <span aria-hidden="true">·</span> Praticidade <span aria-hidden="true">·</span>{" "}
              <span className="whitespace-nowrap">Atendimento personalizado</span>
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <WhatsAppButton variant="light" message="domicilio" event="domicilio_whatsapp_click">
                Consultar atendimento a domicílio
              </WhatsAppButton>
              <p className="text-[0.9rem] text-porcelana/80">Informe seu bairro para verificar a disponibilidade.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
