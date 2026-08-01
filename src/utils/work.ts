import type { CollectionEntry } from 'astro:content';

// Изображение для списков работ: своя обложка, если включён тумблер, иначе главное изображение.
export const listCover = (work: CollectionEntry<'works'>) => {
  const { listCover: cover, heroImage } = work.data;
  return cover?.discriminant && cover.value ? cover.value : heroImage;
};
