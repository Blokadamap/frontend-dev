import type {
  ArchivePayload,
  SignificanceKind,
  WitnessKind,
  WitnessRecord,
} from "../types/archive";
import type { DiaryResponse } from "../types/diary/diary.types";

const collator = new Intl.Collator("ru-RU");

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

const humanDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function buildWitnessRecords(payload: ArchivePayload) {
  const authors = new Map(payload.authors.map((author) => [author.id, author]));
  const locations = new Map(payload.locations.map((location) => [location.id, location]));
  const locationOffsets = new Map<string, number>();

  return payload.testimonies
    .map<WitnessRecord>((testimony) => {
      const author = authors.get(testimony.authorId);
      const location = locations.get(testimony.locationId);

      if (!author || !location) {
        throw new Error(`Archive record ${testimony.id} is missing linked data.`);
      }

      const offsetIndex = locationOffsets.get(location.id) ?? 0;
      locationOffsets.set(location.id, offsetIndex + 1);

      return {
        ...testimony,
        author,
        location,
        markerPosition: offsetCoordinates(location.coordinates, offsetIndex),
        searchIndex: buildSearchIndex(testimony, author.fullName, location),
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));
}

function buildSearchIndex(
  testimony: ArchivePayload["testimonies"][number],
  authorName: string,
  location: ArchivePayload["locations"][number],
) {
  return normalize(
    [
      testimony.title,
      testimony.summary,
      testimony.content,
      authorName,
      location.title,
      location.district,
      location.street,
      location.building,
      location.address,
      testimony.tags.join(" "),
    ].join(" "),
  );
}

function offsetCoordinates([lat, lng]: [number, number], index: number): [number, number] {
  if (index === 0) {
    return [lat, lng];
  }

  const angle = index * 1.7;
  const delta = 0.00115 + index * 0.0002;

  return [lat + Math.cos(angle) * delta * 0.55, lng + Math.sin(angle) * delta];
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

export function groupWitnessesByMonth(records: WitnessRecord[]) {
  const groups = new Map<string, WitnessRecord[]>();

  records.forEach((record) => {
    const key = formatMonthLabel(record.date);
    const current = groups.get(key) ?? [];
    current.push(record);
    groups.set(key, current);
  });

  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

export function formatMonthLabel(date: string) {
  const [monthName, year] = monthFormatter.format(new Date(date)).split(" ");
  const capitalizedMonth = monthName
    ? `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}`
    : "";

  return `${capitalizedMonth} • ${year}`;
}

export function formatHumanDate(date: string) {
  return humanDateFormatter.format(new Date(date));
}

export function buildRecordExcerpt(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, maxLength);
  const lastBoundary = Math.max(slice.lastIndexOf("."), slice.lastIndexOf(" "), slice.lastIndexOf(","));

  if (lastBoundary <= 80) {
    return `${slice.trimEnd()}…`;
  }

  return `${slice.slice(0, lastBoundary).trimEnd()}…`;
}

export function buildFilterOptions(records: WitnessRecord[]) {
  return {
    witnessKinds: unique(records.map((record) => record.witnessKind)),
    retrospectiveKinds: unique(records.map((record) => record.retrospectiveKind)),
    significances: unique(records.map((record) => record.significance)),
    tags: unique(records.flatMap((record) => record.tags)),
    authors: uniqueBy(records.map((record) => record.author), (author) => author.id).sort(
      (left, right) => collator.compare(left.fullName, right.fullName),
    ),
    districts: unique(records.map((record) => record.location.district)),
    spaces: unique(records.map((record) => record.location.space)),
    streets: unique(records.map((record) => record.location.street)),
    buildings: unique(records.map((record) => record.location.building)),
    addresses: unique(records.map((record) => record.location.address)),
  };
}

function unique<T extends string>(values: T[]) {
  return [...new Set(values)].sort((left, right) => collator.compare(left, right));
}

function uniqueBy<T>(values: T[], getKey: (value: T) => string) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = getKey(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function buildMetaLine(diary: DiaryResponse | undefined) {
  if (!diary) return ""
  return `${diary.author.firstName} • ${diary.diarySource}`;
}

export function getSignificanceAccent(significance: SignificanceKind) {
  return significance === "Микрособытие" ? "chip--rose" : "chip--amber";
}

export function getWitnessAccent(kind: WitnessKind) {
  return kind === "Личное" ? "chip--blue" : "chip--green";
}
