import { useAtom } from "jotai";
import { useDeferredValue, useEffect, useState } from "react";
import ArchiveDetail from "../../components/archive/ArchiveDetail";
import ArchiveFilters from "../../components/archive/ArchiveFilters";
import ArchiveMap from "../../components/archive/ArchiveMap";
import ArchiveResults from "../../components/archive/ArchiveResults";
import ArchiveToolbar from "../../components/archive/ArchiveToolbar";
import LayerSwitcher from "../../components/archive/LayerSwitcher";
import { useArchiveData } from "../../hooks/useArchiveData";
import type { ArchiveFilters as ArchiveFiltersType, MapLayerId } from "../../types/archive";
import {
  activeFilterTabAtom,
  activePanelAtom,
  archiveFiltersAtom,
  defaultFilters,
  searchAtom,
  selectedLayerAtom,
  selectedRecordIdAtom,
} from "../../store/archiveAtoms";
import { buildFilterOptions, filterWitnessRecords } from "../../utils/archive";
import "./Map.css";

const layerLabels: Record<MapLayerId, string> = {
  modern: "Современная карта",
  retro: "Аэрофотосъёмка",
  topo: "Топография 1940",
};

function buildActiveFilterCount(filters: typeof defaultFilters) {
  return [
    Boolean(filters.startDate || filters.endDate),
    filters.witnessKinds.length > 0,
    filters.retrospectiveKinds.length > 0,
    filters.significances.length > 0,
    filters.tags.length > 0,
    Boolean(filters.authorId),
    Boolean(filters.birthDateStart || filters.birthDateEnd),
    filters.genders.length > 0,
    filters.partyStatuses.length > 0,
    Boolean(filters.district),
    Boolean(filters.space),
    Boolean(filters.street),
    Boolean(filters.building),
    Boolean(filters.address),
  ].filter(Boolean).length;
}

function formatWord(value: number, [one, few, many]: [string, string, string]) {
  const absValue = Math.abs(value) % 100;
  const lastDigit = absValue % 10;

  if (absValue > 10 && absValue < 20) {
    return many;
  }

  if (lastDigit === 1) {
    return one;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }

  return many;
}

function buildFilterPreview(
  filters: ArchiveFiltersType,
  authors: { id: string; fullName: string }[],
) {
  const preview: string[] = [];

  if (filters.authorId) {
    const selectedAuthor = authors.find((author) => author.id === filters.authorId);
    if (selectedAuthor) {
      preview.push(selectedAuthor.fullName);
    }
  }

  if (filters.district) {
    preview.push(filters.district);
  }

  if (filters.tags.length > 0) {
    preview.push(...filters.tags);
  }

  if (filters.witnessKinds.length > 0) {
    preview.push(...filters.witnessKinds);
  }

  if (filters.retrospectiveKinds.length > 0) {
    preview.push(...filters.retrospectiveKinds);
  }

  if (filters.significances.length > 0) {
    preview.push(...filters.significances);
  }

  if (filters.startDate || filters.endDate) {
    preview.push("Фильтр по дате");
  }

  return [...new Set(preview)].slice(0, 4);
}

