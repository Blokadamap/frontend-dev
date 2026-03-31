import type { MapLayerId } from "../../types/archive";

interface LayerSwitcherProps {
  value: MapLayerId;
  onChange: (layer: MapLayerId) => void;
}

const layers: { id: MapLayerId; label: string }[] = [
  { id: "modern", label: "Современная" },
  { id: "retro", label: "Аэро" },
  { id: "topo", label: "Топологическая" },
];

function LayerSwitcher({ value, onChange }: LayerSwitcherProps) {
  return (
    <section className="archive-layer-switcher">
      <span className="archive-layer-switcher__label">Слой карты</span>
      <div>
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className={value === layer.id ? "is-active" : ""}
            onClick={() => onChange(layer.id)}
          >
            {layer.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default LayerSwitcher;
