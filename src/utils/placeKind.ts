// «Тип места» (Здание / Другое) — это группировка над списком «Подтип»
// (point_type). В БД она не хранится: полностью выводится из подтипа.
// Здание = {Жилой дом, Учреждение/предприятие}; всё остальное — Другое.

import type { PointTypeItem } from "../types/point/point.type";

export type PlaceKind = "building" | "other";

// Имена point_type, которые относятся к группе «Здание».
export const BUILDING_TYPE_NAMES = [
  "Жилой дом",
  "Учреждение/предприятие",
] as const;

export const PLACE_KIND_LABELS: Record<PlaceKind, string> = {
  building: "Здание",
  other: "Другое",
};

function norm(value?: string | null): string {
  return (value ?? "").trim();
}

export function isBuildingTypeName(name?: string | null): boolean {
  return (BUILDING_TYPE_NAMES as readonly string[]).includes(norm(name));
}

export function kindOfTypeName(name?: string | null): PlaceKind {
  return isBuildingTypeName(name) ? "building" : "other";
}

// Подтипы (point_type), относящиеся к выбранной группе «Тип места».
export function typesForKind(
  types: PointTypeItem[] | undefined,
  kind: PlaceKind | "",
): PointTypeItem[] {
  if (!types) return [];
  if (!kind) return types;
  return types.filter((t) => kindOfTypeName(t.name) === kind);
}
