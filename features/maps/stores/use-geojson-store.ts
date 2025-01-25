import { create } from "zustand";

interface GeojsonItem {
  name: string;
  data: any;
}

interface GeojsonState {
  geojsonData: GeojsonItem[];
  addGeojsonData: (name: string, data: any) => void;
  clearGeojsonData: () => void;
  getGeojsonDataByName: (name: string) => any | null;
  getLastGeojsonData: () => GeojsonItem | null;
  removeGeojsonDataByName: (name: string) => void;
  reset: () => void;
}

const useGeojsonStore = create<GeojsonState>((set, get) => ({
  geojsonData: [],
  addGeojsonData: (name, data) =>
    set((state) => ({ geojsonData: [...state.geojsonData, { name, data }] })),
  clearGeojsonData: () => set({ geojsonData: [] }),
  getGeojsonDataByName: (name) => {
    const item = get().geojsonData.find((item) => item.name === name);
    return item ? item.data : null;
  },
  getLastGeojsonData: () => {
    const geojsonData = get().geojsonData;
    return geojsonData.length > 0 ? geojsonData[geojsonData.length - 1] : null;
  },
  removeGeojsonDataByName: (name) =>
    set((state) => ({
      geojsonData: state.geojsonData.filter((item) => item.name !== name),
    })),
  reset: () => set({ geojsonData: [] }),
}));

export default useGeojsonStore;
