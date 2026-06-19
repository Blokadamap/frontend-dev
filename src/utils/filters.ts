import type { PointResponse } from "../types/point/point.type";
import type { ArchiveFiltersType } from "../store/archiveAtoms";
import { kindOfTypeName } from "./placeKind";

function norm(value: string | null | undefined): string {
  return (value ?? "").trim();
}

// Адрес точки в едином виде «улица, дом» — используется и в опциях фильтра.
export function buildPointAddress(point: PointResponse): string {
  return [norm(point.street), norm(point.building)].filter(Boolean).join(", ");
}

// Фильтры вкладки «Место» применяются на клиенте к уже загруженным точкам
// (множество маркеров ограничено географией). Серверная фильтрация по
// заметкам/персоналиям обрабатывается отдельно (см. useServerFilter).
export function pointMatchesPlace(
  point: PointResponse,
  f: ArchiveFiltersType,
): boolean {
  if (f.district && norm(point.rayon?.name) !== f.district) return false;
  // «Тип места» Здание/Другое — группировка над подтипом (point_type).
  if (f.placeKind && kindOfTypeName(point.pointType?.name) !== f.placeKind)
    return false;
  if (f.pointType && norm(point.pointType?.name) !== f.pointType) return false;
  if (f.pointSubtype && norm(point.pointSubtype?.name) !== f.pointSubtype)
    return false;
  if (
    f.pointSubsubtype &&
    norm(point.pointSubsubtype?.name) !== f.pointSubsubtype
  )
    return false;
  if (f.street && norm(point.street) !== f.street) return false;
  if (f.building && norm(point.building) !== f.building) return false;
  if (f.address && buildPointAddress(point) !== f.address) return false;
  return true;
}
