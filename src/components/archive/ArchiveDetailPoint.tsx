import { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Quote, MapPin, Calendar } from "lucide-react";
import "./ArchiveDetail.css";
import { useNotesByPointId } from "../../hooks/notes/useNotesByPointId";
import { usePointById } from "../../hooks/points/usePointById";
import { useDiaries } from "../../hooks/diaries/useDiaries";
import type { NoteResponse } from "../../types/note/note.type";
import type { PointResponse } from "../../types/point/point.type";

interface ArchiveDetailPointProps {
  pointId: number;
  // Если задан — показываем только это свидетельство (клик по маркеру
  // нефиксированного места), иначе — все свидетельства места.
  selectedNoteId?: number | null;
  // Если задан — показываем только свидетельства, прошедшие активные
  // фильтры/поиск (null — ограничений нет, показываем все).
  noteIdFilter?: Set<number> | null;
  onClose: () => void;
}

// "1942-01-14" -> "14.01.1942"
function formatDottedDate(isoDate?: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

// "Никулин Анисим Прокопьевич" (Фамилия Имя Отчество)
function formatAuthorName(note: NoteResponse): string {
  return [note.lastName, note.firstName, note.middleName]
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

// Чипы: только тематические теги (золотые).
function buildChips(note: NoteResponse): string[] {
  const chips = (note.tags?.map((tag) => tag.name) ?? [])
    .map((chip) => chip.trim())
    .filter(Boolean);
  return [...new Set(chips)];
}

function ArchiveDetailPoint({
  pointId,
  selectedNoteId,
  noteIdFilter,
  onClose,
}: ArchiveDetailPointProps) {
  const { data: notes, isLoading, isError } = useNotesByPointId(pointId);
  const { data: point } = usePointById(pointId);
  const { data: diaries } = useDiaries();

  const authorIdByDiary = useMemo(() => {
    const map = new Map<number, number>();
    for (const diary of diaries ?? []) map.set(diary.diaryId, diary.author.authorId);
    return map;
  }, [diaries]);

  const allNotes = notes ?? [];
  const visibleNotes =
    selectedNoteId != null
      ? allNotes.filter((note) => note.noteId === selectedNoteId)
      : noteIdFilter != null
        ? allNotes.filter((note) => noteIdFilter.has(note.noteId))
        : allNotes;

  if (isLoading) {
    return (
      <aside className="archive-panel archive-panel--detail">Загрузка...</aside>
    );
  }

  if (isError) {
    return (
      <aside className="archive-panel archive-panel--detail">
        Ошибка загрузки
      </aside>
    );
  }

  const address = formatAddress(point);

  return (
    <aside className="archive-panel archive-panel--detail">
      <button
        type="button"
        className="testimony-back"
        onClick={onClose}
        aria-label="Закрыть свидетельство"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
      </button>

      <div className="testimony-scroll">
        {visibleNotes.map((note) => {
          const chips = buildChips(note);
          return (
            <Fragment key={note.noteId}>
              <article className="testimony-card">
                <div className="testimony-card__quote">
                  <span className="testimony-card__badge" aria-hidden="true">
                    <Quote size={22} fill="#ffffff" stroke="none" />
                  </span>
                  <p className="testimony-card__text">{note.citation}</p>
                </div>

                <p className="testimony-card__author">
                  —{" "}
                  {authorIdByDiary.get(note.diaryId) ? (
                    <Link
                      className="testimony-card__author-link"
                      to={`/authors/${authorIdByDiary.get(note.diaryId)}`}
                    >
                      {formatAuthorName(note)}
                    </Link>
                  ) : (
                    formatAuthorName(note)
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
                      <span key={chip} className="testimony-card__tag">
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {note.source && (
                  <p className="testimony-card__source">{note.source}</p>
                )}
              </article>
            </Fragment>
          );
        })}
      </div>
    </aside>
  );
}

export default ArchiveDetailPoint;
