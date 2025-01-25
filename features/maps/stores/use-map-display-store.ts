import { create } from "zustand";

interface MapDisplayState {
  isMapReady: boolean;
  mapMaximizeRequested: boolean;
  isMapChartPanelOpen: boolean;
  isMapLayersPanelOpen: boolean;
  mapContainerIds: string[];
  displayMapRequestedFromChatResponse: boolean;
  displayRawMapRequestedFromInsightsViewerIcon: boolean;

  setMapReady: (ready: boolean) => void;
  toggleMapReady: () => void;
  toggleMapChartPanel: () => void;
  toggleMapLayersPanel: () => void;
  setMapMaximizeRequested: (maximize: boolean) => void;
  setDisplayMapRequestedFromChatResponse: (open: boolean) => void;
  setDisplayRawMapRequestedFromInsightsViewerIcon: (open: boolean) => void;
  toggleMapMaximizeRequested: () => void;
  addMapContainerId: (id: string) => void;
  removeMapContainerId: (id: string) => void;
  hasMapContainerId: (id: string) => boolean;

  // ← Add the reset method
  reset: () => void;
}

const initialState = {
  isMapReady: false,
  mapMaximizeRequested: false,
  isMapChartPanelOpen: false,
  isMapLayersPanelOpen: false,
  mapContainerIds: [] as string[],
  displayMapRequestedFromChatResponse: false,
  displayRawMapRequestedFromInsightsViewerIcon: false,
};

const useMapDisplayStore = create<MapDisplayState>((set) => ({
  ...initialState,

  setMapReady: (ready: boolean) => set({ isMapReady: ready }),
  toggleMapReady: () => set((state) => ({ isMapReady: !state.isMapReady })),

  toggleMapChartPanel: () =>
    set((state) => ({ isMapChartPanelOpen: !state.isMapChartPanelOpen })),

  toggleMapLayersPanel: () =>
    set((state) => ({ isMapLayersPanelOpen: !state.isMapLayersPanelOpen })),

  setMapMaximizeRequested: (maximize: boolean) =>
    set({ mapMaximizeRequested: maximize }),

  toggleMapMaximizeRequested: () =>
    set((state) => ({ mapMaximizeRequested: !state.mapMaximizeRequested })),

  setDisplayMapRequestedFromChatResponse: (open: boolean) =>
    set({ displayMapRequestedFromChatResponse: open }),

  setDisplayRawMapRequestedFromInsightsViewerIcon: (open: boolean) =>
    set({ displayRawMapRequestedFromInsightsViewerIcon: open }),

  addMapContainerId: (id: string) =>
    set((state) => ({
      mapContainerIds: [...state.mapContainerIds, id],
    })),

  removeMapContainerId: (id: string) =>
    set((state) => ({
      mapContainerIds: state.mapContainerIds.filter(
        (containerId) => containerId !== id
      ),
    })),

  hasMapContainerId: (id: string): boolean =>
    !!useMapDisplayStore.getState().mapContainerIds.includes(id),

  // Reset the store to its initial state
  reset: () => set({ ...initialState }),
}));

export default useMapDisplayStore;
