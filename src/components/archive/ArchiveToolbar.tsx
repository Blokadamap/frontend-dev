import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import './ArchiveToolbar.css';

interface ArchiveToolbarProps {
  value: string;
  filterCount: number;
  isFiltersOpen: boolean;
  isResultsOpen: boolean;
  onChange: (value: string) => void;
  onSearch: () => void;
  onOpenFilters: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

function ArchiveToolbar({
  value,
  isFiltersOpen,
  isResultsOpen,
  onChange,
  onSearch,
  onOpenFilters,
  onApplyFilters,
  onResetFilters,
}: ArchiveToolbarProps) {
  // «Галочка» показывается, пока открыта панель фильтров или панель
  // результатов поиска; после фиксации панель сворачивается и
  // возвращается кнопка фильтров.
  const showApply = isFiltersOpen || (isResultsOpen && Boolean(value.trim()));
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
        {(value || isFiltersOpen) && (
          <button
            type="button"
            className="archive-toolbar__clear"
            onClick={() => { onChange(""); onResetFilters(); }}
            aria-label="Очистить"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* БЛОК КНОПОК */}
      <div className="archive-toolbar__buttons">
        {showApply ? (
          /* КВАДРАТ ПРИМЕНИТЬ (Галка) — при открытых фильтрах или вводе поиска */
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--apply"
            onClick={onApplyFilters}
            aria-label="Применить"
          >
            <Check size={24} strokeWidth={3} />
          </button>
        ) : (
          /* КВАДРАТ НАСТРОЕК (Ползунки) */
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--filter"
            onClick={onOpenFilters}
            aria-label="Открыть фильтры"
          >
            <SlidersHorizontal size={24} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </form>
  );
}

export default ArchiveToolbar;