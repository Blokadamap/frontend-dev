import { atom } from "jotai";
import type { ArchiveFilters, ArchivePanel, FilterTab, MapLayerId } from "../types/archive";

const MIN_DATE = "1941-01-01";
const MAX_DATE = "1945-12-31";

// Валидатор: не дает датам выйти за пределы войны
const validateDate = (dateStr: string, fallback: string): string => {
  if (!dateStr) return fallback;
  const year = new Date(dateStr).getFullYear();
  if (isNaN(year)) return fallback;
  if (year < 1941) return MIN_DATE;
  if (year > 1945) return MAX_DATE;
  return dateStr;
};

export const defaultFilters: ArchiveFilters = {
  startDate: "1941-06-22",
  endDate: "1945-05-09",
  witnessKinds: [],
  retrospectiveKinds: [],
  significances: [],
  tags: [],
  authorId: "",
  birthDateStart: "",
  birthDateEnd: "",
  genders: [],
  partyStatuses: [],
  district: "",
  space: "",
  street: "",
  building: "",
  address: "",
};

export const searchAtom = atom("");

// Базовый атом
const baseFiltersAtom = atom<ArchiveFilters>(defaultFilters);

// Умный атом: перехватывает изменения и правит даты
export const archiveFiltersAtom = atom(
  (get) => get(baseFiltersAtom),
  (get, set, update: Partial<ArchiveFilters> | ((prev: ArchiveFilters) => ArchiveFilters)) => {
    const prev = get(baseFiltersAtom);
    const next = typeof update === "function" ? update(prev) : { ...prev, ...update };
    
    set(baseFiltersAtom, {
      ...next,
      startDate: validateDate(next.startDate, "1941-01-01"),
      endDate: validateDate(next.endDate, "1945-12-31"),
    });
  }
);

export const activePanelAtom = atom<ArchivePanel | null>("results");
export const activeFilterTabAtom = atom<FilterTab>("general");
export const selectedLayerAtom = atom<MapLayerId>("modern");
export const selectedRecordIdAtom = atom<string | null>(null);
