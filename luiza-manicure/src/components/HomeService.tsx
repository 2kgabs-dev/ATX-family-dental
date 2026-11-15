import Image from "next/image";
import { SYMBOL } from "@/lib/brand-paths";
import { PHOTOS } from "@/lib/photos";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

/** Painel com foto grande e texto centralizado por cima (estilo editorial das referências). */
export function HomeService() {
  const photo = PHOTOS.vinho;
  return (
    <section id="domicilio" aria-labelledby="domicilio-title" className="bg-porcelana pb-[clamp(84px,11vw,150px)]">
      <div className="shell">
        <div className="on-dark relative isolate overflow-hidden rounded-[18px] px-6 py-24 text-center text-porcelana sm:px-12 md:py-32">
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="-z-20 object-cover object-[50%_35%]"
          />
          {/* véu cacau para leitura do texto sobre a foto */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(63_36_26/0.7),rgb(63_36_26/0.8))]" />

          <Reveal className="mx-auto max-w-3xl">
            <svg viewBox={SYMBOL.viewBox} aria-hidden="true" className="mx-auto h-12 w-auto">
              <path d={SYMBOL.stem} fill="none" stroke="var(--color-nude)" strokeWidth={1.1} strokeLinecap="round" />
              <path d={SYMBOL.leaves} fill="var(--color-nude)" />
            </svg>
            <h2 id="domicilio-title" className="h2 mt-8 text-porcelana">
              Seu momento de beleza, <span className="serif-italic block text-nude">no conforto da sua casa.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-[32rem] text-[1.08rem] leading-relaxed text-porcelana/90">
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
              <p className="text-[0.9rem] text-porcelana/85">Informe seu bairro para verificar a disponibilidade.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
