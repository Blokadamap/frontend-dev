import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { MapLayerId, WitnessRecord } from "../../types/archive";
import "leaflet/dist/leaflet.css";

interface ArchiveMapProps {
  records: WitnessRecord[];
  selectedRecordId: string | null;
  selectedLayer: MapLayerId;
  hasLeftSidebar: boolean;
  hasRightSidebar: boolean;
  onSelectRecord: (recordId: string) => void;
  onClearSelection: () => void;
}

// Добавил заглушки для всех годов, чтобы не было белого экрана
const rasterLayerConfig: Record<string, {
  url: string;
  attribution: string;
  className?: string;
}> = {
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
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap",
    className: "archive-map__tiles--topo",
  },
  // Заглушки: пока нет своих тайлов, используем topo с его стилями
  "1942": { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "1942", className: "archive-map__tiles--topo" },
  "1943": { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "1943", className: "archive-map__tiles--topo" },
  "1944": { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "1944", className: "archive-map__tiles--topo" },
  "1945": { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "1945", className: "archive-map__tiles--topo" },
  "1946": { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "1946", className: "archive-map__tiles--topo" },
  "1947": { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "1947", className: "archive-map__tiles--topo" },
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
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 960px)").matches) {
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

function ClearSelectionHandler({ onClearSelection }: { onClearSelection: () => void }) {
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
  records,
  selectedRecord,
  hasLeftSidebar,
  hasRightSidebar,
}: {
  records: WitnessRecord[];
  selectedRecord: WitnessRecord | undefined;
  hasLeftSidebar: boolean;
  hasRightSidebar: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const viewport = getViewportConfig(hasLeftSidebar, hasRightSidebar);

    if (selectedRecord) {
      map.flyTo(selectedRecord.markerPosition, 17.2, {
        animate: true,
        duration: 0.85,
      });
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

    const bounds = L.latLngBounds(records.map((r) => r.markerPosition));
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
  }, [map, records, selectedRecord, hasLeftSidebar, hasRightSidebar]);

  return null;
}

function ArchiveMap({
  records,
  selectedRecordId,
  selectedLayer,
  hasLeftSidebar,
  hasRightSidebar,
  onSelectRecord,
  onClearSelection,
}: ArchiveMapProps) {
  const selectedRecord = records.find((record) => record.id === selectedRecordId);
  
  // Добавил страховку (fallback): если ID не найден в конфиге, берем modern
  const layerConfig = rasterLayerConfig[selectedLayer] || rasterLayerConfig.modern;

  return (
    <MapContainer
      center={[59.9386, 30.3141]}
      zoom={12.5}
      zoomControl={false}
      className={`archive-map archive-map--${selectedLayer}`}
      attributionControl={false}
    >
      {/* 
        ВАЖНО: Добавил key={selectedLayer}. 
        Это заставляет Leaflet перерисовать тайлы при смене ID.
      */}
      <TileLayer
        key={selectedLayer}
        url={layerConfig.url}
        attribution={layerConfig.attribution}
        className={layerConfig.className}
      />

      <MapViewport
        records={records}
        selectedRecord={selectedRecord}
        hasLeftSidebar={hasLeftSidebar}
        hasRightSidebar={hasRightSidebar}
      />

      <MapLayoutWatcher
        hasLeftSidebar={hasLeftSidebar}
        hasRightSidebar={hasRightSidebar}
        selectedLayer={selectedLayer}
      />

      <ClearSelectionHandler onClearSelection={onClearSelection} />

      {records.map((record) => {
        const isSelected = record.id === selectedRecordId;
        return (
          <Marker
            key={`${record.id}-${isSelected}`} 
            position={record.markerPosition}
            icon={createMarkerIcon(isSelected)}
            eventHandlers={{
              click: () => onSelectRecord(record.id),
            }}
          />
        );
      })}
    </MapContainer>
  );
}

export default ArchiveMap;