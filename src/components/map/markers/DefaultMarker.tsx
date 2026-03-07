import { Marker, Tooltip } from "react-leaflet";
import { useEffect, useState } from "react";
import { redIcon } from "../iconsForMarker/RedIcon";
import { blueIcon } from "../iconsForMarker/CustomIcon";
import { Icon, type IconOptions } from "leaflet";
import type { MarkerType } from "../../../types/map/markers.type";

interface DefaultMarkerProps {
  marker: MarkerType;
}

// На основе полей маркера будем определять маркер
// Нужна синхронизация маркеров по полям (какие поля будут определять цвет маркера, подсказку и тип, если такие вообще будут)

function DefaultMarker({ marker }: DefaultMarkerProps) {
  const [icon, setIcon] = useState<Icon<IconOptions>>(blueIcon);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const name = marker.name ?? "";
  const colorIcon = marker.colorIcon ?? "";
  const position = marker.position;

  useEffect(() => {
    // выбор цвета иконок
    const loadIcon = () => {
      if (!colorIcon) {
        setIcon(redIcon);
      } else {
        switch (colorIcon) {
          case "red":
            setIcon(redIcon);
            break;
          case "blue":
            setIcon(blueIcon);
            break;            
        }
      }

      setIsLoading(false);
    };

    loadIcon();
  }, [colorIcon]);

  return (
    <>
      {!isLoading && (
        <Marker position={position} icon={icon}>
          {name && (
            // подсказка для маркера
            <Tooltip permanent direction="top" offset={[0, 0]}>
              <b>{name}</b>
            </Tooltip>
          )}
        </Marker>
      )}
    </>
  );
}

export default DefaultMarker;
