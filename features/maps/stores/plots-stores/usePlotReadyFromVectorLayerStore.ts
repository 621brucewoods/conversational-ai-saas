import { create } from "zustand";

interface PlotReadyState {
  plotReadyDataFromVectorLayer: {
    data: any | null;
    functionTypeForVectorLayer: string | "";
  };
  setPlotReadyDataFromVectorLayer: (
    data: any,
    functionTypeForVectorLayer: string
  ) => void;

  plotReadyDataForSelectedFeatureFromTable: {
    data: any | null;
    functionTypeForSelectedFeature: string | "";
  };
  setPlotReadyDataForSelectedFeatureFromTable: (
    data: any,
    functionTypeForSelectedFeature: string
  ) => void;

  plotReadyDataForSelectedAreaOnMap: {
    data: any | null;
    functionTypeForSelectedArea: string | "";
  };
  setPlotReadyDataForSelectedAreaOnMap: (
    data: any,
    functionTypeForSelectedArea: string
  ) => void;

  reset: () => void;
}

const usePlotReadyDataFromVectorLayerStore = create<PlotReadyState>((set) => ({
  plotReadyDataFromVectorLayer: {
    data: null,
    functionTypeForVectorLayer: "",
  },
  setPlotReadyDataFromVectorLayer: (
    data: any,
    functionTypeForVectorLayer: string
  ) =>
    set({ plotReadyDataFromVectorLayer: { data, functionTypeForVectorLayer } }),

  plotReadyDataForSelectedFeatureFromTable: {
    data: null,
    functionTypeForSelectedFeature: "",
  },
  setPlotReadyDataForSelectedFeatureFromTable: (
    data: any,
    functionTypeForSelectedFeature: string
  ) =>
    set({
      plotReadyDataForSelectedFeatureFromTable: {
        data,
        functionTypeForSelectedFeature,
      },
    }),

  plotReadyDataForSelectedAreaOnMap: {
    data: null,
    functionTypeForSelectedArea: "",
  },
  setPlotReadyDataForSelectedAreaOnMap: (
    data: any,
    functionTypeForSelectedArea: string
  ) =>
    set({
      plotReadyDataForSelectedAreaOnMap: { data, functionTypeForSelectedArea },
    }),
  reset: () =>
    set({
      plotReadyDataFromVectorLayer: {
        data: null,
        functionTypeForVectorLayer: "",
      },
      plotReadyDataForSelectedFeatureFromTable: {
        data: null,
        functionTypeForSelectedFeature: "",
      },
      plotReadyDataForSelectedAreaOnMap: {
        data: null,
        functionTypeForSelectedArea: "",
      },
    }),
}));

export default usePlotReadyDataFromVectorLayerStore;
