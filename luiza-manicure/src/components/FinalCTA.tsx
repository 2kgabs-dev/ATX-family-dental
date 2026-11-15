import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { Symbol } from "./Logo";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

export function FinalCTA() {
  return (
    <section id="contato" aria-labelledby="contato-title" className="relative overflow-hidden bg-nude">
      <Symbol
        className="pointer-events-none absolute -bottom-6 -right-10 h-[78%] w-auto opacity-[0.13] md:right-[6%] md:h-[92%]"
        leafColor="var(--color-cacau)"
      />
      <div className="shell section relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="contato-title" className="display text-cacau">
            Sua beleza merece <span className="serif-italic block">esse cuidado.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-[1.1rem] leading-relaxed text-cacau">
            Entre em contato e reserve um momento especial para você.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <WhatsAppButton event="final_whatsapp_click" className="min-h-[58px] px-9 text-[1rem]">
              Agendar pelo WhatsApp
            </WhatsAppButton>
            <p className="text-[0.95rem] text-cacau">
              WhatsApp <span className="font-semibold tabular-nums">{WHATSAPP_DISPLAY}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
