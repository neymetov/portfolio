// Одноразовый генератор нейтральных SVG-заглушек для картинок, которых ещё нет
// (обложки работ, иконки skill-карточек, флаги языков). Всё это заменяется через админку.

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const write = async (path, content) => {
  const full = resolve(root, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, content);
};

// Заливка на два шага темнее фона страницы (neutral-200), иначе заглушка на нём не читается.
const placeholder = (label, w = 628, h = 628) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#d6d3d1"/>
  <text x="50%" y="50%" fill="#525252" font-family="SF Pro Display, sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>
`;

const flags = {
  azerbaijani: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="16" fill="#3f9c35"/><path d="M0 10.7h32v10.6H0z" fill="#ed2939"/><path d="M0 10.7h32V0H0z" fill="#00b9e4"/><circle cx="15" cy="16" r="5" fill="#fff"/><circle cx="16.6" cy="16" r="4" fill="#ed2939"/></svg>`,
  russian: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="16" fill="#fff"/><path d="M0 10.7h32v10.6H0z" fill="#0039a6"/><path d="M0 21.3h32V32H0z" fill="#d52b1e"/></svg>`,
  english: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="16" fill="#012169"/><path d="M0 13h32v6H0z" fill="#fff"/><path d="M13 0h6v32h-6z" fill="#fff"/><path d="M0 14h32v4H0z" fill="#c8102e"/><path d="M14 0h4v32h-4z" fill="#c8102e"/></svg>`,
};

for (const [name, svg] of Object.entries(flags)) {
  await write(`public/images/flags/${name}.svg`, svg + '\n');
}

const skills = [
  'design-function',
  'brand-and-product',
  'whole-design-loop',
  'design-systems',
  'team-and-quality',
  'craft',
  'ai-automation',
];
for (const name of skills) {
  await write(`public/images/skills/${name}.svg`, placeholder('skill', 156, 156));
}

const works = ['work-1', 'work-2', 'work-3', 'work-4', 'work-5', 'work-6'];
for (const name of works) {
  await write(`public/images/works/${name}.svg`, placeholder(name));
  await write(`public/images/works/${name}-gallery-a.svg`, placeholder(`${name} / gallery`));
  await write(`public/images/works/${name}-gallery-b.svg`, placeholder(`${name} / gallery`));
}

console.log('placeholders: готово');
