import { ArrowLeft, Quote, MapPin, Calendar } from "lucide-react";
import {
  buildMetaLine,
  formatHumanDate,
} from "../../utils/archive";
import "./ArchiveDetail.css";
import { useDiaryById } from "../../hooks/diaries/useDiaryById";
import { useNotesByDiary } from "../../hooks/diaries/useNotesByDiary";

interface ArchiveDetailProps {
  diaryId: number;
  onClose: () => void;
}

function ArchiveDetail({ diaryId, onClose }: ArchiveDetailProps) {
  const { data: notes, isLoading, isError } = useNotesByDiary(diaryId);
  const { data: diary } = useDiaryById(diaryId);

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
            {buildMetaLine(diary)}
          </span>
          <div className="archive-detail__date-wrapper">
            <Calendar size={14} className="text-[#D8AE76]" />
            <strong>{diary?.diaryStartedAt ? formatHumanDate(diary?.diaryStartedAt) : "-"}</strong>
          </div>
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

          {/* Карточка локации */}
          <div className="archive-detail__location-card">
            <div className="archive-detail__section-label">
              <MapPin size={12} className="inline mr-1" /> Локация
            </div>
            <div className="archive-detail__location-info">
              <a
                href="#record-location"
                className="archive-detail__location-title"
              >
                {note.temporality?.name}
              </a>
              {/* <p className="archive-detail__location-address">
                {record.location.district}, {record.location.street},{" "}
                {record.location.building}
              </p>
              <small className="archive-detail__location-full-address">
                {record.location.address}
              </small> */}
            </div>
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

export default ArchiveDetail;
