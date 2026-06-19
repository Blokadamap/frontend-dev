import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ArchiveToolbar from "../../components/archive/ArchiveToolbar";
import ArchiveFilters from "../../components/archive/ArchiveFilters";
import EvidenceDetail from "../../components/evidence/EvidenceDetail";
import {
  searchAtom,
  archiveFilters,
  activeFilterTabAtom,
  resetArchiveFiltersAtom,
} from "../../store/archiveAtoms";
import { useServerFilter } from "../../hooks/useServerFilter";
import { useFilteredNotes } from "../../hooks/notes/useFilteredNotes";
import { useDiaries } from "../../hooks/diaries/useDiaries";
import { usePoints } from "../../hooks/points/usePoints";
import { usePointTypes } from "../../hooks/points/usePointTypes";
import { buildPointAddress } from "../../utils/filters";
import { formatLongDate } from "../../utils/formatLongDate";
import type { DiaryResponse } from "../../types/diary/diary.types";
import "./EvidencePage.css";

const PAGE_SIZES = [20, 50, 100] as const;

function authorNameFromDiary(diary?: DiaryResponse): string {
  if (!diary) return "Неизвестный автор";
  return (
    [diary.author.lastName, diary.author.firstName, diary.author.middleName]
      .filter(Boolean)
      .join(" ") || "Неизвестный автор"
  );
}

function EvidencePage() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeTab, setActiveTab] = useAtom(activeFilterTabAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const resetFilters = useSetAtom(resetArchiveFiltersAtom);
  const filters = useAtomValue(archiveFilters);
  const deferredSearch = useDeferredValue(search);

  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState(1);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const { data: diaries } = useDiaries();
  const { data: points } = usePoints();
  const { data: pointTypes } = usePointTypes();

  // Те же опции вкладки «Место», что и на карте.
  const filterOptions = useMemo(() => {
    const uniq = (values: (string | undefined | null)[]) =>
      [...new Set(values.map((v) => (v ?? "").trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "ru"),
      );
    const subtypeNames = (pointTypes ?? []).flatMap((type) =>
      (type.pointSubtypes ?? []).map((sub) => sub.name),
    );
    return {
      districts: uniq((points ?? []).map((p) => p.rayon?.name)),
      pointTypes: uniq((pointTypes ?? []).map((type) => type.name)),
      pointSubtypes: uniq(subtypeNames),
      streets: uniq((points ?? []).map((p) => p.street)),
      buildings: uniq((points ?? []).map((p) => p.building)),
      addresses: uniq((points ?? []).map((p) => buildPointAddress(p))),
    };
  }, [points, pointTypes]);

  // Та же серверная фильтрация, что и на карте.
  const serverFilter = useServerFilter(filters, deferredSearch);
  const allNotesQuery = useFilteredNotes(
    {},
    serverFilter.notes == null && !serverFilter.isFiltering,
  );

  const diaryById = useMemo(() => {
    const map = new Map<number, DiaryResponse>();
    for (const diary of diaries ?? []) map.set(diary.diaryId, diary);
    return map;
  }, [diaries]);

  const sortedNotes = useMemo(() => {
    const base = serverFilter.notes ?? allNotesQuery.data ?? [];
    return [...base].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [serverFilter.notes, allNotesQuery.data]);

  // Сброс на первую страницу при изменении фильтров/поиска/размера выдачи —
  // через сравнение с предыдущим рендером (без эффекта).
  const [resetKey, setResetKey] = useState({ filters, deferredSearch, pageSize });
  if (
    resetKey.filters !== filters ||
    resetKey.deferredSearch !== deferredSearch ||
    resetKey.pageSize !== pageSize
  ) {
    setResetKey({ filters, deferredSearch, pageSize });
    setPage(1);
  }

  const total = sortedNotes.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageNotes = sortedNotes.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const loading =
    serverFilter.isFiltering ||
    (serverFilter.notes == null && allNotesQuery.isLoading);

  return (
    <div className="evidence-page paper-map-bg">
      <div className="evidence-inner">
      <div className="evidence-toolbar-row">
        <ArchiveToolbar
          value={search}
          filterCount={0}
          isFiltersOpen={filtersOpen}
          isResultsOpen={false}
          onChange={setSearch}
          onSearch={() => {}}
          onOpenFilters={() => setFiltersOpen(true)}
          onApplyFilters={() => setFiltersOpen(false)}
          onResetFilters={() => {
            resetFilters();
            setSearch("");
          }}
        />
      </div>

      {filtersOpen && (
        <nav className="archive-filter-tabs evidence-tabs">
          <button
            type="button"
            className={`archive-filter-tabs__item ${activeTab === "general" ? "is-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            Свидетельство
          </button>
          <button
            type="button"
            className={`archive-filter-tabs__item ${activeTab === "person" ? "is-active" : ""}`}
            onClick={() => setActiveTab("person")}
          >
            Автор
          </button>
          <button
            type="button"
            className={`archive-filter-tabs__item ${activeTab === "place" ? "is-active" : ""}`}
            onClick={() => setActiveTab("place")}
          >
            Место
          </button>
        </nav>
      )}

      <div
        className={`evidence-layout ${filtersOpen ? "" : "is-filters-collapsed"} ${
          selectedNoteId != null ? "has-detail" : ""
        }`}
      >
        {filtersOpen && (
          <aside className="evidence-filters">
            <ArchiveFilters options={filterOptions} />
          </aside>
        )}

        <main className="evidence-main">
          {loading && sortedNotes.length === 0 ? (
            <p className="evidence-status">Загружаем свидетельства…</p>
          ) : sortedNotes.length === 0 ? (
            <div className="evidence-empty">
              <p>Ничего не найдено</p>
              <span>Попробуйте изменить фильтры или запрос</span>
            </div>
          ) : (
            <>
              <ul className="evidence-list">
                {pageNotes.map((note) => {
                  const diary = diaryById.get(note.diaryId);
                  return (
                    <li key={note.noteId} className="evidence-card">
                      <div className="evidence-card__head">
                        {diary?.author?.authorId ? (
                          <Link
                            className="evidence-card__author evidence-card__author--link"
                            to={`/authors/${diary.author.authorId}`}
                          >
                            {authorNameFromDiary(diary)}
                          </Link>
                        ) : (
                          <span className="evidence-card__author">
                            {authorNameFromDiary(diary)}
                          </span>
                        )}
                        <span className="evidence-card__date">
                          {formatLongDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="evidence-card__text">{note.citation}</p>
                      <div className="evidence-card__footer">
                        <button
                          type="button"
                          className="evidence-card__more"
                          onClick={() => setSelectedNoteId(note.noteId)}
                        >
                          Подробнее
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="evidence-pagination">
                <div className="evidence-pagesize">
                  <span>На странице:</span>
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`evidence-pagesize__btn ${pageSize === size ? "is-active" : ""}`}
                      onClick={() => setPageSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="evidence-pager">
                  <button
                    type="button"
                    className="evidence-pager__nav"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Предыдущая страница"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="evidence-pager__info">
                    {safePage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    className="evidence-pager__nav"
                    disabled={safePage >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    aria-label="Следующая страница"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        {selectedNoteId != null && (
          <EvidenceDetail
            noteId={selectedNoteId}
            onClose={() => setSelectedNoteId(null)}
          />
        )}
      </div>
      </div>
    </div>
  );
}

export default EvidencePage;
