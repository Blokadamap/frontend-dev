import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useAuthorsDetailed } from "../../hooks/authors/useAuthorsDetailed";
import { useAuthorFilters } from "../../hooks/authors/useAuthorFilters";
import AuthorFiltersPanel from "../../components/authors/AuthorFiltersPanel";
import AuthorCard from "../../components/authors/AuthorCard";
import {
  EMPTY_AUTHOR_FILTERS,
  authorMatchesFilters,
  countActiveAuthorFilters,
  type AuthorPageFilters,
} from "../../utils/authorPageFilters";
import "./AuthorsPage.css";

function AuthorsPage() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<AuthorPageFilters>(EMPTY_AUTHOR_FILTERS);

  const { data: authors, isLoading, isError } = useAuthorsDetailed();
  const { data: authorFilters } = useAuthorFilters();

  const sortedAuthors = useMemo(
    () =>
      [...(authors ?? [])].sort((a, b) =>
        a.lastName.localeCompare(b.lastName, "ru"),
      ),
    [authors],
  );

  const visibleAuthors = useMemo(
    () => sortedAuthors.filter((a) => authorMatchesFilters(a, filters)),
    [sortedAuthors, filters],
  );

  const activeCount = countActiveAuthorFilters(filters);

  return (
    <div className="authors-page paper-map-bg">
      <div className={`authors-layout ${filtersOpen ? "" : "is-filters-collapsed"}`}>
        {filtersOpen && (
          <aside className="authors-filters">
            <AuthorFiltersPanel
              filters={filters}
              setFilters={setFilters}
              options={authorFilters}
              authors={sortedAuthors}
            />
          </aside>
        )}

        <main className="authors-main">
          <div className="authors-toolbar">
            <button
              type="button"
              className={`authors-filter-toggle ${filtersOpen ? "is-active" : ""}`}
              onClick={() => setFiltersOpen((v) => !v)}
              aria-pressed={filtersOpen}
              aria-label={filtersOpen ? "Скрыть фильтры" : "Показать фильтры"}
              title={filtersOpen ? "Скрыть фильтры" : "Показать фильтры"}
            >
              <SlidersHorizontal size={20} />
              {activeCount > 0 && (
                <span className="authors-filter-toggle__badge">{activeCount}</span>
              )}
            </button>

            <div className="authors-search">
              <Search size={18} className="authors-search__icon" />
              <input
                type="text"
                placeholder="Поиск по авторам..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
              {(filters.search.trim() || activeCount > 0) && (
                <button
                  type="button"
                  className="authors-search__clear"
                  onClick={() => setFilters(EMPTY_AUTHOR_FILTERS)}
                  aria-label="Сбросить фильтры и поиск"
                  title="Сбросить фильтры и поиск"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p className="authors-status">Загружаем авторов…</p>
          ) : isError ? (
            <p className="authors-status">Не удалось загрузить авторов.</p>
          ) : visibleAuthors.length === 0 ? (
            <div className="authors-empty">
              <p>Ничего не найдено</p>
              <span>Попробуйте изменить фильтры или запрос</span>
            </div>
          ) : (
            <div className="authors-list">
              {visibleAuthors.map((author) => (
                <AuthorCard key={author.authorId} author={author} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AuthorsPage;
