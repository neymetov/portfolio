// Дата проекта выводится месяцем и годом: «July 2026». День не показываем,
// поэтому в CMS можно выбрать любое число нужного месяца.
export const monthYear = (date: string | null | undefined) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;
