"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { WhatsAppButton } from "./WhatsAppButton";

/** Barra fixa no celular: aparece depois da Hero e some no CTA final, para não duplicar. */
export function FloatingWhatsApp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const end = document.getElementById("contato");
    let heroVisible = true;
    let endVisible = false;
    const update = () => setShow(!heroVisible && !endVisible);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroVisible = e.isIntersecting;
        if (e.target === end) endVisible = e.isIntersecting;
      }
      update();
    });
    if (hero) io.observe(hero);
    if (end) io.observe(end);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:hidden"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="rounded-full bg-porcelana/80 p-1.5 shadow-[0_12px_30px_-12px_rgb(84_49_36/0.45)] backdrop-blur-md">
            <WhatsAppButton event="floating_whatsapp_click" className="w-full">
              Agendar pelo WhatsApp
            </WhatsAppButton>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
