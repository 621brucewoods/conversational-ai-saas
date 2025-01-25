import { create } from "zustand";

interface PlotReadyState {
  plotReadyData: {
    data: any | null;
    chartType: string | null;
  };
  setPlotReadyData: (data: any, chartType: string) => void;
  reset: () => void;
}

const usePlotReadyDataStore = create<PlotReadyState>((set) => ({
  plotReadyData: {
    data: null,
    chartType: null,
  },
  setPlotReadyData: (data: any, chartType: string) =>
    set({ plotReadyData: { data, chartType } }),
  reset: () =>
    set({
      plotReadyData: {
        data: null,
        chartType: null,
      },
    }),
}));

export default usePlotReadyDataStore;
