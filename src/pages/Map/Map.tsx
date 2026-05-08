import { useAtom } from "jotai";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ArchiveDetail from "../../components/archive/ArchiveDetail";
import ArchiveFilters from "../../components/archive/ArchiveFilters";
import ArchiveMap from "../../components/archive/ArchiveMap";
import ArchiveResults from "../../components/archive/ArchiveResults";
import ArchiveToolbar from "../../components/archive/ArchiveToolbar";
import LayerSwitcher, { HISTORICAL_LAYERS, BASE_LAYERS } from "../../components/archive/LayerSwitcher";
import { useArchiveData } from "../../hooks/useArchiveData";
import type { ArchiveFilters as ArchiveFiltersType } from "../../types/archive";
import {
  activePanelAtom,
  archiveFiltersAtom,
  defaultFilters,
  searchAtom,
  selectedLayerAtom,
  selectedRecordIdAtom,
  activeFilterTabAtom,
} from "../../store/archiveAtoms";
import { buildFilterOptions, filterWitnessRecords } from "../../utils/archive";
import "./Map.css";

function buildActiveFilterCount(filters: ArchiveFiltersType) {
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

function buildFilterPreview(filters: ArchiveFiltersType, authors: { id: string; fullName: string }[]) {
  const preview: string[] = [];
  if (filters.authorId) {
    const selectedAuthor = authors.find((author) => author.id === filters.authorId);
    if (selectedAuthor) preview.push(selectedAuthor.fullName);
  }
  if (filters.district) preview.push(filters.district);
  if (filters.tags.length > 0) preview.push(...filters.tags);
  if (filters.witnessKinds.length > 0) preview.push(...filters.witnessKinds);
  if (filters.startDate || filters.endDate) preview.push("По дате");
  return [...new Set(preview)].slice(0, 4);
}

function Map() {
  const { data, isLoading, isError } = useArchiveData();
  const [searchValue, setSearchValue] = useAtom(searchAtom);
  const [filters, setFilters] = useAtom(archiveFiltersAtom);
  const [activePanel, setActivePanel] = useAtom(activePanelAtom);
  const [activeTab, setActiveTab] = useAtom(activeFilterTabAtom);
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useAtom(selectedRecordIdAtom);
  const [visibleResultsCount, setVisibleResultsCount] = useState(6);
  const deferredSearch = useDeferredValue(searchValue);

  // ── Реактивный isMobile ────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth <= 960
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Drag-шторка (только мобилка) ──────────────────────────────
  type SnapPoint = "peek" | "half" | "full";
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("peek");
  const dragStartY = useRef<number | null>(null);
  const sheetHeightMap: Record<SnapPoint, string> = {
    peek: "80px",
    half: "50dvh",
    full: "88dvh",
  };

  const onDragStart = (clientY: number) => {
    if (!isMobile) return;
    dragStartY.current = clientY;
  };
  const onDragEnd = (clientY: number) => {
    if (!isMobile || dragStartY.current === null) return;
    const delta = dragStartY.current - clientY;
    dragStartY.current = null;
    if (Math.abs(delta) < 20) return;
    if (delta > 0) {
      if (snapPoint === "peek") { setSnapPoint("half"); setActivePanel("results"); }
      else if (snapPoint === "half") { setSnapPoint("full"); }
    } else {
      if (snapPoint === "full") { setSnapPoint("half"); }
      else if (snapPoint === "half") { setSnapPoint("peek"); setActivePanel(null); }
    }
  };
  // ─────────────────────────────────────────────────────────────

  const records = data ?? [];
  const filterOptions = buildFilterOptions(records);
  const filteredRecords = filterWitnessRecords(records, deferredSearch, filters);
  const selectedRecord = filteredRecords.find((record) => record.id === selectedRecordId) ?? null;
  const activeFilterCount = buildActiveFilterCount(filters);
  const filterPreview = buildFilterPreview(filters, filterOptions.authors);

  useEffect(() => setVisibleResultsCount(6), [deferredSearch, filters]);

  useEffect(() => {
    if (!isMobile) return;
    if (activePanel) setSnapPoint((p) => p === "peek" ? "half" : p);
    else setSnapPoint("peek");
  }, [activePanel, isMobile]);

  useEffect(() => {
    if (searchValue.trim() && activePanel !== "filters") setActivePanel("results");
  }, [activePanel, searchValue, setActivePanel]);

  useEffect(() => {
    if (selectedRecordId && !filteredRecords.some((record) => record.id === selectedRecordId)) {
      setSelectedRecordId(null);
    }
  }, [filteredRecords, selectedRecordId, setSelectedRecordId]);

  if (isLoading || isError || !data) {
    return (
      <main className="archive-page archive-page--loading">
        <div className="archive-shell archive-shell--status">
          <h1>{isError ? "Ошибка загрузки" : "Подгружаем данные..."}</h1>
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
              setActivePanel("results");
            }}
          />

          {/* === ГЛАВНАЯ ОБЕРТКА (Шторка на мобилке / Колонка на десктопе) === */}
          <div
            className={`archive-left-column ${activePanel ? 'is-expanded' : 'is-collapsed'} ${layerPanelOpen && isMobile ? 'has-layer-panel' : ''}`}
            style={isMobile ? { 
              height: layerPanelOpen ? "520px" : sheetHeightMap[snapPoint], 
              transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)" 
            } : undefined}
          >
            {/* В peek — весь видимый участок шторки тянется вверх */}
            {isMobile && snapPoint === "peek" && (
              <div
                style={{ position: "absolute", inset: 0, zIndex: 50, cursor: "grab" }}
                onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
                onTouchEnd={(e) => { onDragEnd(e.changedTouches[0].clientY); }}
                onClick={() => { setSnapPoint("half"); setActivePanel("results"); }}
              />
            )}
            <div
              className="mobile-handle-zone"
              onClick={() => {
                if (snapPoint === "peek") { setSnapPoint("half"); setActivePanel("results"); }
                else if (snapPoint === "full") { setSnapPoint("half"); }
                else { setSnapPoint("peek"); setActivePanel(null); setLayerPanelOpen(false); }
              }}
              onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
              onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientY)}
            >
              <div className="mobile-handle" />
            </div>

            <div className="archive-topbar">
              {/* Когда открыта панель слоёв — показываем её вместо поиска */}
              {layerPanelOpen && isMobile ? (
                <div className="layer-selection-panel layer-selection-panel--mobile" style={{ flex: 1, overflowY: "auto" }}>
                  <div className="layer-modal-header">
                    <h2>Вид карты:</h2>
                    <button className="layer-modal-close-btn" onClick={() => { setLayerPanelOpen(false); setSnapPoint("peek"); }}>
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="layer-modal-grid">
                    {HISTORICAL_LAYERS.map((layer, index) => (
                      <button
                        key={index}
                        className={`layer-modal-item ${selectedLayer === layer.id ? "is-active" : ""}`}
                        onClick={() => setSelectedLayer(layer.id as any)}
                      >
                        <div className="layer-modal-item__img"><img src={layer.img} alt={layer.label} /></div>
                        <span>{layer.label}</span>
                      </button>
                    ))}
                  </div>
                  <hr className="layer-modal-divider" />
                  <div className="layer-modal-grid">
                    {BASE_LAYERS.map((layer, index) => (
                      <button
                        key={index}
                        className={`layer-modal-item ${selectedLayer === layer.id ? "is-active" : ""}`}
                        onClick={() => setSelectedLayer(layer.id as any)}
                      >
                        <div className="layer-modal-item__img"><img src={layer.img} alt={layer.label} /></div>
                        <span>{layer.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
              <>
              <ArchiveToolbar
                value={searchValue}
                filterCount={activeFilterCount}
                isFiltersOpen={activePanel === "filters"}
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
              />

              {/* ТАБЫ: всегда на мобилке, только при фильтрах на десктопе */}
              {(activePanel === "filters" || isMobile) && (
                <nav className="archive-filter-tabs animate-in">
                  <button
                    type="button"
                    className={`archive-filter-tabs__item ${activeTab === "general" ? "is-active" : ""}`}
                    onClick={() => { setActiveTab("general"); if (isMobile) setActivePanel("filters"); }}
                  >
                    Общее
                  </button>
                  <button
                    type="button"
                    className={`archive-filter-tabs__item ${activeTab === "place" ? "is-active" : ""}`}
                    onClick={() => { setActiveTab("place"); if (isMobile) setActivePanel("filters"); }}
                  >
                    Место
                  </button>
                  <button
                    type="button"
                    className={`archive-filter-tabs__item ${activeTab === "person" ? "is-active" : ""}`}
                    onClick={() => { setActiveTab("person"); if (isMobile) setActivePanel("filters"); }}
                  >
                    Персоналия
                  </button>
                </nav>
              )}

              {filterPreview.length > 0 && !activePanel && !selectedRecord && (
                <div className="archive-filter-summary">
                  {filterPreview.map((item) => (
                    <span key={item} className="chip chip--soft">{item}</span>
                  ))}
                </div>
              )}
              </>
              )}
            </div>

            {/* Контент шторки (Фильтры или Результаты) */}
            {activePanel === "filters" || activePanel === "results" ? (
              <div className="archive-sidebar archive-sidebar--left animate-in">
                {activePanel === "filters" ? (
                  <ArchiveFilters options={filterOptions} />
                ) : (
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
                )}
              </div>
            ) : null}
          </div>

          {/* Правый сайдбар (Детали записи) */}
          {selectedRecord && (
            <div className="archive-sidebar archive-sidebar--right animate-in">
              <div className="mobile-handle" onClick={() => {
                setSelectedRecordId(null);
                setActivePanel("results");
              }} />
              <ArchiveDetail
                record={selectedRecord}
                onClose={() => {
                  setSelectedRecordId(null);
                  setActivePanel("results");
                }}
              />
            </div>
          )}

          <div className="archive-layer-dock">
            <LayerSwitcher onMobileOpen={() => { setLayerPanelOpen(true); setSnapPoint("full"); setActivePanel(null); }} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Map;