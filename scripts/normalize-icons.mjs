// Приводит иконки, выгруженные из Figma (src/icons/raw), к виду, пригодному для инлайна:
// холст 24×24 (как в макете), содержимое отцентровано, цвет — currentColor.
// Figma экспортирует их обрезанными по контенту и с зашитым цветом в var(--stroke-0, #…).
// Запуск: npm run icons — после того, как иконки перевыгрузили из Figma.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = resolve(root, 'src/icons/raw');
const OUT = resolve(root, 'src/icons');
const CANVAS = 24;

// Figma отдаёт эти иконки отражёнными по вертикали (в макете к ним применён
// rotate 180 + flip X, что в сумме и есть отражение по Y) — возвращаем на место.
const FLIP_Y = new Set(['telegram.svg', 'instagram.svg']);

for (const filename of (await readdir(RAW)).filter((f) => f.endsWith('.svg'))) {
  const raw = await readFile(resolve(RAW, filename), 'utf8');

  const width = Number(raw.match(/width="([\d.]+)"/)?.[1]);
  const height = Number(raw.match(/height="([\d.]+)"/)?.[1]);
  if (!width || !height) throw new Error(`${filename}: не нашёл размеры`);

  const body = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/var\(--(?:stroke|fill)-\d+,\s*#[0-9a-fA-F]+\)/g, 'currentColor')
    .trim();

  const dx = round((CANVAS - width) / 2);
  const dy = round((CANVAS - height) / 2);

  const flip = FLIP_Y.has(filename) ? ` translate(0 ${round(height)}) scale(1 -1)` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}" fill="none">
  <g transform="translate(${dx} ${dy})${flip}">
${indent(body)}
  </g>
</svg>
`;
  await writeFile(resolve(OUT, basename(filename)), svg);
  console.log(`${filename}: ${width}×${height} → 24×24 (+${dx},${dy})`);
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function indent(text) {
  return text
    .split('\n')
    .map((line) => (line.trim() ? `    ${line.trim()}` : ''))
    .filter(Boolean)
    .join('\n');
}
