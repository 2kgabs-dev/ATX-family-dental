import Image from "next/image";
import { PHOTOS } from "@/lib/photos";
import { IconHome } from "./icons";
import { Monogram } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * Hero editorial: título serifado grande à esquerda, fotografia real sangrando
 * pela borda direita e monograma em arco na divisa com a próxima seção.
 */
export function Hero() {
  const photo = PHOTOS.vinho;
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="hero-ground relative isolate flex flex-col pt-[var(--header-h)] lg:block lg:min-h-[min(100svh,960px)]"
    >
      <div className="shell relative z-10 grid lg:min-h-[calc(min(100svh,960px)-var(--header-h))] lg:grid-cols-12 lg:items-center">
        <div className="pb-12 pt-8 sm:pt-14 lg:col-span-7 lg:py-24 lg:pr-10">
          <h1 id="hero-title" className="display hero-title text-cacau-soft">
            <span className="enter block" style={d(0)}>
              Um toque de cuidado.
            </span>
            <span className="enter serif-italic block text-rose-ink" style={d(1)}>
              Um detalhe de beleza.
            </span>
          </h1>

          <p
            className="enter mt-7 text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-cacau sm:text-[0.78rem]"
            style={d(2)}
          >
            Manicure &nbsp;·&nbsp; Depilação &nbsp;·&nbsp; <span className="whitespace-nowrap">Plástica dos pés</span>
          </p>

          <p className="enter mt-5 max-w-[26rem] text-[1.02rem] leading-relaxed text-cacau-soft" style={d(3)}>
            Manicure, depilação e cuidados especiais para os pés, com atenção aos detalhes e atendimento a
            domicílio.
          </p>

          <div className="enter mt-9 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-7" style={d(4)}>
            <WhatsAppButton event="hero_whatsapp_click">Agendar meu horário</WhatsAppButton>
            <a href="#servicos" className="text-link self-center sm:self-auto">
              Conhecer os serviços
            </a>
          </div>

          <p className="enter mt-7 flex items-start gap-2.5 text-[0.86rem] text-cacau-soft" style={d(5)}>
            <IconHome size={18} className="mt-[2px] shrink-0 text-rose-ink" />
            <span>
              <strong className="font-semibold text-cacau">Atendimento a domicílio.</strong> Consulte valores e
              disponibilidade pelo WhatsApp.
            </span>
          </p>
        </div>
      </div>

      {/* Fotografia real: largura total no celular, sangrando à direita no desktop */}
      <div className="relative overflow-hidden lg:absolute lg:bottom-0 lg:right-0 lg:top-[var(--header-h)] lg:w-[46%]">
        <div className="unveil-panel relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/12] lg:aspect-auto lg:h-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover object-[50%_45%]"
          />
          <div aria-hidden="true" className="hero-photo-fade absolute inset-0" />
        </div>
        <p className="absolute bottom-5 right-[var(--gutter)] z-[2] bg-porcelana/92 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cacau backdrop-blur-sm lg:bottom-10">
          Trabalho real da Luiza
        </p>
      </div>

      {/* Monograma em arco na divisa das seções */}
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
