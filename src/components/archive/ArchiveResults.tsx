import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Quote, MapPin, Calendar } from "lucide-react";
import type { NoteListItem } from "../../types/note/note.type";
import type { DiaryResponse } from "../../types/diary/diary.types";
import type { PointResponse } from "../../types/point/point.type";
import "./ArchiveResults.css";
import "./ArchiveDetail.css";

interface ArchiveResultsProps {
  notes: NoteListItem[];
  diaries: DiaryResponse[];
  points: PointResponse[];
  searchValue: string;
  visibleCount: number;
  onShowMore: () => void;
}

// "1942-01-14" -> "14.01.1942"
function formatDottedDate(isoDate?: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

// "Никулин Анисим Прокопьевич" (Фамилия Имя Отчество)
function formatAuthorName(diary?: DiaryResponse): string {
  if (!diary) return "";
  return [diary.author.lastName, diary.author.firstName, diary.author.middleName]
    .filter(Boolean)
    .join(" ");
}

// "Куйбышевский район, пр. 25 Октября, 35"
function formatAddress(point?: PointResponse): string {
  if (!point) return "";
  return [
    point.rayon?.name ? `${point.rayon.name} район` : "",
    point.street,
    point.building,
  ]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function buildChips(note: NoteListItem): string[] {
  const chips = (note.tags?.map((tag) => tag.name) ?? [])
    .map((chip) => chip.trim())
    .filter(Boolean);
  return [...new Set(chips)];
}

function ArchiveResults({
  notes,
  diaries,
  points,
  searchValue,
  visibleCount,
  onShowMore,
}: ArchiveResultsProps) {
  const [isCountExpanded, setIsCountExpanded] = useState(false);
  const isSearching = searchValue.trim().length > 0;

  // Справочники для подстановки автора и места в карточку свидетельства.
  const diaryById = useMemo(() => {
    const map = new Map<number, DiaryResponse>();
    for (const diary of diaries) map.set(diary.diaryId, diary);
    return map;
  }, [diaries]);

  const pointById = useMemo(() => {
    const map = new Map<number, PointResponse>();
    for (const point of points) map.set(point.pointId, point);
    return map;
  }, [points]);

  // Свидетельства в хронологическом порядке (по дате записи).
  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [notes],
  );

  const visibleNotes = sortedNotes.slice(0, visibleCount);
  const showEmpty = sortedNotes.length === 0;

  return (
    <section
      className={`archive-panel archive-panel--results custom-scrollbar ${
        !isCountExpanded ? "is-collapsed" : ""
      }`}
    >
      <div className="archive-panel__header">
        <div>
          <p className="archive-panel__eyebrow">Цитаты и свидетельства</p>
          <h2 className="archive-results__main-title">
            {isSearching
              ? `Результаты по запросу «${searchValue.trim()}»`
              : "Свежая выборка"}
          </h2>
        </div>

        {/* Кнопка-бадж управляет видимостью списка свидетельств. */}
        <button
          type="button"
          onClick={() => setIsCountExpanded(!isCountExpanded)}
          className={`archive-results__interactive-badge ${
            isCountExpanded ? "is-active" : ""
          }`}
        >
          Всего свидетельств • {sortedNotes.length}
        </button>
      </div>

      {isCountExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2">
          {showEmpty ? (
            <div className="archive-empty-state">
              <p>Ничего не найдено</p>
              <span>Попробуйте изменить фильтры</span>
            </div>
          ) : (
            <div className="archive-results__content">
              <div className="testimony-scroll">
                {visibleNotes.map((note) => {
                  const chips = buildChips(note);
                  const diary = diaryById.get(note.diaryId);
                  const point =
                    note.pointIds.length > 0
                      ? pointById.get(note.pointIds[0])
                      : undefined;
                  const address = formatAddress(point);

                  return (
                    <Fragment key={note.noteId}>
                      <article className="testimony-card">
                        <div className="testimony-card__quote">
                          <span
                            className="testimony-card__badge"
                            aria-hidden="true"
                          >
                            <Quote size={22} fill="#ffffff" stroke="none" />
                          </span>
                          <p className="testimony-card__text">
                            {note.citation}
                          </p>
                        </div>

                        <p className="testimony-card__author">
                          —{" "}
                          {diary?.author?.authorId ? (
                            <Link
                              className="testimony-card__author-link"
                              to={`/authors/${diary.author.authorId}`}
                            >
                              {formatAuthorName(diary)}
                            </Link>
                          ) : (
                            formatAuthorName(diary)
                          )}
                        </p>

                        <div className="testimony-card__divider" />

                        <div className="testimony-card__meta">
                          {note.createdAt && (
                            <div className="testimony-card__meta-row">
                              <Calendar
                                className="testimony-card__meta-icon"
                                size={20}
                                strokeWidth={2}
                              />
                              <span className="testimony-card__date">
                                {formatDottedDate(note.createdAt)}
                              </span>
                            </div>
                          )}

                          {point?.name && (
                            <div className="testimony-card__meta-row testimony-card__meta-row--place">
                              <MapPin
                                className="testimony-card__meta-icon"
                                size={20}
                                strokeWidth={2}
                              />
                              <div className="testimony-card__place">
                                <span className="testimony-card__place-name">
                                  {point.name}
                                </span>
                                {address && (
                                  <span className="testimony-card__place-address">
                                    {address}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {chips.length > 0 && (
                          <div className="testimony-card__tags">
                            {chips.map((chip) => (
                              <span
                                key={chip}
                                className="testimony-card__tag"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}

                        {note.source && (
                          <p className="testimony-card__source">
                            {note.source}
                          </p>
                        )}
                      </article>
                    </Fragment>
                  );
                })}
              </div>

              {visibleCount < sortedNotes.length && (
                <button
                  type="button"
                  className="archive-show-more-btn"
                  onClick={onShowMore}
                >
                  Показать ещё свидетельства
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ArchiveResults;
