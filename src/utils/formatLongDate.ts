const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

/** "1942-01-14" -> "14 января 1942 г." */
export function formatLongDate(isoDate?: string | null): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  const m = Number(month);
  if (!year || !m || !day) return isoDate;
  return `${Number(day)} ${MONTHS_RU[m - 1]} ${year} г.`;
}
