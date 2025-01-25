import { create } from "zustand";

interface QueryState {
  queryOutputReadyFromVectorLayer: boolean;
  setQueryOutputReadyFromVectorLayer: (value: boolean) => void;
  reset: () => void;
}

const useQueryOutputReadyFromVectorLayer = create<QueryState>((set) => ({
  queryOutputReadyFromVectorLayer: false,
  setQueryOutputReadyFromVectorLayer: (value) =>
    set({ queryOutputReadyFromVectorLayer: value }),
  reset: () => set({ queryOutputReadyFromVectorLayer: false }),
}));

export default useQueryOutputReadyFromVectorLayer;
