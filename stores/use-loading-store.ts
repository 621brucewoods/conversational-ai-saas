import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  isLocal: boolean;
  setLoading: (loading: boolean, local?: boolean) => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  isLocal: false,
  setLoading: (loading, local = false) =>
    set({ isLoading: loading, isLocal: local }),
}));

export default useLoadingStore;
