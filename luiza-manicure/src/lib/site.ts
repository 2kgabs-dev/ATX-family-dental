/** URL pública: defina NEXT_PUBLIC_SITE_URL ao conectar um domínio próprio. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "LUIZA | Manicure & Beleza";
export const SITE_DESCRIPTION =
  "Manicure, depilação e plástica dos pés com atenção aos detalhes, higiene e atendimento personalizado. Atendimento a domicílio — consulte valores e disponibilidade pelo WhatsApp.";

export const NAV = [
  { href: "#inicio", label: "Início" },
  { href: "#servicos", label: "Serviços" },
  { href: "#trabalhos", label: "Trabalhos" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#contato", label: "Contato" },
] as const;
