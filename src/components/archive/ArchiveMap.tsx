import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { MapLayerId } from "../../types/archive";
import { type PointResponse } from "../../types/point/point.type";
import { type CoordinateItem } from "../../types/point/point.type";
import "leaflet/dist/leaflet.css";

function countAveragePosition(
  coordinateItems: CoordinateItem[] | undefined,
): [number, number] {
  if (!coordinateItems?.length) return [0, 0];

  let lat = 0;
  let lng = 0;

  for (const coor of coordinateItems) {
    lat += coor.latitude;
    lng += coor.longitude;
  }

  return [lat / coordinateItems.length, lng / coordinateItems.length];
}

// Один маркер на место. Координата берётся из фиксированной точки места
// (pointCoordinates), а если её нет (место без фиксированной координаты —
// кладбище, площадь) — как среднее координат его свидетельств
// (noteCoordinates). Клик всегда открывает место со списком всех его
// свидетельств (noteId = null).
type PointMarker = { position: [number, number]; noteId: number | null };

function getPointMarkers(point: PointResponse): PointMarker[] {
  const coordinates = point.pointCoordinates?.length
    ? point.pointCoordinates
    : point.noteCoordinates ?? [];
  return [{ position: countAveragePosition(coordinates), noteId: null }];
}

function getPointMarkerPositions(point: PointResponse): [number, number][] {
  return getPointMarkers(point).map((marker) => marker.position);
}

function averageOfPositions(positions: [number, number][]): [number, number] {
  if (!positions.length) return [0, 0];
  let lat = 0;
  let lng = 0;
  for (const [la, lo] of positions) {
    lat += la;
    lng += lo;
  }
  return [lat / positions.length, lng / positions.length];
}

interface ArchiveMapProps {
  points: PointResponse[];
  selectedPointId: number | null;
  selectedLayer: MapLayerId;
  hasLeftSidebar: boolean;
  hasRightSidebar: boolean;
  onSelectPoint: (pointId: number) => void;
  onSelectNote: (pointId: number, noteId: number) => void;
  onClearSelection: () => void;
}

// Граница покрытия исторического скана «Mil.-Geo.-Plan von Leningrad» (1941),
// в координатах [[югЗапад],[северВосток]] — за её пределами тайлы не запрашиваются.
const HISTORICAL_1941_BOUNDS: [[number, number], [number, number]] = [
  [59.8559, 30.1904],
  [60.0594, 30.5200],
];

// Граница покрытия карты Ленинграда 1925 г. (собрана из листов, привязана
// по контрольным точкам).
const HISTORICAL_1925_BOUNDS: [[number, number], [number, number]] = [
  [59.8724, 30.2014],
  [60.0210, 30.4761],
];

// Граница покрытия плана Ленинграда 1940 г.
const HISTORICAL_1940_BOUNDS: [[number, number], [number, number]] = [
  [59.8393, 30.1904],
  [60.0594, 30.5310],
];

// Добавил заглушки для всех годов, чтобы не было белого экрана
const rasterLayerConfig: Record<
  string,
  {
    url: string;
    attribution: string;
    className?: string;
    // Необязательные параметры для собственных растровых тайлов (XYZ).
    maxNativeZoom?: number;
    minNativeZoom?: number;
    bounds?: [[number, number], [number, number]];
    // Базовая подложка под полупрозрачный исторический слой.
    baseUnder?: string;
  }
> = {
  modern: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    className: "archive-map__tiles--modern",
  },
  retro: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    className: "archive-map__tiles--retro",
  },
  // Исторический план Ленинграда 1941 г. (немецкий военный «Mil.-Geo.-Plan»),
  // привязан по контрольным точкам и нарезан на собственные XYZ-тайлы.
  // Нативные тайлы до z15, дальше Leaflet масштабирует их сам.
  "1941": {
    url: "/tiles/1941/{z}/{x}/{y}.webp",
    attribution: "Mil.-Geo.-Plan von Leningrad, 1941",
    className: "archive-map__tiles--1941",
    maxNativeZoom: 15,
    minNativeZoom: 11,
    bounds: HISTORICAL_1941_BOUNDS,
    baseUnder: "modern",
  },
  // Карта Ленинграда 1925 г. (русская, собрана из районных листов),
  // привязана по контрольным точкам и нарезана в собственные XYZ-тайлы.
  "1925": {
    url: "/tiles/1925/{z}/{x}/{y}.webp",
    attribution: "Карта Ленинграда, 1925 г.",
    className: "archive-map__tiles--1925",
    maxNativeZoom: 15,
    minNativeZoom: 11,
    bounds: HISTORICAL_1925_BOUNDS,
    baseUnder: "modern",
  },
  // План Ленинграда 1940 г. (Лениздат), привязан по контрольным точкам.
  "1940": {
    url: "/tiles/1940/{z}/{x}/{y}.webp",
    attribution: "План Ленинграда, 1940 г. (Лениздат)",
    className: "archive-map__tiles--1940",
    maxNativeZoom: 15,
    minNativeZoom: 11,
    bounds: HISTORICAL_1940_BOUNDS,
    baseUnder: "modern",
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap",
    className: "archive-map__tiles--topo",
  },
  // Заглушки: пока нет своих тайлов, используем topo с его стилями
  "1942": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "1942",
    className: "archive-map__tiles--topo",
  },
  "1943": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "1943",
    className: "archive-map__tiles--topo",
  },
  "1944": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "1944",
    className: "archive-map__tiles--topo",
  },
  "1945": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "1945",
    className: "archive-map__tiles--topo",
  },
  "1946": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "1946",
    className: "archive-map__tiles--topo",
  },
  "1947": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "1947",
    className: "archive-map__tiles--topo",
  },
};

