import React, { useState } from "react";
import { useAtom } from "jotai";
import { Layers, X } from "lucide-react";
import { selectedLayerAtom } from "../../store/archiveAtoms";
import type { MapLayerId } from "../../types/archive";

// Все доступные слои по категориям
const historicalLayers: { id: MapLayerId; label: string; img: string }[] = [
  { id: "modern", label: "1942г.", img: "https://placehold.co/100x100/333/fff?text=1942" },
  { id: "retro", label: "1943г.", img: "https://placehold.co/100x100/333/fff?text=1943" },
  { id: "topo", label: "1944г.", img: "https://placehold.co/100x100/333/fff?text=1944" },
  { id: "modern" as MapLayerId, label: "xxxxг.", img: "https://placehold.co/100x100/333/999?text=xxxx" },
  { id: "modern" as MapLayerId, label: "xxxxг.", img: "https://placehold.co/100x100/333/999?text=xxxx" },
  { id: "modern" as MapLayerId, label: "xxxxг.", img: "https://placehold.co/100x100/333/999?text=xxxx" },
];

const baseLayers: { id: MapLayerId; label: string; img: string }[] = [
  { id: "retro" as MapLayerId, label: "Спутник", img: "https://placehold.co/100x100/223/fff?text=Sat" },
  { id: "modern" as MapLayerId, label: "По умолчанию", img: "https://placehold.co/100x100/eee/333?text=Def" },
];

function LayerSwitcher() {
  const [selected, setSelected] = useAtom(selectedLayerAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="layer-switcher-wrapper">
      {/* Маленькая квадратная кнопка (всегда видна слева) */}
      <button className="layer-main-button" onClick={() => setIsModalOpen(true)}>
        <div className="layer-main-button__label">
          <Layers size={16} />
          <span>Слои</span>
        </div>
      </button>

      {/* Полноэкранное меню выбора (как на скрине) */}
      {isModalOpen && (
        <div className="layer-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="layer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="layer-modal-header">
              <h2>Вид карты:</h2>
            </div>

            {/* Сетка исторических слоев */}
            <div className="layer-modal-grid">
              {historicalLayers.map((layer, index) => (
                <button
                  key={index}
                  className={`layer-modal-item ${selected === layer.id ? "is-active" : ""}`}
                  onClick={() => setSelected(layer.id)}
                >
                  <div className="layer-modal-item__img">
                    <img src={layer.img} alt={layer.label} />
                  </div>
                  <span>{layer.label}</span>
                </button>
              ))}
            </div>

            <hr className="layer-modal-divider" />

            {/* Базовые слои */}
            <div className="layer-modal-grid base-grid">
              {baseLayers.map((layer, index) => (
                <button
                  key={index}
                  className={`layer-modal-item ${selected === layer.id ? "is-active" : ""}`}
                  onClick={() => setSelected(layer.id)}
                >
                  <div className="layer-modal-item__img">
                    <img src={layer.img} alt={layer.label} />
                  </div>
                  <span>{layer.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayerSwitcher;