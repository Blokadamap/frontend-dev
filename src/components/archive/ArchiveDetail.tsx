import { ArrowLeft, Quote, MapPin, Calendar } from "lucide-react";
import type { WitnessRecord } from "../../types/archive";
import {
  buildMetaLine,
  formatHumanDate,
  getSignificanceAccent,
  getWitnessAccent,
} from "../../utils/archive";

interface ArchiveDetailProps {
  record: WitnessRecord;
  onClose: () => void;
}

function ArchiveDetail({ record, onClose }: ArchiveDetailProps) {
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
            {buildMetaLine(record)}
          </span>
          <div className="archive-detail__date-wrapper">
             <Calendar size={14} className="text-[#D8AE76]" />
             <strong>{formatHumanDate(record.date)}</strong>
          </div>
        </div>
      </div>

      {/* Основной контент: Цитата */}
      <div className="archive-detail__body">
        <div className="archive-detail__quote-wrapper">
          <Quote className="archive-detail__quote-icon" size={40} fill="#D8AE76" stroke="none" />
          <p className="archive-detail__text">
            {record.content}
          </p>
        </div>
        <footer className="archive-detail__author-signature">
          — {record.author.fullName}
        </footer>
      </div>

      {/* Карточка локации */}
      <div className="archive-detail__location-card">
        <div className="archive-detail__section-label">
          <MapPin size={12} className="inline mr-1" /> Локация
        </div>
        <div className="archive-detail__location-info">
          <a href="#record-location" className="archive-detail__location-title">
            {record.location.title}
          </a>
          <p className="archive-detail__location-address">
            {record.location.district}, {record.location.street}, {record.location.building}
          </p>
          <small className="archive-detail__location-full-address">{record.location.address}</small>
        </div>
      </div>

      {/* Теги */}
      <div className="archive-tag-row">
        {record.tags.map((tag) => (
          <span key={tag} className={`chip ${getSignificanceAccent(record.significance)}`}>
            {tag}
          </span>
        ))}
        <span className={`chip ${getWitnessAccent(record.witnessKind)}`}>
          {record.witnessKind}
        </span>
      </div>
    </aside>
  );
}

export default ArchiveDetail;
