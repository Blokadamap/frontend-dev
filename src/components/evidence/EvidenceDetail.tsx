import { Link } from "react-router-dom";
import { X, Quote, MapPin, Calendar } from "lucide-react";
import { useDetailNote } from "../../hooks/notes/useDeatilNote";
import type { NoteDetailed } from "../../types/note/note.type";
import "../archive/ArchiveDetail.css";
import "./EvidenceDetail.css";

// "1942-01-14" -> "14.01.1942"
function formatDottedDate(isoDate?: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

function authorName(note: NoteDetailed): string {
  return [note.authorLastName, note.authorFirstName, note.authorMiddleName]
    .filter(Boolean)
    .join(" ");
}

/**
 * Всплывающая деталь свидетельства — повторяет оформление карточки на карте
 * (ArchiveDetailPoint): цитата, автор, дата, место, теги, источник.
 */
function EvidenceDetail({
  noteId,
  onClose,
}: {
  noteId: number;
  onClose: () => void;
}) {
  const { data: note, isLoading, isError } = useDetailNote(noteId);

  const place = note?.points?.[0];
  const chips = [...new Set((note?.tags ?? []).map((t) => t.name).filter(Boolean))];

  return (
    <aside className="evidence-detail archive-panel archive-panel--detail">
      <button
        type="button"
        className="evidence-detail__close"
        onClick={onClose}
        aria-label="Закрыть свидетельство"
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      {isLoading ? (
        <p className="evidence-detail__status">Загрузка…</p>
      ) : isError || !note ? (
        <p className="evidence-detail__status">Не удалось загрузить свидетельство.</p>
      ) : (
          <div className="testimony-scroll">
            <article className="testimony-card">
              {note.createdAt && (
                <div className="testimony-card__meta-row testimony-card__date-top">
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

              <div className="testimony-card__quote">
                <span className="testimony-card__badge" aria-hidden="true">
                  <Quote size={22} fill="#ffffff" stroke="none" />
                </span>
                <p className="testimony-card__text">{note.citation}</p>
              </div>

              <p className="testimony-card__author">
                —{" "}
                {note.authorId ? (
                  <Link
                    className="testimony-card__author-link"
                    to={`/authors/${note.authorId}`}
                    onClick={onClose}
                  >
                    {authorName(note)}
                  </Link>
                ) : (
                  authorName(note)
                )}
              </p>

              <div className="testimony-card__divider" />

              <div className="testimony-card__meta">
                {place?.name && (
                  <div className="testimony-card__meta-row testimony-card__meta-row--place">
                    <MapPin
                      className="testimony-card__meta-icon"
                      size={20}
                      strokeWidth={2}
                    />
                    <div className="testimony-card__place">
                      <span className="testimony-card__place-name">
                        {place.name}
                      </span>
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
          </div>
        )}
    </aside>
  );
}

export default EvidenceDetail;
