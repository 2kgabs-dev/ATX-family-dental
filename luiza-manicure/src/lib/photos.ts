import meta from "./photo-meta.json";

export type Photo = {
  id: keyof typeof meta;
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
};

const p = (id: keyof typeof meta, alt: string, label: string): Photo => ({
  id,
  src: meta[id].src,
  width: meta[id].width,
  height: meta[id].height,
  alt,
  label,
});

/**
 * Fotografias reais de trabalhos da Luiza. O fundo de celular foi substituído
 * pelo fundo da marca; mãos, unhas e cores não foram retocadas.
 */
export const PHOTOS = {
  hero: p(
    "hero",
    "Mãos sobrepostas e erguidas com unhas arredondadas em verde metalizado com reflexo cromado.",
    "Verde metalizado",
  ),
  vinho: p(
    "vermelho-vinho",
    "Mãos cruzadas com unhas quadradas esmaltadas em vermelho-vinho brilhante.",
    "Vermelho-vinho",
  ),
  vermelho: p(
    "vermelho-tatuagens",
    "Mãos sobrepostas com tatuagens finas e anéis prateados, unhas esmaltadas em vermelho vivo.",
    "Vermelho vivo",
  ),
  terracota: p(
    "terracota",
    "Duas mãos mostrando unhas curtas e arredondadas em tom terracota, com aliança e anel de brilhantes.",
    "Terracota",
  ),
  verde: p(
    "verde-metalizado",
    "Mãos sobrepostas com unhas arredondadas em verde metalizado com reflexo cromado.",
    "Verde metalizado",
  ),
} as const;

export const GALLERY: Photo[] = [PHOTOS.vinho, PHOTOS.verde, PHOTOS.vermelho, PHOTOS.terracota];
