import { create } from "zustand";
import useROIStore from "./use-roi-store";
import useMapLayersStore from "./use-map-layer-store";

interface ZoomInLayerState {
  zoomRequestWithGeometry: ROIGeometry | null;
  setZoomRequestWithGeometry: (layerName: string | null) => void;

  zoomRequestFromTable: Feature | null;
  setZoomRequestFromTable: (feature: Feature | null) => void;

  // ← Add the reset method
  reset: () => void;
}

// Define the initial defaults for easy reference
const initialState = {
  zoomRequestWithGeometry: null as ROIGeometry | null,
  zoomRequestFromTable: null as Feature | null,
};

const useZoomRequestStore = create<ZoomInLayerState>((set) => ({
  ...initialState,

  setZoomRequestFromTable: (feature) => {
    set({ zoomRequestFromTable: feature });
  },

  setZoomRequestWithGeometry: (layerName) => {
    set({ zoomRequestWithGeometry: null });
    if (!layerName) {
      return;
    }
    const getLayerPropertiesByName =
      useMapLayersStore.getState().getLayerPropertiesByName;
    const mapLayer = getLayerPropertiesByName(layerName);

    const isLayerTypeROI = mapLayer?.layerType === "roi";

    let roiName = "";
    if (isLayerTypeROI) {
      roiName = layerName;
    } else {
      roiName = mapLayer?.roiName || "";
    }

    const geometry = useROIStore.getState().getRoiGeometryByName(roiName);

    set({ zoomRequestWithGeometry: geometry });
  },

  // Reset method to revert the store to initial state
  reset: () => {
    set({ ...initialState });
  },
}));

export default useZoomRequestStore;
