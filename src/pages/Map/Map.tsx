/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import ArchiveDetailDiary from "../../components/archive/ArchiveDetailDiary";
import ArchiveDetailPoint from "../../components/archive/ArchiveDetailPoint";
import ArchiveFilters from "../../components/archive/ArchiveFilters";
import ArchiveMap from "../../components/archive/ArchiveMap";
import ArchiveResults from "../../components/archive/ArchiveResults";
import ArchiveToolbar from "../../components/archive/ArchiveToolbar";
import LayerSwitcher, {
  BASE_LAYERS,
} from "../../components/archive/LayerSwitcher";
import MapFlyoutHeader from "../../components/layout/MapFlyoutHeader";
import { useDiaries } from "../../hooks/diaries/useDiaries";
import { usePoints } from "../../hooks/points/usePoints";
import { usePointTypes } from "../../hooks/points/usePointTypes";
import { useFilteredNotes } from "../../hooks/notes/useFilteredNotes";
import { useServerFilter } from "../../hooks/useServerFilter";
import { pointMatchesPlace, buildPointAddress } from "../../utils/filters";
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
  if (filters.hasChildren) res++;
  if (filters.building) res++;
  if (filters.genders.length != 0) res++;
  if (filters.startDate) res++;
  if (filters.endDate) res++;
  if (filters.street) res++;
  if (filters.district) res++;
  if (filters.placeKind) res++;
  if (filters.pointType) res++;
  if (filters.pointSubtype) res++;
  if (filters.pointSubsubtype) res++;

  return res;
}

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
  const { data: pointTypes } = usePointTypes();

  const [searchValue, setSearchValue] = useAtom(searchAtom);
  const filters = useAtomValue(archiveFilters);
  const deferredSearch = useDeferredValue(searchValue);

  // Опции вкладки «Место»: район/улица/здание/адрес — из самих точек,
  // тип/подтип места — из справочника типов.
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

  // Серверная фильтрация по заметкам/персоналиям → id точек и дневников.
  const serverFilter = useServerFilter(filters, deferredSearch);
  // Точка видна, если проходит фильтры «Место» (клиент) и серверное
  // ограничение по свидетельствам (если оно активно).
  const visiblePoints = useMemo(
    () =>
      (points ?? []).filter(
        (p) =>
          pointMatchesPlace(p, filters) &&
          (serverFilter.pointIdFilter == null ||
            serverFilter.pointIdFilter.has(p.pointId)),
      ),
    [points, filters, serverFilter],
  );
  const [, resetFilters] = useAtom(resetArchiveFiltersAtom);
  const [activePanel, setActivePanel] = useAtom(activePanelAtom);
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [selectedDiaryId, setSelectedDiaryId] = useAtom(selectedRecordIdAtom);
  const [visibleResultsCount, setVisibleResultsCount] = useState(6);

  // Свидетельства для панели результатов. При активном поиске/фильтрации
  // берём отфильтрованные заметки; иначе (свежая выборка) — все заметки.
  const allNotesQuery = useFilteredNotes(
    {},
    activePanel === "results" &&
      serverFilter.notes == null &&
      !serverFilter.isFiltering,
  );
  const resultNotes = serverFilter.notes ?? allNotesQuery.data ?? [];

  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const selectedRecord = diaries
    ? diaries.find((diary) => diary.diaryId === selectedDiaryId)
    : null;
  const activeFilterCount = buildActiveFilterCount(filters);

  useEffect(() => {
    const setResultsCount = () => setVisibleResultsCount(6);
    setResultsCount();
  }, [deferredSearch, filters]);

  useEffect(() => {
    if (!isMobile) return;

    const swap = (a?: "peek" | "half") => {
      if (a) {
        setSnapPoint(a);
      } else {
        setSnapPoint((p) => (p === "peek" ? "half" : p));
      }
    };

    if (activePanel) {
      swap();
    } else swap("peek");
  }, [activePanel, isMobile]);


  useEffect(() => {
    if (
      selectedDiaryId &&
      diaries &&
      !diaries.some((diary) => diary.diaryId === selectedDiaryId)
    ) {
      setSelectedDiaryId(null);
    }
  }, [diaries, selectedDiaryId, setSelectedDiaryId]);

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
      <MapFlyoutHeader />
      <section className="archive-shell">
        <div className="archive-stage">
          <ArchiveMap
            points={visiblePoints}
            selectedPointId={selectedPointId}
            selectedLayer={selectedLayer}
            hasLeftSidebar={activePanel !== null}
            hasRightSidebar={Boolean(selectedRecord)}
            onSelectPoint={(pointId) => {
              setSelectedDiaryId(null);
              setSelectedNoteId(null);
              setSelectedPointId(pointId);
              setActivePanel(null);
            }}
            onSelectNote={(pointId, noteId) => {
              setSelectedDiaryId(null);
              setSelectedPointId(pointId);
              setSelectedNoteId(noteId);
              setActivePanel(null);
            }}
            onClearSelection={() => {
              setSelectedPointId(null);
              setSelectedNoteId(null);
              setActivePanel(null);
            }}
          />

          {/* === ГЛАВНАЯ ОБЕРТКА (Шторка на мобилке / Колонка на десктопе) === */}
          <div
            className={`archive-left-column ${activePanel ? "is-expanded" : "is-collapsed"} ${layerPanelOpen && isMobile ? "has-layer-panel" : ""}`}
            style={
              isMobile
                ? {
                    height: selectedRecord
                      ? "0px"
                      : layerPanelOpen
                        ? "200px"
                        : sheetHeightMap[snapPoint],
                    overflow: "hidden",
                    pointerEvents: selectedRecord ? "none" : undefined,
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

            <div
              className="archive-topbar"
              style={{ position: "relative", zIndex: 60 }}
            >
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
                  <div className="layer-modal-grid base-grid">
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
                    isResultsOpen={activePanel === "results"}
                    onChange={(next) => {
                      setSearchValue(next);
                      // Пока есть текст — показываем живые результаты;
                      // очистка возвращает к карте (не трогая панель фильтров).
                      if (next.trim()) {
                        setSelectedPointId(null);
                        setSelectedDiaryId(null);
                        setActivePanel("results");
                      } else if (activePanel === "results") {
                        setActivePanel(null);
                      }
                    }}
                    onSearch={() => {
                      setSelectedPointId(null);
                      setSelectedDiaryId(null);
                      setActivePanel("results");
                    }}
                    onOpenFilters={() => {
                      setSelectedPointId(null);
                      setSelectedDiaryId(null);
                      setActivePanel("filters");
                    }}
                    onApplyFilters={() => {
                      setSelectedPointId(null);
                      setSelectedDiaryId(null);
                      setActivePanel(null);
                    }}
                    onResetFilters={() => {
                      resetFilters();
                      setSearchValue("");
                      setSelectedPointId(null);
                      setSelectedNoteId(null);
                      setSelectedDiaryId(null);
                      setActiveTab("general");
                      setActivePanel(null);
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
                        Свидетельство
                      </button>
                      <button
                        type="button"
                        className={`archive-filter-tabs__item ${activeTab === "person" ? "is-active" : ""}`}
                        onClick={() => {
                          setActiveTab("person");
                          if (isMobile) setActivePanel("filters");
                        }}
                      >
                        Автор
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
                    </nav>
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
                    notes={resultNotes}
                    diaries={diaries}
                    points={points ?? []}
                    searchValue={searchValue}
                    visibleCount={visibleResultsCount}
                    onShowMore={() =>
                      setVisibleResultsCount((count) => count + 6)
                    }
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
              <ArchiveDetailDiary
                diaryId={selectedDiaryId}
                onClose={() => {
                  setSelectedDiaryId(null);
                  setActivePanel("results");
                }}
              />
            </div>
          )}

          {selectedPointId && (
            <div className="archive-sidebar archive-sidebar--right animate-in">
              <div
                className="mobile-handle"
                onClick={() => {
                  setSelectedPointId(null);
                  setSelectedNoteId(null);
                  setActivePanel(null);
                }}
              />
              <ArchiveDetailPoint
                pointId={selectedPointId}
                selectedNoteId={selectedNoteId}
                noteIdFilter={serverFilter.noteIdFilter}
                onClose={() => {
                  setSelectedPointId(null);
                  setSelectedNoteId(null);
                  setActivePanel(null);
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