// Генерирует src/styles/tokens.css из выгрузки Figma Variables в формате DTCG (папка design-tokens).
// Значения стилей берутся только отсюда — руками tokens.css не правим, перегенерируем.
// Запуск: npm run tokens (выполняется автоматически перед dev/build).
//
// Структуру описывает manifest.json: коллекции с режимами (Mobile / Desktop) и стили
// (текстовые, эффекты, сетки). Mobile-режим уходит в :root, Desktop — в медиазапрос;
// дублирующиеся значения в медиазапрос не попадают.
//
// Типографика — отдельный случай: у Figma это две точки одной шкалы (mobile 54px → desktop 100px),
// поэтому размеры и интерлиньяж собираются в clamp() и меняются плавно, без ступеньки.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'design-tokens');
const OUT = resolve(root, 'src/styles/tokens.css');

const DESKTOP_FROM = '1024px';
// Границы, между которыми интерполируется типографика: мобильный и десктопный макеты Figma.
const MIN_VW = 375;
const MAX_VW = 1440;

const manifest = JSON.parse(await readFile(resolve(SRC, 'manifest.json'), 'utf8'));
const load = (file) => readFile(resolve(SRC, file), 'utf8').then(JSON.parse);

/** Читает все файлы режима и сливает в один объект. */
const loadMode = async (files) =>
  Object.assign({}, ...(await Promise.all((files ?? []).map(load))));

const kebab = (s) => s.trim().toLowerCase().replace(/[\s_]+/g, '-');
const num = (value) => Number(String(value).replace('px', ''));
const px = (n) => (n === 0 ? '0' : `${Math.round(n * 100) / 100}px`);

/** Разворачивает вложенные группы DTCG в плоскую карту: { 'FontSize.Heading.H1': 100 }. */
const flatten = (node, prefix = '', out = {}) => {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in value) out[prefix + key] = value.$value;
    else if (value && typeof value === 'object') flatten(value, `${prefix}${key}.`, out);
  }
  return out;
};

/** Значение, меняющееся с шириной вьюпорта между мобильным и десктопным макетом. */
const fluid = (min, max) => {
  if (min === max) return px(min);
  const slope = (max - min) / (MAX_VW - MIN_VW);
  const intercept = min - slope * MIN_VW;
  return `clamp(${px(min)}, ${intercept.toFixed(2)}px + ${(slope * 100).toFixed(4)}vw, ${px(max)})`;
};

const collection = (name) => manifest.collections[name]?.modes ?? {};
const modeOf = async (name, mode) => flatten(await loadMode(collection(name)[mode]));

const base = [];
const desktop = [];
const section = (title) => base.push('', `  /* ${title} */`);

/**
 * Пишет группу переменных: mobile-значения в :root, отличающиеся desktop-значения — в медиазапрос.
 * format приводит значение токена к CSS (по умолчанию — размер в px).
 */
const emit = (prefix, mobile, desktopValues, format = (v) => px(num(v))) => {
  for (const [name, value] of Object.entries(mobile)) {
    const variable = `--${prefix}-${kebab(name)}`;
    base.push(`  ${variable}: ${format(value)};`);
    const alt = desktopValues?.[name];
    if (alt !== undefined && format(alt) !== format(value)) {
      desktop.push(`    ${variable}: ${format(alt)};`);
    }
  }
};

// --- Цвета ------------------------------------------------------------------
// У коллекции Colors один режим, поэтому берём его как есть, без медиазапроса.
section('Colors');
const [colorsMode] = Object.keys(collection('Colors'));
emit('color', await modeOf('Colors', colorsMode), undefined, (v) => String(v));

// --- Отступы, радиусы, bento ------------------------------------------------
for (const [name, prefix, title] of [
  ['Spacing', 'space', 'Spacing'],
  ['Radius', 'radius', 'Radius'],
  ['Bento Width', 'bento-w', 'Bento Width'],
  ['Bento Height', 'bento-h', 'Bento Height'],
]) {
  section(title);
  emit(prefix, await modeOf(name, 'Mobile'), await modeOf(name, 'Desktop'));
}

// --- Типографика ------------------------------------------------------------
section('Typography');

const typographyMobile = await modeOf('Typography', 'Mobile');
const typographyDesktop = await modeOf('Typography', 'Desktop');
const textStyles = flatten(await loadMode(manifest.styles?.text));

// Текстовые стили ссылаются на переменные ({FontSize.Heading.H1}), из них и берём роли.
const reference = (value) => String(value).replace(/[{}]/g, '');
const familyOf = Object.values(textStyles)[0]?.fontFamily ?? 'SF Pro Display';

base.push(
  `  --font-family: '${familyOf}', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;`,
);

for (const [name, style] of Object.entries(textStyles)) {
  const role = kebab(name);
  const sizeKey = reference(style.fontSize);
  const lineKey = reference(style.lineHeight);

  base.push(
    `  --font-size-${role}: ${fluid(num(typographyMobile[sizeKey]), num(typographyDesktop[sizeKey]))};`,
    `  --line-height-${role}: ${fluid(num(typographyMobile[lineKey]), num(typographyDesktop[lineKey]))};`,
    `  --font-weight-${role}: ${style.fontWeight};`,
  );
}

// --- Сетка ------------------------------------------------------------------
section('Grid');
for (const [name, style] of Object.entries(flatten(await loadMode(manifest.styles?.grid)))) {
  const [grid] = style;
  const key = kebab(name);
  base.push(
    `  --grid-${key}-columns: ${grid.count};`,
    `  --grid-${key}-gutter: ${px(num(grid.gutterSize))};`,
    `  --grid-${key}-offset: ${px(num(grid.offset))};`,
  );
}

// --- Тени -------------------------------------------------------------------
section('Effects');
for (const [name, style] of Object.entries(flatten(await loadMode(manifest.styles?.effect)))) {
  const shadow = style
    .map((s) => `${px(num(s.offsetX))} ${px(num(s.offsetY))} ${px(num(s.blur))} ${px(num(s.spread))} ${s.color}`)
    .join(', ');
  base.push(`  --shadow-${kebab(name)}: ${shadow};`);
}

const desktopBlock = desktop.length
  ? `
@media (min-width: ${DESKTOP_FROM}) {
  :root {
${desktop.join('\n')}
  }
}
`
  : '';

const css = `/* СГЕНЕРИРОВАНО scripts/build-tokens.mjs из design-tokens/. Не редактировать вручную. */
:root {
${base.join('\n').replace(/^\n/, '')}
}
${desktopBlock}`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, css);

const files = (await readdir(SRC)).filter((f) => f.endsWith('.json')).length;
console.log(
  `tokens.css: ${css.split('\n').length} строк из ${files} файлов; ` +
    `desktop-переопределений — ${desktop.length}`,
);
