/** Número oficial: +55 11 96730-2813 (único ponto de configuração). */
export const WHATSAPP_NUMBER = "5511967302813";
export const WHATSAPP_DISPLAY = "+55 11 96730-2813";

export const MESSAGES = {
  geral: "Olá, Luiza! Vi seu site e gostaria de agendar um horário.",
  manicure:
    "Olá, Luiza! Gostaria de agendar um horário para manicure. Pode me informar os valores e a disponibilidade?",
  depilacao:
    "Olá, Luiza! Gostaria de saber mais sobre os serviços de depilação e consultar os horários disponíveis.",
  pes: "Olá, Luiza! Gostaria de saber mais sobre a plástica dos pés e agendar um horário.",
  domicilio:
    "Olá, Luiza! Gostaria de consultar a disponibilidade de atendimento a domicílio na minha região.",
} as const;

export type MessageKey = keyof typeof MESSAGES;

export function createWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
