"use client";

import { trackWhatsApp } from "@/lib/analytics";
import { NAV } from "@/lib/site";
import { createWhatsAppLink, MESSAGES, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const SERVICES = [
  { label: "Manicure", key: "manicure" },
  { label: "Depilação", key: "depilacao" },
  { label: "Plástica dos pés", key: "pes" },
  { label: "Atendimento a domicílio", key: "domicilio" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-cacau text-porcelana">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <a href="#inicio" className="inline-block text-[30px]" aria-label="LUIZA Manicure & Beleza — voltar ao início">
            <Logo tone="dark" />
          </a>
          <p className="mt-6 max-w-xs text-[0.95rem] text-porcelana/75">
            Cuidado, beleza e atenção aos detalhes, com atendimento personalizado.
          </p>
        </div>

        <nav aria-label="Rodapé" className="md:col-span-2">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-nude">Navegação</p>
          <ul className="mt-5 space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="inline-flex min-h-10 items-center text-porcelana/85 hover:text-porcelana hover:underline">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-nude">Serviços</p>
          <ul className="mt-5 space-y-1">
            {SERVICES.map((s) => (
              <li key={s.key}>
                <a
                  href={createWhatsAppLink(MESSAGES[s.key])}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa={s.key}
                  onClick={() => trackWhatsApp("footer_whatsapp_click")}
                  className="inline-flex min-h-10 items-center text-porcelana/85 hover:text-porcelana hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-nude">Contato</p>
          <a
            href={createWhatsAppLink(MESSAGES.geral)}
            target="_blank"
            rel="noopener noreferrer"
            data-wa="geral"
            onClick={() => trackWhatsApp("footer_whatsapp_click")}
            className="mt-5 inline-flex min-h-10 items-center font-semibold tabular-nums text-porcelana hover:underline"
          >
            {WHATSAPP_DISPLAY}
          </a>
          <p className="mt-1 text-[0.9rem] text-porcelana/75">WhatsApp</p>
        </div>
      </div>

      <div className="border-t border-porcelana/12">
        <div className="shell flex flex-col gap-2 py-6 pb-28 text-[0.8rem] text-porcelana/70 md:flex-row md:justify-between md:pb-6">
          <p>© {year} LUIZA | Manicure &amp; Beleza. Todos os direitos reservados.</p>
          <p>Fotos: trabalhos reais da profissional. Métricas de acesso anônimas, sem cookies.</p>
        </div>
      </div>
    </footer>
  );
}
