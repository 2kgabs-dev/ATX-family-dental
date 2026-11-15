"use client";

import type { ReactNode } from "react";
import { trackWhatsApp, type WhatsAppEvent } from "@/lib/analytics";
import { createWhatsAppLink, MESSAGES, type MessageKey } from "@/lib/whatsapp";
import { IconArrow, IconWhatsApp } from "./icons";

type Variant = "primary" | "secondary" | "light" | "link";

const styles: Record<Variant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  light: "btn btn-light",
  link: "text-link",
};

/**
 * Todo CTA de conversão passa por aqui: abre a conversa certa no WhatsApp
 * com a mensagem pré-preenchida e registra o clique (não o agendamento).
 */
export function WhatsAppButton({
  message = "geral",
  event,
  children,
  variant = "primary",
  className = "",
  icon = true,
  ariaLabel,
}: {
  message?: MessageKey;
  event: WhatsAppEvent;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: boolean;
  ariaLabel?: string;
}) {
  return (
    <a
      href={createWhatsAppLink(MESSAGES[message])}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles[variant]} ${className}`}
      data-wa={message}
      aria-label={ariaLabel}
      onClick={() => trackWhatsApp(event)}
    >
      {icon && variant !== "link" && <IconWhatsApp size={18} className="shrink-0" />}
      <span>{children}</span>
      {variant === "link" && <IconArrow size={18} className="text-link-arrow shrink-0" />}
    </a>
  );
}
