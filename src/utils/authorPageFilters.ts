import type { FilterItem } from "../types/common/common.types";
import type { AuthorDetailed } from "../types/author/author.type";

/** Состояние фильтров на странице «Авторы дневников» (повторяет вкладку
 *  «Автор» на карте). Хранится локально на странице, не связано с картой. */
export interface AuthorPageFilters {
  search: string;
  authorId: number | null;
  birthFrom: string;
  birthTo: string;
  genders: ("M" | "F")[];
  hasChildren: "" | "yes" | "no";
  politicalParties: FilterItem[];
  educations: FilterItem[];
  occupations: FilterItem[];
  cards: FilterItem[];
  familyStatuses: FilterItem[];
  nationalities: FilterItem[];
  religions: FilterItem[];
  socialClasses: FilterItem[];
}

export const EMPTY_AUTHOR_FILTERS: AuthorPageFilters = {
  search: "",
  authorId: null,
  birthFrom: "",
  birthTo: "",
  genders: [],
  hasChildren: "",
  politicalParties: [],
  educations: [],
  occupations: [],
  cards: [],
  familyStatuses: [],
  nationalities: [],
  religions: [],
  socialClasses: [],
};

const intersects = (have: FilterItem[], picked: FilterItem[]) =>
  picked.length === 0 || picked.some((p) => have.some((x) => x.id === p.id));

/** Подходит ли автор под выбранные фильтры (OR внутри категории, AND между). */
export function authorMatchesFilters(
  author: AuthorDetailed,
  f: AuthorPageFilters,
): boolean {
  if (f.authorId != null && author.authorId !== f.authorId) return false;

  if (f.search.trim()) {
    const full = [author.lastName, author.firstName, author.middleName]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ru-RU");
    if (!full.includes(f.search.trim().toLocaleLowerCase("ru-RU"))) return false;
  }

  if (f.birthFrom && (!author.birthDate || author.birthDate < f.birthFrom))
    return false;
  if (f.birthTo && (!author.birthDate || author.birthDate > f.birthTo))
    return false;

  if (f.genders.length && !f.genders.includes(author.sex)) return false;
  if (f.hasChildren === "yes" && !author.hasChildren) return false;
  if (f.hasChildren === "no" && author.hasChildren) return false;

  if (!intersects(author.politicalParties, f.politicalParties)) return false;
  if (!intersects(author.educations, f.educations)) return false;
  if (!intersects(author.occupations, f.occupations)) return false;
  if (!intersects(author.cards, f.cards)) return false;
  if (!intersects(author.nationalities, f.nationalities)) return false;
  if (!intersects(author.religions, f.religions)) return false;
  if (!intersects(author.socialClasses, f.socialClasses)) return false;

  if (
    f.familyStatuses.length &&
    !(author.familyStatus &&
      f.familyStatuses.some((p) => p.id === author.familyStatus!.id))
  )
    return false;

  return true;
}

/** Сколько фильтров активно (для бейджа на кнопке). */
export function countActiveAuthorFilters(f: AuthorPageFilters): number {
  let n = 0;
  if (f.authorId != null) n++;
  if (f.birthFrom) n++;
  if (f.birthTo) n++;
  if (f.genders.length) n++;
  if (f.hasChildren) n++;
  n += f.politicalParties.length ? 1 : 0;
  n += f.educations.length ? 1 : 0;
  n += f.occupations.length ? 1 : 0;
  n += f.cards.length ? 1 : 0;
  n += f.familyStatuses.length ? 1 : 0;
  n += f.nationalities.length ? 1 : 0;
  n += f.religions.length ? 1 : 0;
  n += f.socialClasses.length ? 1 : 0;
  return n;
}
