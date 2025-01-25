import { create } from "zustand";

interface QueryRasterFromVectorLayerState {
  isQueryActive: boolean;
  setIsQueryActive: (isActive: boolean) => void;
  reset: () => void;
}

const useQueryRasterFromVectorLayerStore =
  create<QueryRasterFromVectorLayerState>((set) => ({
    isQueryActive: false,
    setIsQueryActive: (isActive) => set({ isQueryActive: isActive }),
    reset: () => set({ isQueryActive: false }),
  }));

export default useQueryRasterFromVectorLayerStore;
