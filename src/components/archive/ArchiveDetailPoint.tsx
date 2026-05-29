import { ArrowLeft, Quote, MapPin } from "lucide-react";
import { buildMetaLineForPoint } from "../../utils/archive";
import "./ArchiveDetail.css";
import { useNotesByPointId } from "../../hooks/notes/useNotesByPointId";
import { usePointById } from "../../hooks/points/usePointById";

interface ArchiveDetailPointProps {
  pointId: number;
  onClose: () => void;
}

function ArchiveDetailPoint({ pointId, onClose }: ArchiveDetailPointProps) {
  const { data: notes, isLoading, isError } = useNotesByPointId(pointId);
  const { data: point } = usePointById(pointId);

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

  return (
    <aside className="archive-panel archive-panel--detail">
      {/* Шапка с кнопкой назад и датой */}
      <div className="archive-detail__header">
        <button
          type="button"
          className="archive-detail__back"
          onClick={onClose}
          aria-label="Закрыть свидетельство"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="archive-detail__header-copy">
          <span className="archive-detail__eyebrow">
            {buildMetaLineForPoint(point)}
          </span>
        </div>
      </div>

      <div className="archive-detail__description-card">
        <p className="archive-detail__description-info">
            {point?.description}
        </p>
      </div>

      <div className="archive-detail__location-card">
        <div className="archive-detail__section-label">
          <MapPin size={12} className="inline mr-1" /> Локация
        </div>
        <div className="archive-detail__location-info">
          <a href="#record-location" className="archive-detail__location-title">
            {point?.building}
          </a>
          <p className="archive-detail__location-address">
            {point?.rayon?.name} {"  "} {point?.street}
          </p>
        </div>
      </div>

      {/* Основной контент: Цитата */}
      {notes?.map((note) => (
        <>
          <div className="archive-detail__body">
            <div className="archive-detail__quote-wrapper">
              <Quote
                className="archive-detail__quote-icon"
                size={40}
                fill="#D8AE76"
                stroke="none"
              />
              <p className="archive-detail__text">{note.citation}</p>
            </div>
            <footer className="archive-detail__author-signature">
              — {`${note.middleName} ${note.firstName} ${note.lastName}`}
            </footer>
          </div>

          {/* Теги */}
          <div className="archive-tag-row">
            {note?.tags &&
              note?.tags.map((tag) => (
                <span key={tag.id} className={`chip chip--rose`}>
                  {tag.name}
                </span>
              ))}
            {/* <span className={`chip chip--blue`}>
                    {note.}
                </span> */}
          </div>
        </>
      ))}
    </aside>
  );
}

export default ArchiveDetailPoint;
