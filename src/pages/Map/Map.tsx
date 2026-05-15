/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ArchiveDetail from "../../components/archive/ArchiveDetail";
import ArchiveFilters from "../../components/archive/ArchiveFilters";
import ArchiveMap from "../../components/archive/ArchiveMap";
import ArchiveResults from "../../components/archive/ArchiveResults";
import ArchiveToolbar from "../../components/archive/ArchiveToolbar";
import LayerSwitcher, {
  HISTORICAL_LAYERS,
  BASE_LAYERS,
} from "../../components/archive/LayerSwitcher";
import { useDiaries } from "../../hooks/diaries/useDiaries";
import { usePoints } from "../../hooks/points/usePoints";
import { type ArchiveFiltersType } from "../../store/archiveAtoms";
import { useAtomValue } from "jotai";
import {
  activePanelAtom,
  searchAtom,
  selectedLayerAtom,
  selectedRecordIdAtom,
  resetArchiveFiltersAtom,
  archiveFilters,
  activeFilterTabAtom,
} from "../../store/archiveAtoms";
import type { PointResponse } from "../../types/point/point.type";
import type { DiaryResponse } from "../../types/diary/diary.types";
import "./Map.css";

function buildActiveFilterCount(filters: ArchiveFiltersType) {
  let res = 0;

  if (filters.authorId) res++;
  if (filters.educations.length != 0) res++;
  if (filters.familyStatuses.length != 0) res++;
  if (filters.tags.length != 0) res++;
  if (filters.cards.length != 0) res++;
  if (filters.nationalities.length != 0) res++;
  if (filters.noteTypes.length != 0) res++;
  if (filters.occupations.length != 0) res++;
  if (filters.politicalParties.length != 0) res++;
  if (filters.religions.length != 0) res++;
  if (filters.socialClasses.length != 0) res++;
  if (filters.temporalities.length != 0) res++;
  if (filters.address) res++;
  if (filters.birthdayStart) res++;
  if (filters.birthdayEnd) res++;
  if (filters.building) res++;
  if (filters.genders.length != 0) res++;
  if (filters.startDate) res++;
  if (filters.endDate) res++;
  if (filters.street) res++;

  return res;
}

function buildFilterPreview(filters: ArchiveFiltersType): string[] {
  const res = [];

  if (filters.authorId) res.push("Поиск по автору");
  if (filters.educations.length != 0)
    res.push(
      "Поиск по образованию: ",
      filters.educations.map((item) => item.name).join("; "),
    );

  return res;
}

function getFilteredPoints(
  filters: ArchiveFiltersType,
  points: PointResponse[] | undefined,
): PointResponse[] {
  let res: PointResponse[] = [];

  if (!points) return res;

  if (filters.street)
    res = points.filter((point) => point.street === filters.street);
  if (filters.building)
    res = res.filter((point) => point.building === filters.building);
  if (filters.district)
    res = res.filter((point) => point.rayon?.name === filters.district);

  return res;
}

function getFilteredDiaries(
  filters: ArchiveFiltersType,
  diaries: DiaryResponse[] | undefined,
): DiaryResponse[] {
  let res: DiaryResponse[] = [];

  if (!diaries) return res;

  if (filters.authorId)
    return diaries.filter((diary) => diary.authorId === filters.authorId);
  if (filters.startDate)
    res = diaries.filter((diary) => diary.diaryStartedAt >= filters.startDate);
  if (filters.endDate)
    res = res.filter((diary) => diary.diaryFinishedAt <= filters.endDate);

  return res;
}

const options = {
  districts: [],
  spaces: [],
  streets: [],
  buildings: [],
  addresses: [],
};

