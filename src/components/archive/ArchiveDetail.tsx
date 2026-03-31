import { ArrowLeft } from "lucide-react";
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
      <div className="archive-detail__header">
        <button
          type="button"
          className="archive-detail__back"
          onClick={onClose}
          aria-label="Закрыть свидетельство"
        >
          <ArrowLeft size={17} strokeWidth={2.5} />
        </button>

        <div className="archive-detail__header-copy">
          <span className="archive-detail__eyebrow">{buildMetaLine(record)}</span>
          <strong>{formatHumanDate(record.date)}</strong>
        </div>
      </div>

      <div className="archive-detail__body">
        <p>{record.content}</p>
        <footer>
          {record.author.fullName}, {record.date.split("-").reverse().join("/")}
        </footer>
      </div>

      <div className="archive-detail__location-card">
        <span className="archive-detail__section-label">Локация</span>
        <a href="#record-location">{record.location.title}</a>
        <p>{record.location.district}</p>
        <p>
          {record.location.street}, {record.location.building}
        </p>
        <small>{record.location.address}</small>
      </div>

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
