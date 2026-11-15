"use client";

import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GALLERY } from "@/lib/photos";
import { IconChevron, IconClose, IconExpand } from "./icons";
import { MaskReveal, Reveal } from "./Reveal";

// Deslocamento vertical de cada coluna: ritmo editorial, sem repetir imagens
// Mobile: duas colunas (CSS columns); desktop: quatro colunas desencontradas.
const OFFSETS = ["lg:mt-0", "lg:mt-24", "lg:mt-10", "lg:mt-36"];
const MOBILE_PAD = ["", "", "pt-10", ""];
const RATIOS = ["aspect-[5/8]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[5/6]"];

export function PortfolioGallery() {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchX = useRef<number | null>(null);
  const lastIndex = useRef(0);

  const open = (i: number) => {
    lastIndex.current = i;
    setDir(1);
    setIndex(i);
  };
  const close = () => setIndex(null);
  const go = (step: number) => {
    if (index === null) return;
    const next = (index + step + GALLERY.length) % GALLERY.length;
    lastIndex.current = next;
    setDir(step);
    setIndex(next);
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (index !== null && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (index === null && d.open) {
      d.close();
    }
  }, [index]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      setIndex(null);
      triggerRefs.current[lastIndex.current]?.focus();
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const current = index !== null ? GALLERY[index] : null;

  return (
    <section id="trabalhos" aria-labelledby="trabalhos-title" className="section overflow-hidden bg-porcelana">
      <div className="shell">
        <Reveal as="header" className="max-w-2xl">
          <h2 id="trabalhos-title" className="h2">
            Detalhes que fazem <span className="serif-italic text-rose-ink">a diferença.</span>
          </h2>
          <p className="lede mt-6">Conheça alguns dos trabalhos realizados pela LUIZA.</p>
        </Reveal>

        <ul className="mt-14 columns-2 gap-4 md:mt-20 md:gap-6 lg:grid lg:grid-cols-4 lg:items-start lg:gap-7">
          {GALLERY.map((photo, i) => (
            <li key={photo.id} className={`mb-4 break-inside-avoid md:mb-6 lg:mb-0 lg:pt-0 ${MOBILE_PAD[i]} ${OFFSETS[i]}`}>
              <div>
                <MaskReveal delay={i * 0.12}>
                  <button
                    ref={(el) => {
                      triggerRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => open(i)}
                    className="photo-frame photo-zoom group relative block w-full cursor-zoom-in rounded-[22px] text-left"
                    aria-label={`Ampliar foto: ${photo.label}`}
                    aria-haspopup="dialog"
                  >
                    <span className={`relative block ${RATIOS[i]}`}>
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 1024px) 300px, 46vw"
                        className="object-cover"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-porcelana/90 text-cacau opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100 max-lg:size-9"
                    >
                      <IconExpand size={18} />
                    </span>
                  </button>
                </MaskReveal>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[0.85rem] text-cacau-soft lg:mt-16">
          Fotografias reais de clientes atendidas pela Luiza, sem filtros de cor.
        </p>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Galeria de trabalhos"
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-cacau-deep p-0 text-porcelana backdrop:bg-cacau-deep"
        onKeyDown={onKeyDown}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && index !== null && (
          <div
            className="on-dark relative flex h-full w-full flex-col"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-5">
              <p className="text-sm tabular-nums text-porcelana/80" aria-live="polite">
                {index + 1} / {GALLERY.length} · {current.label}
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-11 items-center justify-center rounded-full bg-porcelana/10 transition-colors hover:bg-porcelana/20"
                aria-label="Fechar galeria"
                autoFocus
              >
                <IconClose size={22} />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-24 md:pb-10">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <m.div
                  key={current.id}
                  custom={dir}
                  className="relative h-full w-full"
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="100vw"
                    quality={82}
                    className="object-contain"
                  />
                </m.div>
              </AnimatePresence>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 rotate-180 items-center justify-center rounded-full bg-porcelana/12 transition-colors hover:bg-porcelana/22 md:left-6"
                aria-label="Foto anterior"
              >
                <IconChevron size={22} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-porcelana/12 transition-colors hover:bg-porcelana/22 md:right-6"
                aria-label="Próxima foto"
              >
                <IconChevron size={22} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
