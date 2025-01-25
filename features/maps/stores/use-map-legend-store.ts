import { create } from "zustand";

// Define the type for the configuration object
type LegendConfig = {
  min?: number;
  max?: number;
  palette?: string[];
  labelNames?: string[];
};

// Define the type for each legend entry
interface LegendEntry {
  layerName: string;
  config: LegendConfig;
}

// Define the type for the store's state
interface MapLegendState {
  legends: LegendEntry[];
  addLegend: (layerName: string, config: LegendConfig) => void;
  updateLegend: (layerName: string, config: LegendConfig) => void;
  removeLegend: (layerName: string) => void;
  getLegend: (layerName: string) => LegendEntry | undefined;
  reset: () => void; // ← Add the reset method
}

const useMapLegendStore = create<MapLegendState>((set, get) => ({
  legends: [],

  addLegend: (layerName, config) =>
    set((state) => ({
      legends: [...state.legends, { layerName, config }],
    })),

  updateLegend: (layerName, config) =>
    set((state) => ({
      legends: state.legends.map((legend) =>
        legend.layerName === layerName ? { layerName, config } : legend
      ),
    })),

  removeLegend: (layerName) =>
    set((state) => ({
      legends: state.legends.filter((legend) => legend.layerName !== layerName),
    })),

  getLegend: (layerName) =>
    get().legends.find((legend) => legend.layerName === layerName),

  // Reset the store to its initial state
  reset: () => set({ legends: [] }),
}));

export default useMapLegendStore;
