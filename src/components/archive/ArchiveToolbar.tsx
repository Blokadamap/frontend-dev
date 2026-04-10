import { Check, Search, SlidersHorizontal, X } from "lucide-react";

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
  return (
    <form
      className={`archive-toolbar ${isFiltersOpen ? "is-filters-open" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      {/* Поле поиска в виде пилюли */}
      <div className="archive-toolbar__field">
        <Search size={20} strokeWidth={2} className="opacity-50" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Поиск по дневникам..."
        />
      </div>

      {/* Блок кнопок действия */}
      {isFiltersOpen ? (
        <>
          {/* Кнопка ПРИМЕНИТЬ (Зеленый квадрат) */}
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--apply"
            onClick={onApplyFilters}
            aria-label="Применить фильтры"
          >
            <Check size={24} strokeWidth={3} />
          </button>

          {/* Кнопка СБРОСИТЬ (Красный квадрат) */}
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--close"
            onClick={onResetFilters}
            aria-label="Сбросить фильтры"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </>
      ) : (
        /* Кнопка НАСТРОЕК (Золотой квадрат) */
        <button
          type="button"
          className="archive-toolbar__button archive-toolbar__button--filter"
          onClick={onOpenFilters}
          aria-label="Открыть фильтры"
        >
          <SlidersHorizontal size={24} strokeWidth={2.5} />
          {filterCount > 0 && (
            <span className="archive-toolbar__badge">{filterCount}</span>
          )}
        </button>
      )}
    </form>
  );
}

export default ArchiveToolbar;