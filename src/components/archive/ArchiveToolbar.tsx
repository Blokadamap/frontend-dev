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

  const showClearButton = isFiltersOpen && filterCount > 0;
  
  const showBadge = !isFiltersOpen && filterCount > 0;

  return (
    <form
      className="archive-toolbar"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="archive-toolbar__field">
        <Search size={18} strokeWidth={2} className="archive-toolbar__search-icon" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Поиск по дневникам..."
        />
        {showClearButton && (
          <button
            type="button"
            className="archive-toolbar__clear-button"
            onClick={(e) => {
              e.preventDefault();
              onResetFilters();
            }}
            aria-label="Сбросить фильтры"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <button
        type="button"
        className="archive-toolbar__action-button"
        onClick={isFiltersOpen ? onApplyFilters : onOpenFilters}
        aria-label={isFiltersOpen ? "Применить фильтры" : "Открыть фильтры"}
      >
        {isFiltersOpen ? <Check size={20} strokeWidth={2.5} /> : <SlidersHorizontal size={20} strokeWidth={2} />}
        {showBadge && <span className="archive-toolbar__badge">{filterCount}</span>}
      </button>
    </form>
  );
}

export default ArchiveToolbar;