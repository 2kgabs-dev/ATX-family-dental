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

/** Fotografias reais de trabalhos da Luiza (cores originais, sem retoque). */
export const PHOTOS = {
  hero: p(
    "hero",
    "Mãos sobrepostas e erguidas com unhas arredondadas em verde metalizado com reflexo cromado.",
    "Verde metalizado",
  ),
  rosa: p(
    "rosa-leitoso",
    "Mãos sobrepostas com unhas amendoadas em rosa leitoso translúcido e anéis prateados.",
    "Rosa leitoso",
  ),
  vinho: p(
    "vinho-plantas",
    "Mãos com unhas quadradas esmaltadas em vermelho-vinho e aliança dourada, diante de folhas verdes.",
    "Vermelho-vinho",
  ),
  chocolate: p(
    "chocolate",
    "Mãos com unhas quadradas em marrom chocolate diante de uma prateleira de esmaltes.",
    "Chocolate",
  ),
  vermelho: p("vermelho", "Mãos sobrepostas com unhas quadradas em vermelho vivo brilhante.", "Vermelho vivo"),
  lilas: p(
    "lilas",
    "Mãos com unhas amendoadas em lilás claro e anel dourado, sobre mesa de madeira.",
    "Lilás",
  ),
} as const;

export const GALLERY: Photo[] = [PHOTOS.rosa, PHOTOS.vinho, PHOTOS.chocolate, PHOTOS.vermelho, PHOTOS.lilas];
