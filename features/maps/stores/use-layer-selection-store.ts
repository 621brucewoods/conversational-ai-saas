import { create } from "zustand";

interface LayerState {
  selectedRasterLayer: {
    layerName: string;
  };

  setSelectRasterLayer: (layerName: string) => void;
  reset: () => void;
}

const useLayerSelectionStore = create<LayerState>((set) => ({
  selectedRasterLayer: {
    layerName: "",
  },

  setSelectRasterLayer: (layerName) =>
    set({ selectedRasterLayer: { layerName } }),
  reset: () => set({ selectedRasterLayer: { layerName: "" } }),
}));

export default useLayerSelectionStore;
