import { atom } from 'jotai';
import type { ArchivePanel, FilterTab, MapLayerId } from '../types/archive';
import type { NoteFilters } from '../types/note/note.type';
import type { AuthorFilters } from '../types/author/author.type';
import type { WritableAtom } from 'jotai';

export const searchAtom = atom('');
export const activePanelAtom = atom<ArchivePanel | null>('results');
export const activeFilterTabAtom = atom<FilterTab>('general');
export const selectedLayerAtom = atom<MapLayerId>('modern');
export const selectedRecordIdAtom = atom<number | null>(null);

export interface ObjectFiltersType extends AuthorFilters, NoteFilters {}

export interface ArrayFiltersType {
    genders: string[];
}

export interface ScalarFiltersType {
    startDate: string;
    endDate: string;
    authorId: number | null;
    birthdayStart: string;
    birthdayEnd: string
    district: string
    space: string
    street: string
    building: string
    address: string
}

export interface ArchiveFiltersType extends ObjectFiltersType, ArrayFiltersType, ScalarFiltersType {}

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
};

export const defaultArrayFilters: ArrayFiltersType = {
    genders: []
}

export const defaultScalarFilters: ScalarFiltersType = {
    startDate: "",
    endDate: "",
    authorId: null,
    birthdayStart: "",
    birthdayEnd: "",
    district: "",
    space: "",
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


