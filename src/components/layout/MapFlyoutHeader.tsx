import SiteNav from "./SiteNav";
import "./Header.css";

/**
 * Выплывающий хедер для страницы карты: появляется при наведении курсора
 * на верхнюю кромку экрана (или при фокусе внутри — для клавиатуры).
 */
function MapFlyoutHeader() {
  return (
    <div className="map-flyout">
      <div className="map-flyout__trigger" aria-hidden="true" />
      <div className="map-flyout__bar">
        <SiteNav />
      </div>
    </div>
  );
}

export default MapFlyoutHeader;
