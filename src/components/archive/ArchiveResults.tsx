import type { WitnessRecord } from "../../types/archive";
import {
  buildRecordExcerpt,
  formatHumanDate,
  groupWitnessesByMonth,
} from "../../utils/archive";

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
  onSelect,
}: ArchiveResultsProps) {
  const visibleItems = records.slice(0, visibleCount);
  const grouped = groupWitnessesByMonth(visibleItems);
  const showEmpty = records.length === 0;

  return (
    <section className="archive-panel archive-panel--results">
      <div className="archive-panel__header">
        <div>
          <p className="archive-panel__eyebrow">Цитаты и свидетельства</p>
          <h2>
            {searchValue.trim()
              ? `Результаты по запросу «${searchValue.trim()}»`
              : "Свежая выборка"}
          </h2>
        </div>
        <span className="archive-panel__count">{records.length}</span>
      </div>

      {showEmpty ? (
        <div className="archive-empty-state">
          <p>Ничего не найдено по текущему запросу.</p>
          <span>Попробуйте снять часть фильтров или изменить формулировку поиска.</span>
        </div>
      ) : (
        <>
          <div className="archive-results__groups">
            {grouped.map((group) => (
              <div key={group.label} className="archive-results__group">
                <div className="archive-results__month">{group.label}</div>

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
                      <strong>{record.location.title}</strong>
                      <span>{formatHumanDate(record.date)}</span>
                    </div>

                    <p>{buildRecordExcerpt(record.summary || record.content, 165)}</p>

                    <footer>
                      <span>{record.author.fullName}</span>
                      <span>{record.witnessKind}</span>
                    </footer>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {visibleCount < records.length ? (
            <button type="button" className="archive-link-button" onClick={onShowMore}>
              Показать ещё
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

export default ArchiveResults;
