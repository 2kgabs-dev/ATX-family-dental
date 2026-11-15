"use client";

import { m } from "motion/react";
import { IconClock, IconHeart, IconHome } from "./icons";
import { SYMBOL } from "@/lib/brand-paths";
import { Reveal, RevealItem, Stagger } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

const HIGHLIGHTS = [
  { Icon: IconHome, title: "Comodidade", text: "O atendimento vai até você." },
  { Icon: IconClock, title: "Praticidade", text: "Mais tempo livre na sua rotina." },
  { Icon: IconHeart, title: "Atendimento personalizado", text: "Atenção às suas preferências." },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Composição: um arco (porta de casa) que se desenha, com o ramo da marca ao centro. */
function ArchComposition() {
  return (
    <svg viewBox="0 0 400 500" className="h-auto w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[420px]" aria-hidden="true">
      <m.path
        d="M40 480 V200 A160 160 0 0 1 360 200 V480"
        fill="none"
        stroke="var(--color-rose)"
        strokeWidth="1.2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 2, ease: EASE }}
      />
      <m.path
        d="M78 480 V212 A122 122 0 0 1 322 212 V480 Z"
        fill="#5f3a2b"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
      <m.g
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
      >
        <g transform="translate(140 196) scale(3)">
          <path d={SYMBOL.stem} fill="none" stroke="var(--color-nude)" strokeWidth="0.7" strokeLinecap="round" />
          <path d={SYMBOL.leaves} fill="var(--color-nude)" />
        </g>
      </m.g>
      <m.path
        d="M8 480 H392"
        stroke="var(--color-rose)"
        strokeWidth="1.2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
      />
    </svg>
  );
}

export function HomeService() {
  return (
    <section id="domicilio" aria-labelledby="domicilio-title" className="on-dark relative overflow-hidden bg-cacau text-porcelana">
      <div className="shell section grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <h2 id="domicilio-title" className="h2 text-porcelana">
              Seu momento de beleza, <span className="serif-italic text-nude">no conforto da sua casa.</span>
            </h2>
            <p className="mt-7 max-w-[34rem] text-[1.08rem] leading-relaxed text-porcelana/80">
              Mais praticidade para sua rotina, com atendimento personalizado e o cuidado que você merece.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-porcelana/12 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ Icon, title, text }) => (
              <RevealItem as="li" key={title} className="bg-cacau p-6 sm:p-7">
                <Icon size={26} className="text-nude" />
                <p className="mt-5 font-semibold text-porcelana">{title}</p>
                <p className="mt-1.5 text-[0.92rem] leading-snug text-porcelana/72">{text}</p>
              </RevealItem>
            ))}
          </Stagger>

          <Reveal className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6" delay={0.1}>
            <WhatsAppButton variant="light" message="domicilio" event="domicilio_whatsapp_click">
              Consultar atendimento a domicílio
            </WhatsAppButton>
            <p className="text-[0.88rem] text-porcelana/72">Informe seu bairro para verificar a disponibilidade.</p>
          </Reveal>
        </div>

        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <ArchComposition />
        </div>
      </div>
    </section>
  );
}
