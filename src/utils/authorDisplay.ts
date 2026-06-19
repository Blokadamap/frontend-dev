import type { AuthorDetailed, AuthorResponse } from "../types/author/author.type";

/** "1895-01-30" -> "30.01.1895" */
export function formatDottedDate(isoDate?: string | null): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

/** "Вайнштейн Владимир Григорьевич" (Фамилия Имя Отчество) */
export function formatAuthorName(
  author: Pick<AuthorDetailed, "lastName" | "firstName" | "middleName">,
): string {
  return [author.lastName, author.firstName, author.middleName]
    .filter(Boolean)
    .join(" ");
}

/**
 * Даты жизни. Дата смерти в БД пока отсутствует — оставляем место пустым:
 * "30.01.1895 г. — "
 */
export function formatLifeDates(
  birthDate?: string | null,
  deathDate?: string | null,
): string {
  const birth = birthDate ? `${formatDottedDate(birthDate)} г.` : "";
  const death = deathDate ? `${formatDottedDate(deathDate)} г.` : "";
  if (!birth && !death) return "";
  return `${birth} — ${death}`.trimEnd();
}

export type { AuthorResponse };
