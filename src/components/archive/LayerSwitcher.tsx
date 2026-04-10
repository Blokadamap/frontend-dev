import { useState } from "react";
import { useAtom } from "jotai";
import { Layers, X } from "lucide-react"; // Добавили X
import { selectedLayerAtom } from "../../store/archiveAtoms";
import type { MapLayerId } from "../../types/archive";

const historicalLayers = [
  { id: "modern", label: "1942г.", img: "/assets/layers/1942.jpg" },
  { id: "retro", label: "1943г.", img: "/assets/layers/1943.jpg" },
  { id: "topo", label: "1944г.", img: "/assets/layers/1944.jpg" },
  { id: "modern_2", label: "xxxxг.", img: "/assets/layers/placeholder.jpg" },
  { id: "modern_3", label: "xxxxг.", img: "/assets/layers/placeholder.jpg" },
  { id: "modern_4", label: "xxxxг.", img: "/assets/layers/placeholder.jpg" },
];

function LayerSwitcher() {
  const [selected, setSelected] = useAtom(selectedLayerAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="layer-switcher-wrapper">
      {/* Кнопка показывается ТОЛЬКО если меню закрыто */}
      {!isModalOpen && (
        <button className="layer-main-button" onClick={() => setIsModalOpen(true)}>
          <div className="layer-main-button__label">
            <Layers size={16} />
            <span>Слои</span>
          </div>
        </button>
      )}

      {/* Окно выбора слоев */}
      {isModalOpen && (
        <div className="layer-selection-panel animate-in fade-in slide-in-from-bottom-2">
          <div className="layer-modal-header">
            <h2>Вид карты:</h2>
            {/* Тот самый крестик из дизайна */}
            <button className="layer-modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="layer-modal-grid">
            {historicalLayers.map((layer, index) => (
              <button
                key={index}
                className={`layer-modal-item ${selected === layer.id ? "is-active" : ""}`}
                onClick={() => setSelected(layer.id as MapLayerId)}
              >
                <div className="layer-modal-item__img">
                  <img src={layer.img} alt={layer.label} />
                </div>
                <span>{layer.label}</span>
              </button>
            ))}
          </div>

          <hr className="layer-modal-divider" />

          <div className="layer-modal-grid base-grid">
            <button className="layer-modal-item" onClick={() => setSelected("retro")}>
              <div className="layer-modal-item__img shadow-sm">
                 <img src="/assets/layers/sat.jpg" alt="Спутник" />
              </div>
              <span>Спутник</span>
            </button>
            <button className="layer-modal-item" onClick={() => setSelected("modern")}>
              <div className="layer-modal-item__img shadow-sm">
                 <img src="/assets/layers/def.jpg" alt="По умолчанию" />
              </div>
              <span>По умолчанию</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayerSwitcher;