import React, { useState } from "react";
import { useAtom } from "jotai";
import { Layers, ChevronRight } from "lucide-react";
import { selectedLayerAtom } from "../../store/archiveAtoms";
import type { MapLayerId } from "../../types/archive";

// Данные для слоев (картинки можно положить в public/assets/layers/)
const layerOptions: { id: MapLayerId; label: string; img: string }[] = [
  { id: "modern", label: "1942г.", img: "/assets/layers/1942.jpg" }, // замени на реальные пути
  { id: "retro", label: "1943г.", img: "/assets/layers/1943.jpg" },
  { id: "topo", label: "1944г.", img: "/assets/layers/1944.jpg" },
];

function LayerSwitcher() {
  const [selected, setSelected] = useAtom(selectedLayerAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="layer-switcher-container">
      {/* Основная кнопка "Слои" */}
      <button 
        className={`layer-main-button ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="layer-main-button__preview">
           {/* Тут можно вставить мини-карту или картинку текущего слоя */}
        </div>
        <div className="layer-main-button__label">
          <Layers size={16} strokeWidth={2.5} />
          <span>Слои</span>
        </div>
      </button>

      {/* Выпадающая панель с годами */}
      {isOpen && (
        <div className="layer-selection-panel animate-in slide-in-from-left-2">
          {layerOptions.map((layer) => (
            <button
              key={layer.id}
              className={`layer-item ${selected === layer.id ? "is-active" : ""}`}
              onClick={() => {
                setSelected(layer.id);
                // setIsOpen(false); // расскоментируй, если хочешь чтобы закрывалось после выбора
              }}
            >
              <div className="layer-item__image">
                <img src={layer.img} alt={layer.label} />
              </div>
              <span>{layer.label}</span>
            </button>
          ))}
          
          <button className="layer-item layer-item--more">
            <div className="layer-item__image">
              <Layers size={24} opacity={0.5} />
            </div>
            <span>Еще</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LayerSwitcher;