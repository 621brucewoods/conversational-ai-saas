import { create } from "zustand";

interface GeeOutputItem {
  layerName: string;
  urlFormat?: string;
  mapStats?: any;
  uhiMetrics?: any;
  legendConfig?: any;
}

interface GeeOutputState {
  geeLayersList: GeeOutputItem[];
  tempCreatedMapInAssetsPath: Record<string, any>;
  addNewGeeOutput: (output: GeeOutputItem) => void;
  getGeeOutputByLayerName: (layerName: string) => GeeOutputItem | undefined;
  getLastAddedGeeOutput: () => GeeOutputItem | undefined;
  addTempCreatedMapInAssetsPath: (
    layerName: string,
    tempMapInAssets: any
  ) => void;
  removeTempCreatedMapInAssetsPath: (layerName: string) => void;
  getTempCreatedMapInAssetsPath: (layerName: string) => any | undefined;
  removeGeeLayer: (layerName: string) => void;
  reset: () => void;
}

export const useGeeOutputStore = create<GeeOutputState>((set, get) => ({
  geeLayersList: [],
  tempCreatedMapInAssetsPath: {},

  addNewGeeOutput: (output) =>
    set((state) => {
      // Check if a layer with the same name already exists
      const exists = state.geeLayersList.some(
        (item) => item.layerName === output.layerName
      );

      // Only add if the layer name doesn't exist
      if (!exists) {
        return {
          geeLayersList: [...state.geeLayersList, output],
        };
      }

      // If layer name exists, return state unchanged
      return state;
    }),

  getGeeOutputByLayerName: (layerName) =>
    get().geeLayersList.find((item) => item.layerName === layerName),

  getLastAddedGeeOutput: () =>
    get().geeLayersList[get().geeLayersList.length - 1],

  addTempCreatedMapInAssetsPath: (layerName, tempMapInAssetsPath) => {
    const currentTempMapsInAssetsPath = get().tempCreatedMapInAssetsPath;
    set({
      tempCreatedMapInAssetsPath: {
        ...currentTempMapsInAssetsPath,
        [layerName]: tempMapInAssetsPath,
      },
    });
  },

  removeTempCreatedMapInAssetsPath: (layerName: string) => {
    const { [layerName]: _, ...rest } = get().tempCreatedMapInAssetsPath;
    set({ tempCreatedMapInAssetsPath: rest });
  },

  getTempCreatedMapInAssetsPath: (layerName: string) => {
    const currentTempMapsInAssetsPath = get().tempCreatedMapInAssetsPath;
    return currentTempMapsInAssetsPath[layerName];
  },

  // New method: remove items from geeLayersList with the given layerName
  removeGeeLayer: (layerName: string) => {
    set((state) => ({
      geeLayersList: state.geeLayersList.filter(
        (item) => item.layerName !== layerName
      ),
    }));
  },
  reset: () =>
    set({
      geeLayersList: [],
      tempCreatedMapInAssetsPath: {},
    }),
}));
