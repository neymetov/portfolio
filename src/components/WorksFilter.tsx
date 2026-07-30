import { useRef, useState } from 'react';

// Единственный интерактивный остров на сайте: табы рубрик на /works.
// Разметку карточек рендерит Astro на сборке — здесь только показ/скрытие по рубрике.
//
// Вид из макета (фрейм `tab`): текст h5 bold, активный — neutral-900, остальные — neutral-400,
// а под курсором неактивный темнеет до neutral-500.
// Зазор между табами space-l, вертикальный отступ space-xs. На мобильном ряд листается по X.
//
// При смене рубрики блоки работ уезжают в сторону, противоположную движению по табам,
// и возвращаются с другой стороны. Сами стили перехода лежат в works.astro рядом с разметкой,
// здесь только переключение data-anim по шагам.

export interface Category {
  id: string;
  title: string;
}

interface Props {
  categories: Category[];
  allLabel?: string;
}

const ALL = '__all__';
const LEAVE_MS = 170;

export default function WorksFilter({ categories, allLabel = 'All' }: Props) {
  const [active, setActive] = useState(ALL);
  const activeIndex = useRef(0);

  const applyFilter = (id: string) => {
    for (const node of document.querySelectorAll<HTMLElement>('[data-work-categories]')) {
      const tags = (node.dataset.workCategories ?? '').split(' ').filter(Boolean);
      node.hidden = id !== ALL && !tags.includes(id);
    }
    // Ряды, в которых после фильтрации не осталось карточек, скрываем целиком —
    // иначе на странице остаются пустые отступы.
    for (const row of document.querySelectorAll<HTMLElement>('[data-works-row]')) {
      const items = [...row.querySelectorAll<HTMLElement>('[data-work-categories]')];
      row.hidden = items.length > 0 && items.every((item) => item.hidden);
    }
  };

  const select = (id: string, index: number) => {
    if (id === active) return;

    const forward = index > activeIndex.current;
    activeIndex.current = index;
    setActive(id);

    const rows = [...document.querySelectorAll<HTMLElement>('[data-works-row]')];
    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (instant) {
      applyFilter(id);
      return;
    }

    // Уходим в сторону, откуда «пришёл» новый таб, возвращаемся с противоположной.
    for (const row of rows) row.dataset.anim = forward ? 'out-left' : 'out-right';

    window.setTimeout(() => {
      applyFilter(id);
      for (const row of rows) row.dataset.anim = forward ? 'in-right' : 'in-left';
      // Два кадра: первый применяет стартовое смещение без перехода, второй запускает переход.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          for (const row of rows) delete row.dataset.anim;
        }),
      );
    }, LEAVE_MS);
  };

  const tabs = [{ id: ALL, title: allLabel }, ...categories];

  return (
    <div role="tablist" className="tabs hscroll">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={active === tab.id}
          className="tab t-h5"
          onClick={() => select(tab.id, index)}
        >
          {tab.title}
        </button>
      ))}
      <style>{`
        .tabs { align-items: center; gap: var(--space-l); }
        .tab {
          flex: none;
          padding: var(--space-xs) 0;
          border: 0;
          background: none;
          color: var(--color-neutral-400);
          white-space: nowrap;
          cursor: pointer;
          transition: color 160ms ease;
        }
        /* Неактивная рубрика под курсором темнеет на один шаг палитры: 400 → 500. */
        .tab:hover:not([aria-selected='true']) { color: var(--color-neutral-500); }
        .tab[aria-selected='true'] { color: var(--color-neutral-900); }
      `}</style>
    </div>
  );
}
