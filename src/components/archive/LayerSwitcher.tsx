import React from "react";
import { useAtom } from "jotai";
import { selectedLayerAtom } from "../../store/archiveAtoms";
import type { MapLayerId } from "../../types/archive";

const layers: { id: MapLayerId; label: string; desc: string }[] = [
  { id: "modern", label: "СОВРЕМЕННАЯ", desc: "OpenStreetMap" },
  { id: "retro", label: "АРХИВНАЯ", desc: "Аэрофотосъёмка" },
  { id: "topo", label: "ТОПОГРАФИЯ", desc: "Карта 1940 г." },
];

function LayerSwitcher() {
  const [selected, setSelected] = useAtom(selectedLayerAtom);

  return (
    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-2xl border border-[#E8E2D9] shadow-2xl flex gap-1">
      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => setSelected(layer.id)}
          className={`px-4 py-2 rounded-xl transition-all flex flex-col items-start ${
            selected === layer.id 
            ? "bg-[#D8AE76] text-white shadow-inner" 
            : "text-[#737982] hover:bg-[#F0EDE8]"
          }`}
        >
          <span className="text-[9px] font-black tracking-tighter leading-none">{layer.label}</span>
          <span className={`text-[8px] opacity-70 ${selected === layer.id ? "text-white" : "text-[#B5B0A7]"}`}>
            {layer.desc}
          </span>
        </button>
      ))}
    </div>
  );
}

export default LayerSwitcher;
