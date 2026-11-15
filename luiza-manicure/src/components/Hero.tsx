import Image from "next/image";
import { PHOTOS } from "@/lib/photos";
import { Monogram, Sprig } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * Hero no estilo das referências (Maison Nail Atelier / Nail Concept):
 * texto à esquerda e as mãos reais entrando pelo canto inferior direito da tela,
 * sobre o mesmo fundo da página, com luz suave de estúdio.
 */
export function Hero() {
  const photo = PHOTOS.hero;
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate overflow-x-clip bg-blush pt-[var(--header-h)] lg:min-h-[min(100svh,960px)]"
    >
      {/* luz de estúdio atrás das mãos */}
      <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />

      <div className="shell relative z-10 grid lg:min-h-[calc(min(100svh,960px)-var(--header-h))] lg:grid-cols-12">
        <div className="pb-6 pt-10 sm:pt-16 lg:col-span-6 lg:self-center lg:py-24 lg:pr-6">
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
      </div>

      {/* Mãos reais entrando pelo canto inferior direito */}
      <div className="relative h-[min(124vw,560px)] overflow-hidden sm:h-[600px] lg:absolute lg:bottom-0 lg:right-0 lg:top-[var(--header-h)] lg:h-auto lg:w-[50%]">
        <Sprig className="arch-in-late pointer-events-none absolute left-[6%] top-[10%] h-[34%] w-auto -rotate-[24deg] text-rose/70 lg:left-[8%] lg:top-[14%]" />
        <div className="hands-in absolute bottom-0 right-0 h-[96%] lg:h-[94%]">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 560px, 80vw"
            className="h-full w-auto max-w-none select-none"
            draggable={false}
          />
        </div>
        <p className="caps absolute bottom-6 left-[var(--gutter)] z-10 bg-blush/92 px-3.5 py-1.5 text-[0.66rem] text-cacau backdrop-blur-sm lg:bottom-auto lg:left-auto lg:right-[calc(max(0px,(100vw_-_1280px)/2)_+_var(--gutter))] lg:top-6">
          Trabalho real da Luiza
        </p>
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
