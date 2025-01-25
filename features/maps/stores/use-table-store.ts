import { create } from "zustand";

interface TableState {
  vectorLayersInTable: string[];
  selectedVectorLayerInTable: string;
  selectedFeatureInTable: Feature | null;
  isTableOpen: boolean;
  toggleTable: () => void;
  setTableOpen: (value: boolean) => void;
  setSelectedVectorLayerInTable: (layer: string) => void;
  setSelectedFeatureInTable: (feature: Feature) => void;
  selectedFeatureToDelete: Feature | null;
  deleteSelectedFeature: (feature: Feature) => void;
  addVectorLayer: (layer: string) => void;
  removeVectorLayer: (layer: string) => void;

  // ← Add the reset method
  reset: () => void;
}

// Reusable initial state
const initialState = {
  vectorLayersInTable: [] as string[],
  selectedVectorLayerInTable: "",
  selectedFeatureInTable: null as Feature | null,
  isTableOpen: false,
  selectedFeatureToDelete: null as Feature | null,
};

const useTableStore = create<TableState>((set) => ({
  ...initialState,

  toggleTable: () => set((state) => ({ isTableOpen: !state.isTableOpen })),
  setTableOpen: (value) => set({ isTableOpen: value }),

  setSelectedVectorLayerInTable: (layer) =>
    set({ selectedVectorLayerInTable: layer }),

  setSelectedFeatureInTable: (feature) =>
    set({ selectedFeatureInTable: feature }),

  deleteSelectedFeature: (feature) => set({ selectedFeatureToDelete: feature }),

  addVectorLayer: (layer) =>
    set((state) => ({
      vectorLayersInTable: [...state.vectorLayersInTable, layer],
    })),

  removeVectorLayer: (layer) =>
    set((state) => ({
      vectorLayersInTable: state.vectorLayersInTable.filter(
        (existingLayer) => existingLayer !== layer
      ),
    })),

  // Reset everything to the initial defaults
  reset: () => set({ ...initialState }),
}));

export default useTableStore;