function Map() {
  const { data, isLoading, isError } = useArchiveData();
  const [searchValue, setSearchValue] = useAtom(searchAtom);
  const [filters, setFilters] = useAtom(archiveFiltersAtom);
  const [activePanel, setActivePanel] = useAtom(activePanelAtom);
  const [activeFilterTab, setActiveFilterTab] = useAtom(activeFilterTabAtom);
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [selectedRecordId, setSelectedRecordId] = useAtom(selectedRecordIdAtom);
  const [visibleResultsCount, setVisibleResultsCount] = useState(6);
  const deferredSearch = useDeferredValue(searchValue);

  const records = data ?? [];
  const filterOptions = buildFilterOptions(records);
  const filteredRecords = filterWitnessRecords(records, deferredSearch, filters);
  const selectedRecord = filteredRecords.find((record) => record.id === selectedRecordId) ?? null;
  const activeFilterCount = buildActiveFilterCount(filters);
  const filterPreview = buildFilterPreview(filters, filterOptions.authors);
  const showMapStatus = !selectedRecord && activePanel !== "filters";
  const showLayerDock = !activePanel || Boolean(selectedRecord);
  const resultsWord = formatWord(filteredRecords.length, [
    "свидетельство",
    "свидетельства",
    "свидетельств",
  ]);
  const filtersWord = formatWord(activeFilterCount, ["фильтр", "фильтра", "фильтров"]);

  useEffect(() => {
    setVisibleResultsCount(6);
  }, [deferredSearch, filters]);

  useEffect(() => {
    if (searchValue.trim() && activePanel !== "filters") {
      setActivePanel("results");
    }
  }, [activePanel, searchValue, setActivePanel]);

  useEffect(() => {
    if (selectedRecordId && !filteredRecords.some((record) => record.id === selectedRecordId)) {
      setSelectedRecordId(null);
    }
  }, [filteredRecords, selectedRecordId, setSelectedRecordId]);

  if (isLoading) {
    return (
      <main className="archive-page archive-page--loading">
        <div className="archive-shell archive-shell--status">
          <p className="archive-status__eyebrow">Поиск по дневникам</p>
          <h1>Подгружаем тестовую выборку свидетельств...</h1>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="archive-page archive-page--loading">
        <div className="archive-shell archive-shell--status">
          <p className="archive-status__eyebrow">Поиск по дневникам</p>
          <h1>Не удалось получить данные архива.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="archive-page">
      <section className="archive-shell">
        <div className="archive-stage">
          <ArchiveMap
            records={filteredRecords}
            selectedRecordId={selectedRecordId}
            selectedLayer={selectedLayer}
            hasLeftSidebar={activePanel !== null}
            hasRightSidebar={Boolean(selectedRecord)}
            onSelectRecord={(recordId) => {
              setSelectedRecordId(recordId);
              setActivePanel(null);
            }}
            onClearSelection={() => {
              setSelectedRecordId(null);
            }}
          />

          <div className="archive-mode-badge">Поиск по дневникам</div>

          <div className="archive-topbar">
            <ArchiveToolbar
              value={searchValue}
              filterCount={activeFilterCount}
              isFiltersOpen={activePanel === "filters"}
              showCloseButton={activePanel === "results"}
              onChange={setSearchValue}
              onSearch={() => {
                setSelectedRecordId(null);
                setActivePanel("results");
              }}
              onOpenFilters={() => {
                setSelectedRecordId(null);
                setActivePanel("filters");
              }}
              onApplyFilters={() => {
                setSelectedRecordId(null);
                setActivePanel("results");
              }}
              onResetFilters={() => {
                setFilters(defaultFilters);
                setSearchValue("");
                setSelectedRecordId(null);
                setActivePanel("results");
              }}
              onClosePanel={() => setActivePanel(null)}
            />

            {filterPreview.length > 0 && !activePanel && !selectedRecord ? (
              <div className="archive-filter-summary">
                {filterPreview.map((item) => (
                  <span key={item} className="chip chip--soft">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {activePanel === "filters" ? (
            <div className="archive-sidebar archive-sidebar--left">
              <ArchiveFilters
                filters={filters}
                activeTab={activeFilterTab}
                options={filterOptions}
                onTabChange={setActiveFilterTab}
                onChange={setFilters}
              />
            </div>
          ) : null}

          {activePanel === "results" ? (
            <div className="archive-sidebar archive-sidebar--left">
              <ArchiveResults
                records={filteredRecords}
                searchValue={searchValue}
                selectedRecordId={selectedRecordId}
                visibleCount={visibleResultsCount}
                onShowMore={() => setVisibleResultsCount((count) => count + 6)}
                onSelect={(recordId) => {
                  setSelectedRecordId(recordId);
                  setActivePanel(null);
                }}
              />
            </div>
          ) : null}

          {selectedRecord ? (
            <div className="archive-sidebar archive-sidebar--right">
              <ArchiveDetail
                record={selectedRecord}
                onClose={() => {
                  setSelectedRecordId(null);
                  setActivePanel("results");
                }}
              />
            </div>
          ) : null}

          {showLayerDock ? (
            <div className="archive-layer-dock">
              <LayerSwitcher value={selectedLayer} onChange={setSelectedLayer} />
            </div>
          ) : null}

          {showMapStatus ? (
            <div className="archive-map-status">
              <div className="archive-map-status__primary">
                <strong>{filteredRecords.length}</strong>
                <span>{`${resultsWord} на карте`}</span>
              </div>

              <div className="archive-map-status__secondary">
                <span>{layerLabels[selectedLayer]}</span>
                <span>
                  {activeFilterCount > 0 ? `${activeFilterCount} ${filtersWord}` : "Без фильтров"}
                </span>
              </div>

              <button
                type="button"
                className="archive-map-status__action"
                onClick={() => {
                  setSelectedRecordId(null);
                  setActivePanel(activePanel === "results" ? null : "results");
                }}
              >
                {activePanel === "results" ? "Скрыть выборку" : "Открыть выборку"}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default Map;
