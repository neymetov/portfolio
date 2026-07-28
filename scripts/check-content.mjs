// Ищет ссылки на записи, которых больше нет: в админке переименование меняет слаг,
// и ссылающийся элемент молча пропадает со страницы. Запускается перед сборкой.

import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const content = resolve(root, 'src/content');

const idsOf = async (dir) =>
  new Set((await readdir(resolve(content, dir))).filter((f) => f.endsWith('.json')).map((f) => basename(f, '.json')));

const [categories, processes] = [await idsOf('categories'), await idsOf('processes')];
const problems = [];

for (const file of await readdir(resolve(content, 'works'))) {
  const work = JSON.parse(await readFile(resolve(content, 'works', file), 'utf8'));

  for (const tag of work.categoryTags ?? []) {
    if (!categories.has(tag)) problems.push(`works/${file}: рубрика «${tag}» не найдена`);
  }
  if (work.process && !processes.has(work.process)) {
    problems.push(`works/${file}: процесс «${work.process}» не найден`);
  }
}

if (problems.length) {
  console.warn(`\n  ⚠ Битые ссылки в контенте (${problems.length}) — элементы пропадут со страниц:`);
  for (const p of problems) console.warn(`    ${p}`);
  console.warn('  Поправьте в админке или в src/content.\n');
} else {
  console.log('content: ссылки между записями целы');
}
