import { useState } from "react";
import { useAtom } from "jotai";
import { Layers, X } from "lucide-react";
import { selectedLayerAtom } from "../../store/archiveAtoms";
import type { MapLayerId } from "../../types/archive";


const HISTORICAL_LAYERS = [
  { id: "1942", label: "1942г.", img: "/assets/layers/1942.jpg" },
  { id: "1943", label: "1943г.", img: "/assets/layers/1943.jpg" },
  { id: "1944", label: "1944г.", img: "/assets/layers/1944.jpg" },
  { id: "1945", label: "1945г.", img: "/assets/layers/placeholder.jpg" },
  { id: "1946", label: "1946г.", img: "/assets/layers/placeholder.jpg" },
  { id: "1947", label: "1947г.", img: "/assets/layers/placeholder.jpg" },
];

const BASE_LAYERS = [
  { id: "retro", label: "Спутник", img: "/src/assets/layers/tomsk.png" },
  { id: "modern", label: "По умолчанию", img: "/src/assets/layers/default.png" },
];

function LayerSwitcher() {
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectLayer = (layerId: MapLayerId) => {
    setSelectedLayer(layerId);
  };

  return (
    <div className="layer-switcher-wrapper">
      {!isModalOpen && (
        <button className="layer-main-button" onClick={() => setIsModalOpen(true)}>
          <div className="layer-main-button__label">
            <Layers size={20} />
            <span>Слои</span>
          </div>
        </button>
      )}

      {isModalOpen && (
        <div className="layer-selection-panel animate-in fade-in slide-in-from-bottom-2">
          <div className="layer-modal-header">
            <h2>Вид карты:</h2>
            <button className="layer-modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="layer-modal-grid">
            {/* ui_kit это компонент icon_button */}
            {HISTORICAL_LAYERS.map((layer, index) => (
              <button
                key={index}
                className={`layer-modal-item ${selectedLayer === layer.id ? "is-active" : ""}`}
                onClick={() => handleSelectLayer(layer.id as MapLayerId)}
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
                onClick={() => handleSelectLayer(layer.id as MapLayerId)}
              >
                <div className="layer-modal-item__img">
                  <img src={layer.img} alt={layer.label} />
                </div>
                <span>{layer.label}</span>
              </button>
            ))}
            <div className="layer-modal-item-placeholder"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayerSwitcher;