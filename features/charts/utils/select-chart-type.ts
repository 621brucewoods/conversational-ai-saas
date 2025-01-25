enum ChartTypes {
  BarChartNumerical = "barChartNumerical",
  DualBarChartNumerical = "dualBarChartNumerical",
  BarChartPercentage = "barChartPercentage",
  BarChartStats = "barChartStats",
  StackedBarChartStats = "stackedBarChartStats",
  StackedPercentageBarChartStats = "stackedPercentageBarChartStats",
  StackedBarChartForLandcoverChangeMaps = "stackedBarChartForLandcoverChangeMaps",
  CombinedStackedBarChartStats = "combinedStackedBarChartStats",
  LineChart = "lineChart",
  TimeSeries = "timeSeries",
  DualTimeSeries = "dualTimeSeriesChart",
  BoxplotTimeseries = "boxplotTimeseries",
  BubbleChart = "bubbleChart",
  ScatterPlot = "scatterPlot",
  BoxPlot = "boxPlot",
  HistogramChart = "histogram",
  ViolinPlot = "violinPlot",
  Heatmap = "heatmap",
  RadarChart = "radarChart",
  StackedBarChart = "stackedBarChart",
  ParallelCoordinatesPlot = "parallelCoordinatesPlot",
  PieChart = "pieChart",
  PieChartPercentage = "pieChartPercentage",
}

const selectChartType = () => {
  const handleSelectChartType = (functionType: string) => {
    switch (functionType) {
      // Group equivalent cases
      case "Land Use/Land Cover Maps":
        return {
          statsChart: ChartTypes.PieChartPercentage,
          queryChart: ChartTypes.BarChartPercentage,
        };

      case "CO Emissions Analysis":
      case "CH4 Emissions Analysis":
      case "NO2 Emissions Analysis":
      case "PM2.5 Analysis":
      case "Vulnerability Assessment":
        return {
          statsChart: ChartTypes.BarChartStats,
          queryChart: ChartTypes.BarChartNumerical,
          unit: "mol/m²",
        };

      case "Urban Heat Island (UHI) Analysis":
        return {
          statsChart: ChartTypes.BoxplotTimeseries,
          queryChart: ChartTypes.BarChartNumerical,
          customTimeseriesChart: ChartTypes.TimeSeries,
          unit: "°C",
        };

      case "Air Pollutation Analysis":
        return {
          statsChart: ChartTypes.CombinedStackedBarChartStats,
          queryChart: ChartTypes.DualBarChartNumerical,
          customTimeseriesChart: ChartTypes.DualTimeSeries,
          unit: "%",
        };

      case "Land Use/Land Cover Change Maps":
        return {
          statsChart: ChartTypes.StackedBarChartForLandcoverChangeMaps,
          queryChart: ChartTypes.StackedBarChartForLandcoverChangeMaps,
        };

      default:
        return {
          statsChart: ChartTypes.LineChart,
          queryChart: ChartTypes.LineChart,
        };
    }
  };

  return handleSelectChartType;
};

export default selectChartType;
