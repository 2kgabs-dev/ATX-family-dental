"use client";

import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GALLERY } from "@/lib/photos";
import { IconChevron, IconClose, IconExpand } from "./icons";
import { MaskReveal, Reveal } from "./Reveal";

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
    if (index === null && d.open) d.close();
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
    <section id="trabalhos" aria-labelledby="trabalhos-title" className="section bg-blush">
      <div className="shell">
        <Reveal as="header" className="mx-auto max-w-2xl text-center">
          <h2 id="trabalhos-title" className="h2 text-cacau-soft">
            Detalhes que fazem <span className="serif-italic text-rose-ink">a diferença.</span>
          </h2>
          <p className="lede mx-auto mt-6">Conheça alguns dos trabalhos realizados pela LUIZA.</p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:mt-20 lg:grid-cols-4 lg:gap-5">
          {GALLERY.map((photo, i) => (
            <li key={photo.id}>
              <MaskReveal delay={i * 0.1}>
                <button
                  ref={(el) => {
                    triggerRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => open(i)}
                  className="photo-frame photo-zoom group relative block aspect-[4/5] w-full cursor-zoom-in rounded-[12px] text-left"
                  aria-label={`Ampliar foto: ${photo.label}`}
                  aria-haspopup="dialog"
                >
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 300px, 48vw" className="object-cover" />
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-porcelana/90 text-cacau opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100"
                  >
                    <IconExpand size={18} />
                  </span>
                  <span className="caps absolute bottom-4 left-4 text-[0.66rem] text-cacau-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {photo.label}
                  </span>
                </button>
              </MaskReveal>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-xl text-center text-[0.88rem] leading-relaxed text-cacau-soft">
          Trabalhos reais da Luiza. O fundo das fotos foi trocado para deixar a galeria uniforme; mãos, unhas e cores
          não foram retocadas.
        </p>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Galeria de trabalhos"
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-blush p-0 text-cacau backdrop:bg-blush"
        onKeyDown={onKeyDown}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && index !== null && (
          <div
            className="relative flex h-full w-full flex-col"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-5">
              <p className="caps text-cacau-soft tabular-nums" aria-live="polite">
                {index + 1} / {GALLERY.length} · {current.label}
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-11 items-center justify-center rounded-full border border-cacau/20 transition-colors hover:bg-tile"
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
                  className="relative h-full w-full"
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" quality={82} className="object-contain" />
                </m.div>
              </AnimatePresence>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 rotate-180 items-center justify-center rounded-full border border-cacau/20 bg-porcelana/80 transition-colors hover:bg-porcelana md:left-6"
                aria-label="Foto anterior"
              >
                <IconChevron size={22} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-cacau/20 bg-porcelana/80 transition-colors hover:bg-porcelana md:right-6"
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
