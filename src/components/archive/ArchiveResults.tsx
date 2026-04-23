import { useState } from "react"; 
import { MapPin } from "lucide-react";
import type { WitnessRecord } from "../../types/archive";
import {
  buildRecordExcerpt,
  formatHumanDate,
  groupWitnessesByMonth,
} from "../../utils/archive";
import './ArchiveResults.css';

interface ArchiveResultsProps {
  records: WitnessRecord[];
  searchValue: string;
  selectedRecordId: string | null;
  visibleCount: number;
  onShowMore: () => void;
  onSelect: (recordId: string) => void;
}

function ArchiveResults({
  records,
  searchValue,
  selectedRecordId,
  visibleCount,
  onShowMore,
  onSelect
}: ArchiveResultsProps) {
  const visibleItems = records.slice(0, visibleCount);
  const grouped = groupWitnessesByMonth(visibleItems);
  const showEmpty = records.length === 0;
  const [isCountExpanded, setIsCountExpanded] = useState(false);


  return (
  <section className={`archive-panel archive-panel--results custom-scrollbar ${!isCountExpanded ? 'is-collapsed' : ''}`}>
    <div className="archive-panel__header">
      <div>
        <p className="archive-panel__eyebrow">Цитаты и свидетельства</p>
        <h2 className="archive-results__main-title">
          {searchValue.trim()
            ? `Результаты по запросу «${searchValue.trim()}»`
            : "Свежая выборка"}
        </h2>
      </div>

      {/* Кнопка-бадж теперь управляет видимостью всего контента ниже */}
      <button
        type="button"
        onClick={() => setIsCountExpanded(!isCountExpanded)}
        className={`archive-results__interactive-badge ${isCountExpanded ? 'is-active' : ''}`}
      >
        Всего дневников • {records.length}
      </button>
    </div>

    {/* Весь этот блок теперь показывается только если isCountExpanded === true */}
    {isCountExpanded && (
      <div className="animate-in fade-in slide-in-from-top-2">
        {showEmpty ? (
          <div className="archive-empty-state">
            <p>Ничего не найдено</p>
            <span>Попробуйте изменить фильтры</span>
          </div>
        ) : (
          <div className="archive-results__content">
            <div className="archive-results__groups">
              {grouped.map((group) => (
                <div key={group.label} className="archive-results__group">
                  <div className="archive-results__month">
                     <span>{group.label}</span>
                  </div>

                  {group.items.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      className={`archive-quote-card${
                        selectedRecordId === record.id ? " is-active" : ""
                      }`}
                      onClick={() => onSelect(record.id)}
                    >
                      <div className="archive-quote-card__header">
                        <strong className="archive-quote-card__location">
                          <MapPin size={12} className="inline mr-1 opacity-70" />
                          {record.location.title}
                        </strong>
                        <span className="archive-quote-card__date">
                          {formatHumanDate(record.date)}
                        </span>
                      </div>

                      <p className="archive-quote-card__text">
                        {buildRecordExcerpt(record.summary || record.content, 140)}
                      </p>

                      <footer className="archive-quote-card__footer">
                        <span className="archive-quote-card__author">
                          {record.author.fullName}
                        </span>
                        <span className="archive-quote-card__kind">
                          {record.witnessKind}
                        </span>
                      </footer>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {visibleCount < records.length && (
              <button type="button" className="archive-show-more-btn" onClick={onShowMore}>
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