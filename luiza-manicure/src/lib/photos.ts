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
  src: `/photos/${id}.jpg`,
  width: meta[id].width,
  height: meta[id].height,
  alt,
  label,
});

/** Fotografias reais de trabalhos realizados pela Luiza (sem retoque de cor). */
export const PHOTOS = {
  vinho: p(
    "vermelho-vinho",
    "Mãos cruzadas com unhas quadradas esmaltadas em vermelho-vinho brilhante, sobre tecido marrom.",
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
    "Mãos sobrepostas com unhas arredondadas em verde metalizado com reflexo cromado, sobre fundo cinza.",
    "Verde metalizado",
  ),
} as const;

export const GALLERY: Photo[] = [PHOTOS.verde, PHOTOS.vinho, PHOTOS.terracota, PHOTOS.vermelho];
