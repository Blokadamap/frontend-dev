import { atom } from 'jotai';
import type { ArchivePanel, FilterTab, MapLayerId } from '../types/archive';
import type { NoteFilters } from '../types/note/note.type';
import type { AuthorFilters } from '../types/author/author.type';
import type { WritableAtom } from 'jotai';

export const searchAtom = atom('');
// При загрузке страницы панель закрыта — на карте видны только строка
// поиска с кнопкой фильтров и переключатель слоёв (как в прототипе).
export const activePanelAtom = atom<ArchivePanel | null>(null);
export const activeFilterTabAtom = atom<FilterTab>('general');
// По умолчанию показываем спутниковый слой (Esri World Imagery).
export const selectedLayerAtom = atom<MapLayerId>('retro');
export const selectedRecordIdAtom = atom<number | null>(null);

// Личности (personalities) намеренно исключены: справочник используется
// только в админке, в фильтры карты не выводится.
export type ObjectFiltersType = AuthorFilters & Omit<NoteFilters, 'personalities'>;

export interface ArrayFiltersType {
    genders: string[];
}

export interface ScalarFiltersType {
    startDate: string;
    endDate: string;
    authorId: number | null;
    birthdayStart: string;
    birthdayEnd: string
    hasChildren: string
    district: string
    space: string
    placeKind: string
    pointType: string
    pointSubtype: string
    pointSubsubtype: string
    street: string
    building: string
    address: string
}

export type ArchiveFiltersType = ObjectFiltersType & ArrayFiltersType & ScalarFiltersType;

export const defaultObjectFilters: ObjectFiltersType = {
    familyStatuses: [],
    socialClasses: [],
    nationalities: [],
    religions: [],
    educations: [],
    occupations: [],
    politicalParties: [],
    cards: [],
    tags: [],
    noteTypes: [],
    temporalities: [],
    organizations: [],
    cityNames: [],
    geoNames: [],
};

export const defaultArrayFilters: ArrayFiltersType = {
    genders: []
}

export const defaultScalarFilters: ScalarFiltersType = {
    // По умолчанию временной промежуток предзаполнен годами блокады/войны:
    // 1 января 1941 — 31 декабря 1945 (формат date-инпута YYYY-MM-DD).
    startDate: "1941-01-01",
    endDate: "1945-12-31",
    authorId: null,
    birthdayStart: "",
    birthdayEnd: "",
    hasChildren: "",
    district: "",
    space: "",
    placeKind: "",
    pointType: "",
    pointSubtype: "",
    pointSubsubtype: "",
    street: "",
    building: "",
    address: ""
}

const createFilterAtom = <T>(initial: T): WritableAtom<T, [update: Partial<T> | ((prev: T) => T)], void> => {
  const base = atom<T>(initial)

  const derived = atom(
    (get) => get(base),
    (get, set, update: Partial<T> | ((prev: T) => T)) => {
      const prev = get(base)

      const next =
        typeof update === "function"
          ? update(prev)
          : { ...prev, ...update }

      set(base, next)
    }
  )

  return derived
}

export const archiveObjectFilters = createFilterAtom(defaultObjectFilters)
export const archiveArrayFilters = createFilterAtom(defaultArrayFilters)
export const archiveScalarFilters = createFilterAtom(defaultScalarFilters)

export const archiveFilters = atom<ArchiveFiltersType>((get) => ({
  ...get(archiveObjectFilters),
  ...get(archiveArrayFilters),
  ...get(archiveScalarFilters),
}));

export const resetArchiveFiltersAtom = atom(null, (_, set) => {
  set(archiveObjectFilters, defaultObjectFilters)
  set(archiveArrayFilters, defaultArrayFilters)
  set(archiveScalarFilters, defaultScalarFilters)
})


