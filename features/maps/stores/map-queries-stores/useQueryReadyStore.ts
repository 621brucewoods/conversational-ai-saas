import { create } from "zustand";

interface QueryState {
  queryReady: boolean;
  setQueryReady: (value: boolean) => void;
  reset: () => void;
}

const useQueryStore = create<QueryState>((set) => ({
  queryReady: false,
  setQueryReady: (value) => set({ queryReady: value }),
  reset: () => set({ queryReady: false }),
}));

export default useQueryStore;
