"use client";
import { track } from "@vercel/analytics";

/**
 * Eventos de clique no WhatsApp. Um clique significa "conversa iniciada",
 * nunca "horário agendado". Nenhum dado pessoal é enviado.
 * Observação: eventos personalizados só são registrados na Vercel em planos Pro/Enterprise.
 */
export type WhatsAppEvent =
  | "header_whatsapp_click"
  | "hero_whatsapp_click"
  | "manicure_whatsapp_click"
  | "depilacao_whatsapp_click"
  | "pes_whatsapp_click"
  | "domicilio_whatsapp_click"
  | "steps_whatsapp_click"
  | "faq_whatsapp_click"
  | "final_whatsapp_click"
  | "floating_whatsapp_click"
  | "footer_whatsapp_click";

export function trackWhatsApp(event: WhatsAppEvent) {
  try {
    track(event);
  } catch {
    /* analytics nunca pode bloquear a conversa */
  }
}
