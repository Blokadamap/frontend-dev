import { Check, Search, SlidersHorizontal, X } from "lucide-react";

interface ArchiveToolbarProps {
  value: string;
  filterCount: number;
  isFiltersOpen: boolean;
  showCloseButton?: boolean;
  onChange: (value: string) => void;
  onSearch: () => void;
  onOpenFilters: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onClosePanel: () => void;
}

function ArchiveToolbar({
  value,
  filterCount,
  isFiltersOpen,
  showCloseButton = false,
  onChange,
  onSearch,
  onOpenFilters,
  onApplyFilters,
  onResetFilters,
  onClosePanel,
}: ArchiveToolbarProps) {
  const className = [
    "archive-toolbar",
    isFiltersOpen ? "is-filters-open" : "",
    showCloseButton ? "has-close" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="archive-toolbar__field">
        <Search size={16} strokeWidth={1.8} />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Поиск по дневникам"
        />
      </div>

      {isFiltersOpen ? (
        <>
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--apply"
            onClick={onApplyFilters}
            aria-label="Применить фильтры"
          >
            <Check size={17} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--close"
            onClick={onResetFilters}
            aria-label="Сбросить фильтры"
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="archive-toolbar__button archive-toolbar__button--filter"
            onClick={onOpenFilters}
            aria-label="Открыть фильтры"
          >
            <SlidersHorizontal size={17} strokeWidth={2.2} />
            {filterCount > 0 ? (
              <span className="archive-toolbar__badge">{filterCount}</span>
            ) : null}
          </button>
          {showCloseButton ? (
            <button
              type="button"
              className="archive-toolbar__button archive-toolbar__button--mobile-close"
              onClick={onClosePanel}
              aria-label="Закрыть панель"
            >
              <X size={17} strokeWidth={2.4} />
            </button>
          ) : null}
        </>
      )}
    </form>
  );
}

export default ArchiveToolbar;
