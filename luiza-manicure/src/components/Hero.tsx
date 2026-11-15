import Image from "next/image";
import { PHOTOS } from "@/lib/photos";
import { IconHome } from "./icons";
import { Symbol } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

export function Hero() {
  const photo = PHOTOS.vinho;
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative pt-[calc(var(--header-h)+28px)] md:pt-[calc(var(--header-h)+40px)]">
      <div className="shell grid items-center gap-x-10 gap-y-12 pb-16 md:pb-24 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:pb-20">
        {/* Texto */}
        <div className="relative z-10 lg:col-span-7 lg:pr-6">
          <h1 id="hero-title" className="display text-cacau lg:text-[clamp(3.6rem,5.1vw,4.7rem)]">
            <span className="enter block" style={{ "--i": 1 } as React.CSSProperties}>
              Um toque de cuidado.
            </span>
            <span className="enter serif-italic block text-rose-ink" style={{ "--i": 2 } as React.CSSProperties}>
              Um detalhe de beleza.
            </span>
          </h1>
          <p className="enter lede mt-7" style={{ "--i": 3 } as React.CSSProperties}>
            Manicure, depilação e cuidados especiais para os pés, com atenção aos detalhes e atendimento a domicílio.
          </p>
          <div className="enter mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ "--i": 4 } as React.CSSProperties}>
            <WhatsAppButton event="hero_whatsapp_click" className="sm:px-7">
              Agendar meu horário
            </WhatsAppButton>
            <a href="#servicos" className="btn btn-secondary">
              Conhecer os serviços
            </a>
          </div>
          <p className="enter mt-7 flex items-start gap-2.5 text-[0.88rem] text-cacau-soft" style={{ "--i": 5 } as React.CSSProperties}>
            <IconHome size={18} className="mt-[2px] shrink-0 text-rose-ink" />
            <span>
              <strong className="font-semibold text-cacau">Atendimento a domicílio.</strong> Consulte valores e disponibilidade pelo WhatsApp.
            </span>
          </p>
        </div>

        {/* Fotografia real em moldura de arco */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] lg:ml-auto lg:mr-0 lg:max-h-[min(78svh,700px)] lg:w-auto">
            {/* contorno do arco */}
            <div
              aria-hidden="true"
              className="arch-outline pointer-events-none absolute -inset-3 rounded-t-full rounded-b-[38px] border border-rose/70 md:-inset-4"
            />
            <div className="unveil relative z-[1] h-full w-full overflow-hidden rounded-t-full rounded-b-[28px] bg-porcelana-deep">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                preload
                fetchPriority="high"
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 520px, 92vw"
                className="h-full w-full object-cover object-[50%_40%]"
              />
            </div>
            {/* ramo botânico discreto */}
            <div className="absolute -bottom-7 left-3 z-[2] w-[84px] md:-left-10 md:w-[112px]" aria-hidden="true">
              <div className="leaf-in rounded-full bg-porcelana p-5 shadow-[0_18px_40px_-24px_rgb(84_49_36/0.55)] md:p-6" style={{ "--i": 2 } as React.CSSProperties}>
                <Symbol className="mx-auto h-full w-auto" />
              </div>
            </div>
            <p className="absolute bottom-5 right-5 z-[2] rounded-full bg-porcelana/92 px-3.5 py-1.5 text-[0.75rem] font-semibold text-cacau backdrop-blur-sm">
              Trabalho real da Luiza
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
