import type { CollectionEntry } from 'astro:content';

export interface Cover {
  src: string;
  // Живая обложка: если видео задано, оно играет поверх картинки, а картинка остаётся постером.
  video: string | null;
}

// Обложка для списков работ: своя, если включён тумблер, иначе главное изображение.
export const listCover = (work: CollectionEntry<'works'>): Cover => {
  const { listCover: cover, heroImage } = work.data;
  return cover?.discriminant && cover.value
    ? { src: cover.value.image, video: cover.value.video ?? null }
    : { src: heroImage, video: null };
};