function createMarkerIcon(selected: boolean) {
  return L.divIcon({
    className: "archive-marker-wrapper",
    html: `<span class="archive-marker-pin${selected ? " is-selected" : ""}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

function getViewportConfig(hasLeftSidebar: boolean, hasRightSidebar: boolean) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 960px)").matches
  ) {
    return {
      paddingTopLeft: [24, 24] as [number, number],
      paddingBottomRight: [24, 24] as [number, number],
      panBy: [0, 0] as [number, number],
    };
  }

  return {
    paddingTopLeft: [hasLeftSidebar ? 364 : 48, 122] as [number, number],
    paddingBottomRight: [hasRightSidebar ? 360 : 48, 118] as [number, number],
    panBy: hasRightSidebar ? [-194, 0] : hasLeftSidebar ? [168, 0] : [0, 0],
  };
}

function ClearSelectionHandler({
  onClearSelection,
}: {
  onClearSelection: () => void;
}) {
  useMapEvents({
    click: () => onClearSelection(),
  });
  return null;
}

function MapLayoutWatcher({
  hasLeftSidebar,
  hasRightSidebar,
  selectedLayer,
}: {
  hasLeftSidebar: boolean;
  hasRightSidebar: boolean;
  selectedLayer: MapLayerId;
}) {
  const map = useMap();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      map.invalidateSize({ animate: false, pan: false });
    });
    return () => cancelAnimationFrame(frameId);
  }, [map, hasLeftSidebar, hasRightSidebar, selectedLayer]);

  return null;
}

function MapViewport({
  points,
  selectedPoint,
  hasLeftSidebar,
  hasRightSidebar,
}: {
  points: PointResponse[];
  selectedPoint: PointResponse | undefined;
  hasLeftSidebar: boolean;
  hasRightSidebar: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const viewport = getViewportConfig(hasLeftSidebar, hasRightSidebar);

    if (selectedPoint) {
      map.flyTo(
        averageOfPositions(getPointMarkerPositions(selectedPoint)),
        17.2,
        {
          animate: true,
          duration: 0.85,
        },
      );
      if (viewport.panBy[0] !== 0 || viewport.panBy[1] !== 0) {
        map.once("moveend", () => {
          map.panBy(L.point(viewport.panBy[0], viewport.panBy[1]), {
            animate: true,
            duration: 0.35,
          });
        });
      }
      return;
    }

    const bounds = L.latLngBounds(
      points.flatMap((point) => getPointMarkerPositions(point)),
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        animate: true,
        duration: 0.85,
        paddingTopLeft: viewport.paddingTopLeft,
        paddingBottomRight: viewport.paddingBottomRight,
        maxZoom: 14,
      });
      return;
    }

    map.setView([59.9386, 30.3141], 12.5, { animate: true });
  }, [map, points, selectedPoint, hasLeftSidebar, hasRightSidebar]);

  return null;
}

function ArchiveMap({
  points,
  selectedPointId,
  selectedLayer,
  hasLeftSidebar,
  hasRightSidebar,
  onSelectPoint,
  onSelectNote,
  onClearSelection,
}: ArchiveMapProps) {
  const selectedPoint = points.find(
    (point) => point.pointId === selectedPointId,
  );
  const layerConfig = rasterLayerConfig[selectedLayer];

  return (
    <MapContainer
      center={[59.9386, 30.3141]}
      zoom={12.5}
      zoomControl={false}
      className={`archive-map archive-map--${selectedLayer}`}
      attributionControl={false}
    >
      {/*
        Если у слоя есть базовая подложка (исторический полупрозрачный план),
        сначала рисуем её, чтобы за пределами скана была видна обычная карта.
      */}
      {layerConfig.baseUnder && rasterLayerConfig[layerConfig.baseUnder] && (
        <TileLayer
          key={`base-${layerConfig.baseUnder}`}
          url={rasterLayerConfig[layerConfig.baseUnder].url}
          className={rasterLayerConfig[layerConfig.baseUnder].className}
        />
      )}

      {/*
        ВАЖНО: Добавил key={selectedLayer}.
        Это заставляет Leaflet перерисовать тайлы при смене ID.
      */}
      <TileLayer
        key={selectedLayer}
        url={layerConfig.url}
        attribution={layerConfig.attribution}
        className={layerConfig.className}
        maxNativeZoom={layerConfig.maxNativeZoom}
        minNativeZoom={layerConfig.minNativeZoom}
        bounds={layerConfig.bounds}
      />

      <MapViewport
        points={points}
        selectedPoint={selectedPoint}
        hasLeftSidebar={hasLeftSidebar}
        hasRightSidebar={hasRightSidebar}
      />

      <MapLayoutWatcher
        hasLeftSidebar={hasLeftSidebar}
        hasRightSidebar={hasRightSidebar}
        selectedLayer={selectedLayer}
      />

      <ClearSelectionHandler onClearSelection={onClearSelection} />

      {points.flatMap((point) => {
        const isSelected = point.pointId === selectedPointId;
        // Для нефиксированных мест — по маркеру на каждое свидетельство;
        // клик по такому маркеру открывает именно эту цитату (noteId).
        return getPointMarkers(point).map((marker, index) => (
          <Marker
            key={`${point.pointId}-${index}-${isSelected}`}
            position={marker.position}
            icon={createMarkerIcon(isSelected)}
            eventHandlers={{
              click: () =>
                marker.noteId != null
                  ? onSelectNote(point.pointId, marker.noteId)
                  : onSelectPoint(point.pointId),
            }}
          />
        ));
      })}
    </MapContainer>
  );
}

export default ArchiveMap;
