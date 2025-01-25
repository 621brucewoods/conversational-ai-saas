import { create } from "zustand";

enum ChartTypes {
  BarChart,
  LineChart,
  BubbleChart,
  ScatterPlot,
  BoxPlot,
  Histogram,
  ViolinPlot,
  Heatmap,
  RadarChart,
  StackedBarChart,
  ParallelCoordinatesPlot,
  PieChart,
}

const functions: Record<string, ChartTypes[]> = {
  "CO Emissions Analysis": [
    ChartTypes.BarChart,
    ChartTypes.LineChart,
    ChartTypes.BubbleChart,
  ],
  "NO2 Emissions Analysis": [
    ChartTypes.BarChart,
    ChartTypes.LineChart,
    ChartTypes.BubbleChart,
  ],
  "PM2.5 Analysis": [
    ChartTypes.BarChart,
    ChartTypes.ScatterPlot,
    ChartTypes.BoxPlot,
  ],
  "Crop Monitoring": [
    ChartTypes.LineChart,
    ChartTypes.BarChart,
    ChartTypes.BubbleChart,
  ],
  "Soil Moisture Analysis": [
    ChartTypes.LineChart,
    ChartTypes.BarChart,
    ChartTypes.Histogram,
  ],
  "Yield Prediction": [
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
    ChartTypes.ViolinPlot,
  ],
  "Habitat Suitability Analysis": [
    ChartTypes.BarChart,
    ChartTypes.RadarChart,
    ChartTypes.Heatmap,
  ],
  "Protected Areas Monitoring": [
    ChartTypes.LineChart,
    ChartTypes.RadarChart,
    ChartTypes.StackedBarChart,
  ],
  "Precipitation Trends Analysis": [
    ChartTypes.LineChart,
    ChartTypes.BarChart,
    ChartTypes.BoxPlot,
  ],
  "Temperature Anomalies Detection": [
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
    ChartTypes.Histogram,
  ],
  "Bi-Temporal Coastline Analysis": [
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
    ChartTypes.ParallelCoordinatesPlot,
  ],
  "Time-Series Coastline Analysis and Prediction": [
    ChartTypes.LineChart,
    ChartTypes.BarChart,
    ChartTypes.StackedBarChart,
  ],
  "Land Surface Temperature Analysis": [
    ChartTypes.LineChart,
    ChartTypes.BarChart,
  ],
  "Urban Heat Island (UHI) Analysis": [
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
    ChartTypes.BoxPlot,
  ],
  "Deforestation Monitoring": [
    ChartTypes.LineChart,
    ChartTypes.BarChart,
    ChartTypes.ScatterPlot,
  ],
  "Forest Road Detection": [
    ChartTypes.ScatterPlot,
    ChartTypes.LineChart,
    ChartTypes.ParallelCoordinatesPlot,
  ],
  "Wildfire Risk Assessment": [
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
    ChartTypes.BoxPlot,
  ],
  "Land Use/Land Cover Maps": [
    ChartTypes.PieChart,
    ChartTypes.BarChart,
    ChartTypes.StackedBarChart,
  ],
  "Temporal Change Detection": [
    ChartTypes.LineChart,
    ChartTypes.Heatmap,
    ChartTypes.ScatterPlot,
  ],
  "Urban Green Space Analysis": [
    ChartTypes.BarChart,
    ChartTypes.PieChart,
    ChartTypes.RadarChart,
  ],
  "Drought Assessment": [
    ChartTypes.LineChart,
    ChartTypes.Heatmap,
    ChartTypes.ViolinPlot,
  ],
  "Flood Risk Assessment": [
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
    ChartTypes.Histogram,
  ],
  "Surface Water Maps": [
    ChartTypes.PieChart,
    ChartTypes.LineChart,
    ChartTypes.ScatterPlot,
  ],
};

interface ChartRequestedTypeStore {
  chartTypes: Record<string, ChartTypes[]>;
  setChartTypes: (chartTypes: Record<string, ChartTypes[]>) => void;
  reset: () => void;
}

const useChartRequestedTypeStore = create<ChartRequestedTypeStore>((set) => ({
  chartTypes: functions,
  setChartTypes: (chartTypes) => set({ chartTypes }),
  reset: () => set({ chartTypes: functions }),
}));

export default useChartRequestedTypeStore;
