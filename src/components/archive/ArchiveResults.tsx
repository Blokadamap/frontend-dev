import { useState } from "react"; 
import { MapPin } from "lucide-react";
import type { DiaryResponse } from "../../types/diary/diary.types";
import {
  buildRecordExcerpt,
  formatHumanDate,
} from "../../utils/archive";
import './ArchiveResults.css';

interface ArchiveResultsProps {
  diaries: DiaryResponse[];
  searchValue: string;
  selectedDiaryId: number | null;
  visibleCount: number;
  onShowMore: () => void;
  onSelect: (authorId: number) => void;
}

function groupDiaryByDate(authors: DiaryResponse[]) {
  const map = new Map<string, DiaryResponse[]>([])
  let k = 0
  let text = "Январь"

  for (const author of authors) {
    if (k === 2) {
      k = 0
      text = text === "Январь" ? "Февраль" : "Январь"
    }
    const prev = map.get(text) || []
    map.set(text, [...prev, author])
    k++
  }

  return Array.from(map.entries())
}

function ArchiveResults({
  diaries,
  searchValue,
  selectedDiaryId,
  visibleCount,
  onShowMore,
  onSelect
}: ArchiveResultsProps) {
  const visibleItems = diaries.slice(0, visibleCount);
  const groupedDiaries = groupDiaryByDate(visibleItems)
  const showEmpty = diaries.length === 0;
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
        Всего дневников • {diaries.length}
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
              {groupedDiaries.map((group) => (
                <div key={group[0]} className="archive-results__group">
                  <div className="archive-results__month">
                     <span>{group[0]}</span>
                  </div>

                  {group[1].map((diary) => (
                    <button
                      key={diary.diaryId}
                      type="button"
                      className={`archive-quote-card${
                        selectedDiaryId === diary.diaryId ? " is-active" : ""
                      }`}
                      onClick={() => onSelect(diary.diaryId)}
                    >
                      <div className="archive-quote-card__header">
                        <strong className="archive-quote-card__location">
                          <MapPin size={12} className="inline mr-1 opacity-70" />
                          {diary.diarySource}
                        </strong>
                        <span className="archive-quote-card__date">
                          {formatHumanDate(diary.diaryStartedAt)}
                        </span>
                      </div>

                      <p className="archive-quote-card__text">
                        {buildRecordExcerpt("diary text", 140)}
                      </p>

                      <footer className="archive-quote-card__footer">
                        <span className="archive-quote-card__author">
                          {`${diary.author.middleName} ${diary.author.firstName} ${diary.author.lastName}`}
                        </span>
                        <span className="archive-quote-card__kind">
                          {"empty"}
                        </span>
                      </footer>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {visibleCount < diaries.length && (
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