import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import './ArchiveToolbar.css';

interface ArchiveToolbarProps {
  value: string;
  filterCount: number;        
  isFiltersOpen: boolean;
  onChange: (value: string) => void;
  onSearch: () => void;
  onOpenFilters: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

function ArchiveToolbar({
  value,
  filterCount,
  isFiltersOpen,
  onChange,
  onSearch,
  onOpenFilters,
  onApplyFilters,
  onResetFilters,
}: ArchiveToolbarProps) {

  const showBadge = !isFiltersOpen && filterCount > 0;

  return (
    <form
      className={`archive-toolbar ${isFiltersOpen ? "is-filters-open" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      {/* ПИЛЮЛЯ ПОИСКА */}
      <div className="archive-toolbar__field">
        <Search size={20} strokeWidth={2} className="archive-toolbar__search-icon" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Поиск по дневникам..."
        />
      </div>

      {/* БЛОК КНОПОК */}
      <div className="archive-toolbar__buttons">
        {isFiltersOpen ? (
          <>
            {/* КВАДРАТ СБРОСА (X) — теперь с классом для скрытия на мобилках */}
            <button
              type="button"
              className="archive-toolbar__button archive-toolbar__button--reset archive-toolbar__button--desktop-only"
              onClick={onResetFilters}
              aria-label="Сбросить фильтры"
            >
              <X size={24} strokeWidth={3} />
            </button>

            {/* КВАДРАТ ПРИМЕНИТЬ (Галка) — остается всегда */}
            <button
              type="button"
              className="archive-toolbar__button archive-toolbar__button--apply"
              onClick={onApplyFilters}
              aria-label="Применить фильтры"
            >
              <Check size={24} strokeWidth={3} />
            </button>
          </>
        ) : (
          /* КВАДРАТ НАСТРОЕК (Ползунки) */
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--filter"
            onClick={onOpenFilters}
            aria-label="Открыть фильтры"
          >
            <SlidersHorizontal size={24} strokeWidth={2.5} />
            {showBadge && <span className="archive-toolbar__badge">{filterCount}</span>}
          </button>
        )}
      </div>
    </form>
  );
}

export default ArchiveToolbar;