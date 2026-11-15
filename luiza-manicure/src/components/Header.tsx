"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/site";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#inicio");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Destaca o link da seção visível
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || open
          ? "bg-porcelana/90 shadow-[0_1px_0_0_rgb(84_49_36/0.08)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div
        className={`shell flex items-center justify-between gap-6 transition-[height] duration-300 ease-out ${
          scrolled ? "h-16 md:h-[72px]" : "h-[72px] md:h-[84px]"
        }`}
      >
        <a href="#inicio" className="relative z-10 shrink-0 text-[21px] md:text-[24px]" aria-label="LUIZA Manicure & Beleza — início">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active === item.href ? "location" : undefined}
                  className="group relative inline-flex min-h-11 items-center px-2.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] xl:px-3.5 xl:text-[0.74rem] xl:tracking-[0.2em] text-cacau-soft transition-colors duration-200 hover:text-cacau aria-[current=location]:text-cacau"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2.5 bottom-2 h-px xl:inset-x-3.5 origin-left scale-x-0 bg-rose transition-transform duration-300 ease-out group-hover:scale-x-100 group-aria-[current=location]:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton event="header_whatsapp_click" variant="secondary" icon={false} className="hidden min-h-11! px-4! sm:inline-flex xl:px-6!">
            Agendar horário
          </WhatsAppButton>
          <button
            ref={toggleRef}
            type="button"
            className="relative z-10 inline-flex size-11 items-center justify-center rounded-full text-cacau lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 ease-out ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 ease-out ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-x-0 top-0 -z-10 flex h-dvh flex-col bg-porcelana px-[var(--gutter)] pb-8 pt-28 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          >
            <nav aria-label="Menu mobile">
              <ul className="flex flex-col">
                {NAV.map((item, i) => (
                  <m.li
                    key={item.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="border-b border-cacau/10"
                  >
                    <a
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-16 items-center justify-between font-serif text-[2.4rem] leading-none text-cacau-soft"
                    >
                      {item.label}
                    </a>
                  </m.li>
                ))}
              </ul>
            </nav>
            <m.div
              className="mt-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <WhatsAppButton event="header_whatsapp_click" className="w-full">
                Agendar horário
              </WhatsAppButton>
              <p className="mt-4 text-center text-sm text-cacau-soft">Consulte valores e disponibilidade pelo WhatsApp.</p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
