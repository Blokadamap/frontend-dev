import { atom } from "jotai";
import type { ArchiveFilters, ArchivePanel, FilterTab, MapLayerId } from "../types/archive";

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
export const archiveFiltersAtom = atom<ArchiveFilters>(defaultFilters);
export const activePanelAtom = atom<ArchivePanel | null>("results");
export const activeFilterTabAtom = atom<FilterTab>("general");
export const selectedLayerAtom = atom<MapLayerId>("modern");
export const selectedRecordIdAtom = atom<string | null>(null);