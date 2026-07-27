// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

/*
  Сайт полностью статический: адаптера нет, сборка отдаёт готовые html в dist/ —
  ровно то, что нужно Cloudflare.

  Админка Keystatic подключается только при запуске dev (npm run dev выставляет KEYSTATIC=1).
  Причины: её API работает на сервере и с локальным хранилищем пишет файлы прямо в репозиторий,
  то есть в прод-сборке бесполезна; вместе с серверным адаптером её CJS-код к тому же падает
  в workerd с «exports is not defined».

  Если админку понадобится открыть на домене — нужно переключить storage на github
  и вернуть серверный адаптер.
*/
const withKeystatic = process.env.KEYSTATIC === '1';

export default defineConfig({
  /*
    Минификатор lightningcss схлопывает animation + animation-timeline в короткую запись
    («animation: linear both name --timeline»), которую браузеры не разбирают, и правило
    отбрасывается целиком: scroll-driven анимации работали в dev и молча пропадали в проде.
    esbuild такие шорткаты не собирает.
  */
  vite: { build: { cssMinify: 'esbuild' } },
  // Нужен для канонических ссылок, sitemap и абсолютных URL в мете.
  site: 'https://neymetov.com',
  output: 'static',
  integrations: [react(), markdoc(), sitemap(), ...(withKeystatic ? [keystatic()] : [])],
});
