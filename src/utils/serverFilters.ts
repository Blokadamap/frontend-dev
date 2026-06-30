import type { ArchiveFiltersType } from "../store/archiveAtoms";
import type { FilterItem } from "../types/common/common.types";

function csv(items: FilterItem[]): string {
  return items.map((item) => item.id).join(",");
}

// Активны ли фильтры персоналии по атрибутам автора (без выбора конкретного
// автора в выпадающем списке — он обрабатывается отдельно через author_ids).
export function isAuthorAttrActive(f: ArchiveFiltersType): boolean {
  return (
    f.genders.length > 0 ||
    !!f.birthdayStart ||
    !!f.birthdayEnd ||
    !!f.hasChildren ||
    f.politicalParties.length > 0 ||
    f.educations.length > 0 ||
    f.occupations.length > 0 ||
    f.cards.length > 0 ||
    f.familyStatuses.length > 0 ||
    f.nationalities.length > 0 ||
    f.religions.length > 0 ||
    f.socialClasses.length > 0
  );
}

// Активны ли фильтры вкладки «Общее» (уровень свидетельства).
export function isNoteFilterActive(f: ArchiveFiltersType): boolean {
  return (
    f.noteTypes.length > 0 ||
    f.temporalities.length > 0 ||
    f.tags.length > 0 ||
    f.organizations.length > 0 ||
    f.cityNames.length > 0 ||
    f.geoNames.length > 0 ||
    !!f.startDate ||
    !!f.endDate
  );
}

// Query-параметры для GET /api/v1/authors/ (серверная фильтрация авторов).
export function buildAuthorParams(f: ArchiveFiltersType): Record<string, string> {
  const params: Record<string, string> = {};
  // sex принимает одно значение; если выбраны оба пола — ограничения нет.
  if (f.genders.length === 1) params.sex = f.genders[0];
  if (f.birthdayStart) params.birth_date_from = f.birthdayStart;
  if (f.birthdayEnd) params.birth_date_to = f.birthdayEnd;
  // Наличие детей: "yes"/"no" → has_children=true/false.
  if (f.hasChildren) params.has_children = f.hasChildren === "yes" ? "true" : "false";
  if (f.familyStatuses.length) params.family_status_ids = csv(f.familyStatuses);
  if (f.socialClasses.length) params.social_class_ids = csv(f.socialClasses);
  if (f.nationalities.length) params.nationality_ids = csv(f.nationalities);
  if (f.religions.length) params.religion_ids = csv(f.religions);
  if (f.educations.length) params.education_ids = csv(f.educations);
  if (f.occupations.length) params.occupation_ids = csv(f.occupations);
  if (f.politicalParties.length)
    params.political_party_ids = csv(f.politicalParties);
  return params;
}

// Query-параметры для GET /api/v1/notes/ (серверная фильтрация свидетельств).
// authorIds — ограничение по авторам (из выбранного автора и/или фильтров
// персоналии); null означает «без ограничения по автору».
export function buildNoteParams(
  f: ArchiveFiltersType,
  authorIds: number[] | null,
  search?: string,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (f.noteTypes.length) params.note_type_ids = csv(f.noteTypes);
  if (f.temporalities.length) params.temporality_ids = csv(f.temporalities);
  if (f.tags.length) params.tag_ids = csv(f.tags);
  if (f.organizations.length) params.organization_ids = csv(f.organizations);
  if (f.cityNames.length) params.city_name_ids = csv(f.cityNames);
  if (f.geoNames.length) params.geo_name_ids = csv(f.geoNames);
  if (f.startDate) params.date_from = f.startDate;
  if (f.endDate) params.date_to = f.endDate;
  if (authorIds != null) params.author_ids = authorIds.join(",");
  // Поиск по тексту свидетельства (бэкенд ищет по citation/source).
  const query = (search ?? "").trim();
  if (query) params.search = query;
  return params;
}
