import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { Monogram } from "./Logo";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

export function FinalCTA() {
  return (
    <section id="contato" aria-labelledby="contato-title" className="relative overflow-hidden bg-blush">
      <div className="shell section relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Monogram className="mx-auto h-24 w-auto" />
          <h2 id="contato-title" className="display mt-10 text-cacau-soft">
            Sua beleza merece <span className="serif-italic block text-rose-ink">esse cuidado.</span>
          </h2>
          <p className="lede mx-auto mt-7 max-w-md">Entre em contato e reserve um momento especial para você.</p>
          <div className="mt-10 flex flex-col items-center gap-6">
            <WhatsAppButton event="final_whatsapp_click">Agendar pelo WhatsApp</WhatsAppButton>
            <p className="caps text-cacau">
              WhatsApp <span className="tabular-nums tracking-[0.14em]">{WHATSAPP_DISPLAY}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
