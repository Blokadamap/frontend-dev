import L from 'leaflet';

// предлагаю сделать отдельную иконку для каждой метки (разделение по типу: метка достопримечательности или метка события)
// разделять будем по типу или цвету, согласуем с бэком по типам или цветам

// иконка красного цвета
export const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});