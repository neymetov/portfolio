import { config, collection, singleton, fields } from '@keystatic/core';

const image = (label: string, directory: string) =>
  fields.image({
    label,
    directory: `public/images/${directory}`,
    publicPath: `/images/${directory}/`,
    validation: { isRequired: true },
  });

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Elshan Neymatov' },
    // Все синглтоны и коллекции обязаны быть перечислены здесь, иначе редактор их не увидит.
    navigation: {
      Страницы: ['site', 'home', 'worksPage'],
      Контент: ['works', 'skills', 'categories'],
      Служебное: ['navigation', 'siteFooter', 'processes'],
    },
  },
  singletons: {
    site: singleton({
      label: 'Сайт (SEO)',
      path: 'src/content/singletons/site',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Заголовок в браузере и поиске' }),
        description: fields.text({ label: 'Описание для поиска и соцсетей', multiline: true }),
      },
    }),

    home: singleton({
      label: 'Главная',
      path: 'src/content/singletons/home',
      format: { data: 'json' },
      schema: {
        heroCv: fields.object(
          {
            title: fields.text({ label: 'Заголовок CV (серая часть)', multiline: true }),
            titleAccent: fields.text({ label: 'Заголовок CV (тёмная часть)' }),
            body: fields.text({ label: 'Текст CV', multiline: true }),
            moreLabel: fields.text({ label: 'Кнопка «раскрыть» (моб.)', defaultValue: 'More +' }),
            lessLabel: fields.text({ label: 'Кнопка «свернуть» (моб.)', defaultValue: 'Close +' }),
            education: fields.array(
              fields.object({
                logo: image('Логотип', 'education'),
                name: fields.text({ label: 'Учебное заведение' }),
                dates: fields.text({ label: 'Годы' }),
                program: fields.text({ label: 'Специальность' }),
              }),
              { label: 'Образование', itemLabel: (p) => p.fields.name.value },
            ),
            experience: fields.array(
              fields.object({
                logo: image('Логотип', 'experience'),
                company: fields.text({ label: 'Компания' }),
                dates: fields.text({ label: 'Годы' }),
                role: fields.text({ label: 'Должность' }),
              }),
              { label: 'Опыт', itemLabel: (p) => p.fields.company.value },
            ),
            educationTitle: fields.text({ label: 'Заголовок блока образования', defaultValue: 'Education' }),
            experienceTitle: fields.text({ label: 'Заголовок блока опыта', defaultValue: 'Experience' }),
            languagesTitle: fields.text({ label: 'Заголовок блока языков' }),
            languages: fields.array(
              fields.object({
                flag: image('Флаг', 'flags'),
                name: fields.text({ label: 'Язык' }),
              }),
              { label: 'Языки', itemLabel: (p) => p.fields.name.value },
            ),
          },
          { label: 'Hero — баннер с CV' },
        ),
        heroImage: fields.object(
          {
            src: image('Изображение', 'hero'),
            alt: fields.text({ label: 'Alt' }),
          },
          { label: 'Hero — баннер с изображением' },
        ),
        skillSectionTitle: fields.text({ label: 'Заголовок skill-секции' }),
        // Порядок карточек на главной задаётся здесь, а не порядком файлов.
        skillCards: fields.array(fields.relationship({ label: 'Карточка', collection: 'skills' }), {
          label: 'Карточки skill-секции',
          itemLabel: (p) => p.value ?? 'Карточка',
        }),
        lastWorks: fields.object(
          {
            title: fields.text({ label: 'Заголовок' }),
            year: fields.text({ label: 'Год (подпись у заголовка)' }),
            buttonLabel: fields.text({ label: 'Подпись кнопки', defaultValue: 'All works' }),
            // Сами работы выбираются галочкой «Показывать на главной» в карточке работы.
          },
          { label: 'Секция последних работ' },
        ),
      },
    }),

    // Ключ отличается от коллекции works, иначе навигация админки ссылается на них неоднозначно.
    worksPage: singleton({
      label: 'Страница /works',
      path: 'src/content/singletons/works',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Заголовок страницы' }),
        // Подпись над рядом других работ внизу страницы проекта — одна для всех проектов.
        relatedTitle: fields.text({ label: 'Заголовок блока «другие работы»', defaultValue: 'More works' }),
        // Состав страницы задаётся не здесь, а полями «Как показывать на /works»
        // и «Порядок сортировки» у самих работ.
      },
    }),

    navigation: singleton({
      label: 'Меню',
      path: 'src/content/singletons/navigation',
      format: { data: 'json' },
      schema: {
        // Порядок пунктов = порядок в этом списке. Внешние ссылки определяются по http(s) в href.
        items: fields.array(
          fields.object({
            label: fields.text({ label: 'Подпись' }),
            href: fields.text({ label: 'Ссылка' }),
            icon: fields.select({
              label: 'Иконка',
              options: [
                { label: 'Курсор (What I can do)', value: 'cursor-05' },
                { label: 'Коробка (Projects)', value: 'box' },
                { label: 'Входящие (DM)', value: 'inbox-02' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Telegram', value: 'telegram' },
                { label: 'LinkedIn', value: 'linkedin-02' },
              ],
              defaultValue: 'box',
            }),
          }),
          { label: 'Пункты меню', itemLabel: (p) => p.fields.label.value },
        ),
      },
    }),

    siteFooter: singleton({
      label: 'Футер',
      path: 'src/content/singletons/site-footer',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Заголовок' }),
        caption: fields.text({ label: 'Подпись под заголовком', multiline: true }),
        backgroundImage: image('Фоновое изображение', 'hero'),
        buttonLabel: fields.text({ label: 'Подпись кнопки' }),
        externalUrl: fields.url({ label: 'Ссылка на мессенджер' }),
      },
    }),
  },

  collections: {
    works: collection({
      label: 'Работы',
      slugField: 'title',
      path: 'src/content/works/*',
      format: { data: 'json' },
      columns: ['title', 'cardSize', 'showOnHome'],
      schema: {
        title: fields.slug({ name: { label: 'Название' } }),
        shortDescription: fields.text({ label: 'Короткое описание', multiline: true }),
        categoryTags: fields.array(
          fields.relationship({ label: 'Рубрика', collection: 'categories' }),
          { label: 'Рубрики', itemLabel: (p) => p.value ?? 'Рубрика' },
        ),
        /*
          Размер карточки определяет, каким блоком работа встанет на /works. Страница идёт
          по работам в порядке сортировки и сама собирает блоки: подряд идущие «маленькие»
          складываются в один ряд, «split» — в баннеры по две, «широкая» занимает блок целиком.
        */
        cardSize: fields.select({
          label: 'Как показывать на /works',
          options: [
            { label: 'Широкая — на всю ширину, с названием и описанием', value: 'wide' },
            { label: 'Split — половина ширины, в паре с соседней', value: 'split' },
            { label: 'Маленькая — в ряду из четырёх', value: 'small' },
          ],
          defaultValue: 'small',
        }),
        showOnHome: fields.checkbox({ label: 'Показывать на главной в Last Projects' }),
        heroImage: image('Главное изображение', 'works'),
        order: fields.integer({ label: 'Порядок сортировки', defaultValue: 0 }),
        process: fields.relationship({ label: 'Связанный процесс', collection: 'processes' }),
        // Состав и порядок блоков галереи задаёт редактор — вёрстка не завязана на их число.
        galleryBlocks: fields.array(
          fields.object({
            type: fields.select({
              label: 'Тип блока',
              options: [
                { label: 'На всю ширину (1 изображение)', value: 'full' },
                { label: 'Две части (2 изображения)', value: 'split-2' },
                { label: 'Четыре части (4 изображения)', value: 'split-4' },
              ],
              defaultValue: 'full',
            }),
            images: fields.array(
              fields.object({
                src: image('Изображение', 'works'),
                alt: fields.text({ label: 'Alt' }),
              }),
              { label: 'Изображения', itemLabel: (p) => p.fields.alt.value || 'Изображение' },
            ),
          }),
          {
            label: 'Галерея',
            itemLabel: (p) => `${p.fields.type.value} — ${p.fields.images.elements.length} изобр.`,
          },
        ),
      },
    }),

    skills: collection({
      label: 'Skill-карточки',
      slugField: 'title',
      path: 'src/content/skills/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Заголовок' } }),
        // Карточки не кликабельны — ссылки/слага для перехода здесь нет намеренно.
        icon: image('Иллюстрация', 'skills'),
        description: fields.text({ label: 'Описание', multiline: true }),
        order: fields.integer({ label: 'Порядок', defaultValue: 0 }),
      },
    }),

    processes: collection({
      label: 'Процессы',
      slugField: 'title',
      path: 'src/content/processes/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Название' } }),
        problem: fields.text({ label: 'Проблема без роли', multiline: true }),
        action: fields.text({ label: 'Что делает роль', multiline: true }),
      },
    }),

    categories: collection({
      label: 'Рубрики',
      slugField: 'title',
      path: 'src/content/categories/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Название' } }),
        order: fields.integer({ label: 'Порядок в табах', defaultValue: 0 }),
      },
    }),
  },
});
