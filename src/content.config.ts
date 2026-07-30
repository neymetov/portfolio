import { defineCollection, z, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Astro читает те же JSON-файлы, которые пишет Keystatic, — источник один.
const json = (dir: string) => glob({ pattern: '*.json', base: `./src/content/${dir}` });

const imageBlock = z.object({ src: z.string(), alt: z.string().default('') });

const works = defineCollection({
  loader: json('works'),
  schema: z.object({
    title: z.string(),
    shortDescription: z.string().default(''),
    categoryTags: z.array(reference('categories')).default([]),
    cardSize: z.enum(['wide', 'banner', 'split', 'small']).default('small'),
    showOnHome: z.boolean().default(false),
    heroImage: z.string(),
    order: z.number().default(0),
    process: reference('processes').optional().nullable(),
    galleryBlocks: z
      .array(
        z.object({
          type: z.enum(['full', 'split-2', 'split-4']),
          images: z.array(imageBlock).default([]),
        }),
      )
      .default([]),
  }),
});

const skills = defineCollection({
  loader: json('skills'),
  schema: z.object({
    title: z.string(),
    icon: z.string(),
    description: z.string().default(''),
    order: z.number().default(0),
  }),
});

const processes = defineCollection({
  loader: json('processes'),
  schema: z.object({
    title: z.string(),
    problem: z.string().default(''),
    action: z.string().default(''),
  }),
});

const categories = defineCollection({
  loader: json('categories'),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
  }),
});

const home = defineCollection({
  loader: file('./src/content/singletons/home.json', { parser: (text) => ({ home: JSON.parse(text) }) }),
  schema: z.object({
    heroCv: z.object({
      title: z.string(),
      titleAccent: z.string().default(''),
      body: z.string().default(''),
      moreLabel: z.string().default('More +'),
      lessLabel: z.string().default('Close +'),
      education: z
        .array(z.object({ logo: z.string(), name: z.string(), dates: z.string(), program: z.string() }))
        .default([]),
      experience: z
        .array(z.object({ logo: z.string(), company: z.string(), dates: z.string(), role: z.string() }))
        .default([]),
      educationTitle: z.string().default('Education'),
      experienceTitle: z.string().default('Experience'),
      languagesTitle: z.string().default(''),
      languages: z.array(z.object({ flag: z.string(), name: z.string() })).default([]),
    }),
    heroImage: imageBlock,
    skillSectionTitle: z.string().default(''),
    lastWorks: z.object({
      title: z.string(),
      year: z.string().default(''),
      buttonLabel: z.string().default('All works'),
    }),
  }),
});

const worksPage = defineCollection({
  loader: file('./src/content/singletons/works.json', { parser: (text) => ({ works: JSON.parse(text) }) }),
  schema: z.object({
    title: z.string(),
    relatedTitle: z.string().default('More works'),
  }),
});

const site = defineCollection({
  loader: file('./src/content/singletons/site.json', { parser: (text) => ({ site: JSON.parse(text) }) }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    ogImage: z.string(),
  }),
});

const illustrations = defineCollection({
  loader: file('./src/content/singletons/illustrations.json', {
    parser: (text) => ({ illustrations: JSON.parse(text) }),
  }),
  schema: z.object({
    title: z.string(),
    caption: z.string().default(''),
    galleryLabel: z.string().default('Show gallery'),
    galleryUrl: z.string().default('/works'),
    instagramLabel: z.string().default('Instagram'),
    instagramUrl: z.string().default(''),
    images: z.array(imageBlock).default([]),
    decorImage: z.string(),
    bannerImage: z.string(),
  }),
});

const navigation = defineCollection({
  loader: file('./src/content/singletons/navigation.json', {
    parser: (text) => ({ navigation: JSON.parse(text) }),
  }),
  schema: z.object({
    items: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          icon: z.enum(['cursor-05', 'box', 'inbox-02', 'instagram', 'telegram', 'linkedin-02']),
        }),
      )
      .default([]),
  }),
});

const siteFooter = defineCollection({
  loader: file('./src/content/singletons/site-footer.json', {
    parser: (text) => ({ footer: JSON.parse(text) }),
  }),
  schema: z.object({
    title: z.string(),
    caption: z.string().default(''),
    backgroundImage: z.string(),
    buttonLabel: z.string(),
    externalUrl: z.string(),
    copyright: z.string().default(''),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

export const collections = {
  works,
  skills,
  processes,
  categories,
  site,
  home,
  worksPage,
  illustrations,
  navigation,
  siteFooter,
};
