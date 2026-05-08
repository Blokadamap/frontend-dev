import { useAtom, useAtomValue } from 'jotai';
import { useDeferredValue, useEffect, useState } from 'react';
import ArchiveDetail from '../../components/archive/ArchiveDetail';
import ArchiveMap from '../../components/archive/ArchiveMap';
import ArchiveResults from '../../components/archive/ArchiveResults';
import ArchiveToolbar from '../../components/archive/ArchiveToolbar';
import ArchiveFilters from '../../components/archive/ArchiveFilters';
import LayerSwitcher from '../../components/archive/LayerSwitcher';
import {
    activePanelAtom,
    archiveFilters,
    resetArchiveFiltersAtom,
    searchAtom,
    selectedLayerAtom,
    selectedRecordIdAtom,
    type ArchiveFiltersType,
} from '../../store/archiveAtoms';
import './Map.css';
import { useDiaries } from '../../hooks/diaries/useDiaries';
import { usePoints } from '../../hooks/points/usePoints';
import type { PointResponse } from '../../types/point/point.type';

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
    if (filters.address) res++
    if (filters.birthdayStart) res++
    if (filters.birthdayEnd) res++
    if (filters.building) res++
    if (filters.genders.length != 0) res++
    if (filters.startDate) res++
    if (filters.endDate) res++
    if (filters.street) res++

    return res;
}

function buildFilterPreview(filters: ArchiveFiltersType): string[] {
    const res = [];

    if (filters.authorId) res.push('Поиск по автору');
    if (filters.educations.length != 0)
        res.push('Поиск по образованию: ', filters.educations.map((item) => item.name).join('; '));

    return res;
}

function getFilteredPoints(
    filters: ArchiveFiltersType,
    points: PointResponse[] | undefined
): PointResponse[] {
    let res: PointResponse[] = []
    
    if (!points) return res

    if (filters.street) res = points.filter(point => point.street === filters.street)
    if (filters.building) res = points.filter(point => point.building === filters.building)
    if (filters.district) res = points.filter(point => point.rayon?.name === filters.district)

    return res
}

const options = {
    districts: [],
    spaces: [],
    streets: [],
    buildings: [],
    addresses: [],
};

function Map() {
    const { data: diaries, isLoading: isLoadingDiaries, isError: isErrorDiaries } = useDiaries();
    const { data: points, isLoading: isLoadingPoints, isError: isErrorPoints } = usePoints();

    const [searchValue, setSearchValue] = useAtom(searchAtom);
    const filters = useAtomValue(archiveFilters);
    const [, resetFilters] = useAtom(resetArchiveFiltersAtom);
    const [activePanel, setActivePanel] = useAtom(activePanelAtom);
    const [selectedLayer] = useAtom(selectedLayerAtom);
    const [selectedDiaryId, setSelectedDiaryId] = useAtom(selectedRecordIdAtom);
    const [visibleResultsCount, setVisibleResultsCount] = useState(6);
    const deferredSearch = useDeferredValue(searchValue);

    const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

    const filteredDiaries = diaries ?? [];
    const selectedRecord = diaries
        ? diaries.find((diary) => diary.diaryId === selectedDiaryId)
        : null;
    const activeFilterCount = buildActiveFilterCount(filters);

    const filterPreview = buildFilterPreview(filters);

    const filteredPoints = getFilteredPoints(filters, points) 

    useEffect(() => {
        const setResultsCount = () => setVisibleResultsCount(6);
        setResultsCount();
    }, [deferredSearch, filters]);

    useEffect(() => {
        if (searchValue.trim() && activePanel !== 'filters') {
            setActivePanel('results');
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
                            setActivePanel('results');
                        }}
                    />
                    {/* ux: */}
                    {/* <div className="archive-mode-badge">Поиск по дневникам</div> */}

                    <div className="archive-topbar">
                        <ArchiveToolbar
                            value={searchValue}
                            filterCount={activeFilterCount}
                            isFiltersOpen={activePanel === 'filters'}
                            onChange={setSearchValue}
                            onSearch={() => {
                                setSelectedPointId(null);
                                setActivePanel('results');
                            }}
                            onOpenFilters={() => {
                                setSelectedPointId(null);
                                setActivePanel('filters');
                            }}
                            onApplyFilters={() => {
                                setSelectedPointId(null);
                                setActivePanel('results');
                            }}
                            onResetFilters={() => {
                                resetFilters();
                                setSearchValue('');
                                setSelectedPointId(null);
                                setActivePanel('results');
                            }}
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

                    {activePanel === 'filters' ? (
                        <div className="archive-sidebar archive-sidebar--left">
                            {/* Исправлено: передаем только необходимые опции, остальное компонент берет из атомов */}
                            <ArchiveFilters options={options} />
                        </div>
                    ) : null}

                    {activePanel === 'results' ? (
                        <div className="archive-sidebar archive-sidebar--left">
                            <ArchiveResults
                                diaries={filteredDiaries}
                                searchValue={searchValue}
                                selectedRecordId={selectedDiaryId}
                                visibleCount={visibleResultsCount}
                                onShowMore={() => setVisibleResultsCount((count) => count + 6)}
                                onSelect={(diaryId) => {
                                    setSelectedDiaryId(diaryId);
                                    setActivePanel(null);
                                }}
                            />
                        </div>
                    ) : null}

                    {selectedDiaryId ? (
                        <div className="archive-sidebar archive-sidebar--right">
                            <ArchiveDetail
                                diaryId={selectedDiaryId}
                                onClose={() => {
                                    setSelectedPointId(null);
                                    setActivePanel('results');
                                }}
                            />
                        </div>
                    ) : null}

                    <div className="archive-layer-dock">
                        <LayerSwitcher />
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Map;
