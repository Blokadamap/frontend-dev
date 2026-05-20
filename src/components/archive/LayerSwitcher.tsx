import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Layers, X } from "lucide-react";
import { selectedLayerAtom } from "../../store/archiveAtoms";
import type { MapLayerId } from "../../types/archive";
import './LayerSwitcher.css';

export const HISTORICAL_LAYERS = [
  { id: "1942", label: "1942г.", img: "/assets/layers/1942.jpg" },
  { id: "1943", label: "1943г.", img: "/assets/layers/1943.jpg" },
  { id: "1944", label: "1944г.", img: "/assets/layers/1944.jpg" },
  { id: "1945", label: "1945г.", img: "/assets/layers/placeholder.jpg" },
  { id: "1946", label: "1946г.", img: "/assets/layers/placeholder.jpg" },
  { id: "1947", label: "1947г.", img: "/assets/layers/placeholder.jpg" },
];

export const BASE_LAYERS = [
  { id: "retro", label: "Спутник", img: "/src/assets/layers/tomsk.png" },
  { id: "modern", label: "По умолчанию", img: "/src/assets/layers/default.png" },
];

interface LayerSwitcherProps {
  onMobileOpen?: () => void;
}

function LayerImg({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="layer-modal-item__img">
      {!loaded && !error && (
        <div className="layer-img-spinner">
          <span className="layer-img-spinner__dot" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{ display: loaded && !error ? "block" : "none" }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {error && <div className="layer-img-placeholder" />}
    </div>
  );
}

function LayerSwitcher({ onMobileOpen }: LayerSwitcherProps) {
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth <= 960
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="layer-switcher-wrapper">
      <button
        className="layer-main-button"
        onClick={() => {
          if (isMobile) onMobileOpen?.();
          else setIsDesktopOpen((v) => !v);
        }}
      >
        <div className="layer-main-button__label">
          <Layers size={20} />
          <span>Слои</span>
        </div>
      </button>

      {/* Только десктоп */}
      {isDesktopOpen && !isMobile && (
        <div className="layer-selection-panel animate-in">
          <div className="layer-modal-header">
            <h2>Вид карты:</h2>
            <button className="layer-modal-close-btn" onClick={() => setIsDesktopOpen(false)}>
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="layer-modal-grid base-grid">
            {BASE_LAYERS.map((layer, index) => (
              <button
                key={index}
                className={`layer-modal-item ${selectedLayer === layer.id ? "is-active" : ""}`}
                onClick={() => setSelectedLayer(layer.id as MapLayerId)}
              >
                <LayerImg src={layer.img} alt={layer.label} />
                <span>{layer.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LayerSwitcher;