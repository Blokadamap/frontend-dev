import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./DefaultMap.css";
import L from "leaflet";
import DefaultMarker from "../markers/DefaultMarker";
import type { MarkerType } from "../../../types/map/markers.type";

// пока первый слой
// можно будет сделать отдельный компонент components/map/allMaps где будем создавать их слоями

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface DefaultMapProps {
  markers?: MarkerType[]
}

function DefaultMap({markers}: DefaultMapProps) {
  return (
    <MapContainer
      center={[59.95, 30.316667]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />

      {markers && markers.map((marker) => (
        <DefaultMarker marker={marker}/>
      ))}
    </MapContainer>
  );
}

export default DefaultMap;
