import Image from "next/image";
import { PHOTOS } from "@/lib/photos";
import { Monogram, Sprig } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** Composição: arco nude com as mãos reais (fundo removido) subindo da base. */
function HeroVisual({ className = "" }: { className?: string }) {
  const photo = PHOTOS.hero;
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* ramos atrás do arco: aparecem só pelas bordas */}
      <Sprig className="arch-in-late pointer-events-none absolute bottom-[2%] left-[1%] h-[48%] w-auto -rotate-[16deg] text-rose sm:left-[4%]" />
      <Sprig className="arch-in-late pointer-events-none absolute right-[1%] top-[14%] h-[34%] w-auto rotate-[168deg] -scale-x-100 text-rose/80 sm:right-[4%]" />
      {/* arco de fundo + contorno fino */}
      <div
        aria-hidden="true"
        className="hero-arch arch-in absolute bottom-0 left-1/2 h-[86%] w-[80%] max-w-[500px] -translate-x-1/2 rounded-t-full"
      />
      <div
        aria-hidden="true"
        className="arch-in-late absolute bottom-0 left-1/2 h-[calc(86%+18px)] w-[calc(80%+36px)] max-w-[536px] -translate-x-1/2 rounded-t-full border border-b-0 border-rose/45"
      />
      <div className="hands-in absolute inset-x-0 bottom-[6%] flex h-[78%] justify-center">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          preload
          fetchPriority="high"
          sizes="(min-width: 1024px) 520px, 72vw"
          className="hero-hands h-full w-auto max-w-none select-none"
          draggable={false}
        />
      </div>
      <p className="caps absolute bottom-5 right-3 z-10 hidden bg-blush/92 px-3.5 py-1.5 text-[0.66rem] text-cacau backdrop-blur-sm sm:block lg:bottom-8 lg:right-0">
        Trabalho real da Luiza
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative bg-blush pt-[var(--header-h)]"
    >
      <div className="shell grid lg:min-h-[calc(min(100svh,940px)-var(--header-h))] lg:grid-cols-12 lg:gap-x-8">
        <div className="relative z-10 pb-10 pt-10 sm:pt-16 lg:col-span-6 lg:self-center lg:py-24">
          <h1 id="hero-title" className="display text-cacau-soft lg:text-[clamp(3.4rem,5vw,4.9rem)]">
            <span className="enter block" style={d(0)}>
              Um toque de cuidado.
            </span>
            <span className="enter serif-italic block text-rose-ink" style={d(1)}>
              Um detalhe de beleza.
            </span>
          </h1>

          <p className="enter caps mt-8 text-cacau" style={d(2)}>
            Manicure <span aria-hidden="true">·</span> Depilação <span aria-hidden="true">·</span>{" "}
            <span className="whitespace-nowrap">Plástica dos pés</span>
          </p>

          <p className="enter lede mt-5 max-w-[27rem]" style={d(3)}>
            Manicure, depilação e cuidados especiais para os pés, com atenção aos detalhes e atendimento a domicílio.
          </p>

          <div className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8" style={d(4)}>
            <WhatsAppButton event="hero_whatsapp_click">Agendar meu horário</WhatsAppButton>
            <a href="#servicos" className="text-link self-center sm:self-auto">
              Conhecer os serviços
            </a>
          </div>

          <p className="enter mt-8 text-[0.95rem] text-cacau-soft" style={d(5)}>
            <strong className="font-medium text-cacau">Atendimento a domicílio.</strong> Consulte valores e
            disponibilidade pelo WhatsApp.
          </p>
        </div>

        <HeroVisual className="-mx-[var(--gutter)] h-[min(116vw,600px)] sm:mx-0 lg:col-span-6 lg:h-auto lg:min-h-[560px]" />
      </div>

      {/* Monograma em cápsula na divisa com a faixa de diferenciais */}
      <a
        href="#servicos"
        aria-label="Ir para os serviços"
        className="monogram-in absolute bottom-0 left-1/2 z-20 hidden -translate-x-1/2 translate-y-1/2 lg:block"
      >
        <Monogram className="h-[108px] w-auto" />
      </a>
    </section>
  );
}