function Map() {
  // ── Реактивный isMobile ────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 960,
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
      if (snapPoint === "peek") {
        setSnapPoint("half");
        setActivePanel("results");
      } else if (snapPoint === "half") {
        setSnapPoint("full");
      }
    } else {
      if (snapPoint === "full") {
        setSnapPoint("half");
      } else if (snapPoint === "half") {
        setSnapPoint("peek");
        setActivePanel(null);
      }
    }
  };
  // ─────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useAtom(activeFilterTabAtom);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);

  const {
    data: diaries,
    isLoading: isLoadingDiaries,
    isError: isErrorDiaries,
  } = useDiaries();
  const {
    data: points,
    isLoading: isLoadingPoints,
    isError: isErrorPoints,
  } = usePoints();

  const [searchValue, setSearchValue] = useAtom(searchAtom);
  const filters = useAtomValue(archiveFilters);
  const [, resetFilters] = useAtom(resetArchiveFiltersAtom);
  const [activePanel, setActivePanel] = useAtom(activePanelAtom);
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [selectedDiaryId, setSelectedDiaryId] = useAtom(selectedRecordIdAtom);
  const [visibleResultsCount, setVisibleResultsCount] = useState(6);
  const deferredSearch = useDeferredValue(searchValue);

  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

  const filteredDiaries = getFilteredDiaries(filters, diaries);
  const selectedRecord = diaries
    ? diaries.find((diary) => diary.diaryId === selectedDiaryId)
    : null;
  const activeFilterCount = buildActiveFilterCount(filters);

  const filterPreview = buildFilterPreview(filters);

  const filteredPoints = getFilteredPoints(filters, points);

  useEffect(() => {
    const setResultsCount = () => setVisibleResultsCount(6);
    setResultsCount();
  }, [deferredSearch, filters]);

  useEffect(() => {
    if (searchValue.trim() && activePanel !== "filters") {
      setActivePanel("results");
    }
  }, [activePanel, searchValue, setActivePanel]);

  useEffect(() => {
    if (
      selectedDiaryId &&
      !filteredDiaries.some((diary) => diary.diaryId === selectedDiaryId)
    ) {
      setSelectedDiaryId(null);
    }
  }, [filteredDiaries, selectedDiaryId, setSelectedDiaryId]);

  if (isLoadingDiaries || isLoadingPoints) {
    return (
      <main className="archive-page archive-page--loading">
        <div className="archive-shell archive-shell--status">
          <p className="archive-status__eyebrow">Поиск по дневникам</p>
          <h1>Подгружаем тестовую выборку свидетельств...</h1>
        </div>
      </main>
    );
  }

  if (isErrorDiaries || isErrorPoints || !diaries) {
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
            points={filteredPoints}
            selectedPointId={selectedPointId}
            selectedLayer={selectedLayer}
            hasLeftSidebar={activePanel !== null}
            hasRightSidebar={Boolean(selectedRecord)}
            onSelectPoint={(pointId) => {
              setSelectedPointId(pointId);
              setActivePanel(null);
            }}
            onClearSelection={() => {
              setSelectedPointId(null);
              setActivePanel("results");
            }}
          />

          {/* === ГЛАВНАЯ ОБЕРТКА (Шторка на мобилке / Колонка на десктопе) === */}
          <div
            className={`archive-left-column ${activePanel ? "is-expanded" : "is-collapsed"} ${layerPanelOpen && isMobile ? "has-layer-panel" : ""}`}
            style={
              isMobile
                ? {
                    height: layerPanelOpen
                      ? "520px"
                      : sheetHeightMap[snapPoint],
                    transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }
                : undefined
            }
          >
            {/* В peek — весь видимый участок шторки тянется вверх */}
            {isMobile && snapPoint === "peek" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  cursor: "grab",
                }}
                onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
                onTouchEnd={(e) => {
                  onDragEnd(e.changedTouches[0].clientY);
                }}
                onClick={() => {
                  setSnapPoint("half");
                  setActivePanel("results");
                }}
              />
            )}
            <div
              className="mobile-handle-zone"
              onClick={() => {
                if (snapPoint === "peek") {
                  setSnapPoint("half");
                  setActivePanel("results");
                } else if (snapPoint === "full") {
                  setSnapPoint("half");
                } else {
                  setSnapPoint("peek");
                  setActivePanel(null);
                  setLayerPanelOpen(false);
                }
              }}
              onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
              onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientY)}
            >
              <div className="mobile-handle" />
            </div>

            <div className="archive-topbar">
              {/* Когда открыта панель слоёв — показываем её вместо поиска */}
              {layerPanelOpen && isMobile ? (
                <div
                  className="layer-selection-panel layer-selection-panel--mobile"
                  style={{ flex: 1, overflowY: "auto" }}
                >
                  <div className="layer-modal-header">
                    <h2>Вид карты:</h2>
                    <button
                      className="layer-modal-close-btn"
                      onClick={() => {
                        setLayerPanelOpen(false);
                        setSnapPoint("peek");
                      }}
                    >
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
                        <div className="layer-modal-item__img">
                          <img src={layer.img} alt={layer.label} />
                        </div>
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
                        <div className="layer-modal-item__img">
                          <img src={layer.img} alt={layer.label} />
                        </div>
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
                      setSelectedPointId(null);
                      setActivePanel("results");
                    }}
                    onOpenFilters={() => {
                      setSelectedPointId(null);
                      setActivePanel("filters");
                    }}
                    onApplyFilters={() => {
                      setSelectedPointId(null);
                      setActivePanel("results");
                    }}
                    onResetFilters={() => {
                      resetFilters();
                      setSearchValue("");
                      setSelectedPointId(null);
                      setActivePanel("results");
                    }}
                  />

                  {/* ТАБЫ: всегда на мобилке, только при фильтрах на десктопе */}
                  {(activePanel === "filters" || isMobile) && (
                    <nav className="archive-filter-tabs animate-in">
                      <button
                        type="button"
                        className={`archive-filter-tabs__item ${activeTab === "general" ? "is-active" : ""}`}
                        onClick={() => {
                          setActiveTab("general");
                          if (isMobile) setActivePanel("filters");
                        }}
                      >
                        Общее
                      </button>
                      <button
                        type="button"
                        className={`archive-filter-tabs__item ${activeTab === "place" ? "is-active" : ""}`}
                        onClick={() => {
                          setActiveTab("place");
                          if (isMobile) setActivePanel("filters");
                        }}
                      >
                        Место
                      </button>
                      <button
                        type="button"
                        className={`archive-filter-tabs__item ${activeTab === "person" ? "is-active" : ""}`}
                        onClick={() => {
                          setActiveTab("person");
                          if (isMobile) setActivePanel("filters");
                        }}
                      >
                        Персоналия
                      </button>
                    </nav>
                  )}

                  {filterPreview.length > 0 &&
                    !activePanel &&
                    !selectedRecord && (
                      <div className="archive-filter-summary">
                        {filterPreview.map((item) => (
                          <span key={item} className="chip chip--soft">
                            {item}
                          </span>
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
                  <ArchiveFilters options={options} />
                ) : (
                  <ArchiveResults
                    diaries={filteredDiaries}
                    searchValue={searchValue}
                    selectedDiaryId={selectedDiaryId}
                    visibleCount={visibleResultsCount}
                    onShowMore={() =>
                      setVisibleResultsCount((count) => count + 6)
                    }
                    onSelect={(recordId) => {
                      setSelectedDiaryId(recordId);
                      setActivePanel(null);
                    }}
                  />
                )}
              </div>
            ) : null}
          </div>

          {/* Правый сайдбар (Детали записи) */}
          {selectedDiaryId && (
            <div className="archive-sidebar archive-sidebar--right animate-in">
              <div
                className="mobile-handle"
                onClick={() => {
                  setSelectedDiaryId(null);
                  setActivePanel("results");
                }}
              />
              <ArchiveDetail
                diaryId={selectedDiaryId}
                onClose={() => {
                  setSelectedDiaryId(null);
                  setActivePanel("results");
                }}
              />
            </div>
          )}

          <div className="archive-layer-dock">
            <LayerSwitcher
              onMobileOpen={() => {
                setLayerPanelOpen(true);
                setSnapPoint("full");
                setActivePanel(null);
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Map;
