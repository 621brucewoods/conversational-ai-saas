"use client";

import React, { useEffect, useState, useMemo } from "react";
import isEqual from "lodash.isequal";

import selectChartType from "@/features/charts/utils/select-chart-type";
import usePlotReadyDataFromVectorLayerStore from "@/features/maps/stores/plots-stores/usePlotReadyFromVectorLayerStore";
import useLayerSelectionStore from "@/features/maps/stores/use-layer-selection-store";
import useMapLayersStore from "@/features/maps/stores/use-map-layer-store";
import useFunctionStore from "@/features/maps/stores/use-function-store";
import useMapDisplayStore from "@/features/maps/stores/use-map-display-store";

// Components
import Chart from "./charts";

// -----------------------------------------------------
// ChartStatsDisplay
// -----------------------------------------------------

interface ChartStatsDisplayProps {
  layerName: string;
  mapStats: any;
  legendConfig: any;
  functionType: string;
}

export const ChartStatsDisplay = ({
  layerName,
  mapStats,
  functionType,
  legendConfig,
}: ChartStatsDisplayProps) => {
  const handleSelectChartType = selectChartType();
  const [palette, setPalette] = useState<any>(null);

  const chartType = useMemo(
    () => handleSelectChartType(functionType),
    [functionType, handleSelectChartType]
  );

  useEffect(() => {
    if (!layerName || !mapStats) {
      setPalette(null);
      return;
    }

    if (
      chartType.queryChart === "barChartPercentage" ||
      chartType.queryChart === "stackedBarChartForLandcoverChangeMaps"
    ) {
      const newPalette = {
        labels: legendConfig?.labelNamesStats || legendConfig?.labelNames,
        palette: legendConfig?.statsPalette || legendConfig?.palette,
      };

      if (!isEqual(palette, newPalette)) {
        setPalette(newPalette);
      }
    } else {
      if (palette !== null) {
        setPalette(null);
      }
    }
  }, [layerName, mapStats, chartType.queryChart, legendConfig, palette]);

  // Helper function to render stats charts
  const renderStatsChart = () => {
    if (!layerName || !mapStats) return <div />;

    switch (chartType.statsChart) {
      case "boxplotTimeseries":
        return (
          <Chart
            data={mapStats}
            chartType="boxplotTimeseries"
            chartTitle={layerName}
            palette={palette}
          />
        );
      case "pieChartPercentage":
        return (
          <Chart
            data={mapStats}
            chartType="pieChartStats"
            chartTitle={layerName}
            palette={palette}
          />
        );
      case "barChartStats":
        return (
          <Chart
            data={mapStats}
            chartType="barChartStats"
            chartTitle={layerName}
            palette={palette}
          />
        );
      case "stackedBarChartStats":
        return (
          <Chart
            data={mapStats}
            chartType="stackedBarChartStats"
            chartTitle={layerName}
            palette={palette}
          />
        );
      case "stackedPercentageBarChartStats":
        return (
          <Chart
            data={mapStats}
            chartType="stackedPercentageBarChartStats"
            chartTitle={layerName}
            palette={palette}
          />
        );
      case "combinedStackedBarChartStats":
        return (
          <Chart
            data={mapStats}
            chartType="combinedStackedBarChartStats"
            chartTitle={layerName}
            palette={palette}
          />
        );
      case "stackedBarChartForLandcoverChangeMaps":
        return (
          <Chart
            data={{
              year1Distribution: mapStats.year1Distribution,
              year2Distribution: mapStats.year2Distribution,
            }}
            chartType="stackedBarChartForLandcoverChangeMaps"
            chartTitle={layerName}
            palette={palette}
          />
        );
      default:
        return <div />;
    }
  };

  return (
    <div
      className="flex flex-col justify-center items-center h-full w-full overflow-hidden 
        gap-2 bg-secondary/20 rounded-xl border border-stone-300 dark:border-stone-600"
    >
      {renderStatsChart()}
    </div>
  );
};

ChartStatsDisplay.displayName = "ChartStatsDisplay";

// -----------------------------------------------------
// ChartQueryDisplay
// -----------------------------------------------------

export const ChartQueryDisplay = React.memo(() => {
  const handleSelectChartType = selectChartType();
  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [data, setData] = useState<any | null>(null);
  const [palette, setPalette] = useState<any>(null);
  const [queryIsReady, setQueryIsReady] = useState(false);
  const [isSelectedAreaOnMapUpdated, setIsSelectedAreaOnMapUpdated] =
    useState(false);

  const {
    plotReadyDataForSelectedAreaOnMap,
    setPlotReadyDataForSelectedAreaOnMap,
    setPlotReadyDataForSelectedFeatureFromTable,
  } = usePlotReadyDataFromVectorLayerStore();

  const { removeLayerSignal } = useMapLayersStore();
  const selectedRasterLayer = useLayerSelectionStore(
    (state) => state.selectedRasterLayer
  );
  const getFunctionConfig = useFunctionStore(
    (state) => state.getFunctionConfig
  );

  const toggleMapChartPanel = useMapDisplayStore(
    (state) => state.toggleMapChartPanel
  );
  const isMapChartPanelOpen = useMapDisplayStore(
    (state) => state.isMapChartPanelOpen
  );

  useEffect(() => {
    if (isMapChartPanelOpen) {
      setQueryIsReady(true);
    } else {
      setQueryIsReady(false);
      setData(null);
    }
  }, [isMapChartPanelOpen]);

  useEffect(() => {
    if (
      plotReadyDataForSelectedAreaOnMap.data &&
      selectedRasterLayer.layerName
    ) {
      const functionConfig = getFunctionConfig(selectedRasterLayer.layerName);
      const legendConfig = functionConfig?.legendConfig;
      setData(plotReadyDataForSelectedAreaOnMap.data);

      const functionType = functionConfig?.functionType;
      const newChartType = handleSelectChartType(functionType as string);
      setSelectedChartType(newChartType.queryChart);

      setPalette({
        labels: legendConfig?.labelNamesStats || legendConfig?.labelNames,
        palette: legendConfig?.statsPalette || legendConfig?.palette,
      });

      // Ensure panel is open
      if (!isMapChartPanelOpen) {
        toggleMapChartPanel();
      }

      // Reset area update
      if (isSelectedAreaOnMapUpdated) {
        setIsSelectedAreaOnMapUpdated(false);
      }
    }
  }, [
    isSelectedAreaOnMapUpdated,
    plotReadyDataForSelectedAreaOnMap.data,
    selectedRasterLayer.layerName,
    getFunctionConfig,
    handleSelectChartType,
    isMapChartPanelOpen,
    toggleMapChartPanel,
  ]);

  // Clear data when layer is removed
  useEffect(() => {
    if (removeLayerSignal) {
      setPlotReadyDataForSelectedAreaOnMap(null, "");
      setPlotReadyDataForSelectedFeatureFromTable(null, "");
      setData(null);
    }
  }, [
    removeLayerSignal,
    setPlotReadyDataForSelectedAreaOnMap,
    setPlotReadyDataForSelectedFeatureFromTable,
  ]);

  // Clear data when user changes the selectedRasterLayer
  useEffect(() => {
    if (selectedRasterLayer) {
      setData(null);
    }
  }, [selectedRasterLayer]);

  // Render a chart if data is present
  const renderQueryChart = () => {
    // Checking logic (error prone; should be refactored):
    // data?.outputsFromMap?.monoTemporalQueryValues?.length
    // data?.outputsFromMap?.biTemporalQueryValues?.length
    // data?.outputsFromMap?.length

    if (!data || !data.outputsFromMap || !queryIsReady) return null;

    const { monoTemporalQueryValues, biTemporalQueryValues, length } =
      data.outputsFromMap;

    const hasMonoTemporal = Array.isArray(monoTemporalQueryValues)
      ? monoTemporalQueryValues.length > 0
      : Object.values(monoTemporalQueryValues || {}).some((val) => val != null);

    // Check if there's actual data
    const hasData =
      hasMonoTemporal ||
      (biTemporalQueryValues && biTemporalQueryValues.length > 0) ||
      (length && length > 0);

    if (!hasData) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p>No Data Available for this location</p>
        </div>
      );
    }

    // If bi-temporal data is present
    if (biTemporalQueryValues && biTemporalQueryValues.length > 0) {
      return (
        <Chart
          data={{
            year1Distribution: biTemporalQueryValues[0].year1Distribution,
            year2Distribution: biTemporalQueryValues[0].year2Distribution,
          }}
          chartType={selectedChartType}
          chartTitle="Aggregated Query"
          palette={palette}
        />
      );
    }

    // Otherwise, just display data.outputsFromMap
    return (
      <Chart
        data={data.outputsFromMap}
        chartType={selectedChartType}
        chartTitle="Aggregated Query"
        palette={palette}
      />
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {renderQueryChart()}
    </div>
  );
});

ChartQueryDisplay.displayName = "ChartQueryDisplay";

// -----------------------------------------------------
// ChartTimeseriesQueryDisplay
// -----------------------------------------------------

export const ChartTimeseriesQueryDisplay = React.memo(() => {
  const handleSelectChartType = selectChartType();
  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [data, setData] = useState<any | null>(null);
  const [palette, setPalette] = useState<any>(null);
  const [queryIsReady, setQueryIsReady] = useState(false);
  const [isSelectedAreaOnMapUpdated, setIsSelectedAreaOnMapUpdated] =
    useState(false);

  const {
    plotReadyDataForSelectedAreaOnMap,
    setPlotReadyDataForSelectedAreaOnMap,
    setPlotReadyDataForSelectedFeatureFromTable,
  } = usePlotReadyDataFromVectorLayerStore();

  const { removeLayerSignal } = useMapLayersStore();
  const selectedRasterLayer = useLayerSelectionStore(
    (state) => state.selectedRasterLayer
  );

  const isMapChartPanelOpen = useMapDisplayStore(
    (state) => state.isMapChartPanelOpen
  );

  const getFunctionConfig = useFunctionStore(
    (state) => state.getFunctionConfig
  );

  // Toggle panel open/closed
  useEffect(() => {
    if (isMapChartPanelOpen) {
      setQueryIsReady(true);
    } else {
      setQueryIsReady(false);
      setData(null);
    }
  }, [isMapChartPanelOpen]);

  // Handle data for selected area on map
  useEffect(() => {
    if (
      plotReadyDataForSelectedAreaOnMap.data &&
      selectedRasterLayer.layerName
    ) {
      const functionConfig = getFunctionConfig(selectedRasterLayer.layerName);
      const legendConfig = functionConfig?.legendConfig;
      const functionType = functionConfig?.functionType;

      setData(plotReadyDataForSelectedAreaOnMap.data);

      const newChartType = handleSelectChartType(functionType as string);
      setSelectedChartType(
        newChartType.customTimeseriesChart || "timeSeriesNumericalQuery"
      );

      setPalette({
        labels: legendConfig?.labelNames,
        palette: legendConfig?.palette,
      });

      if (isSelectedAreaOnMapUpdated) {
        setIsSelectedAreaOnMapUpdated(false);
      }
    }
  }, [
    isSelectedAreaOnMapUpdated,
    plotReadyDataForSelectedAreaOnMap.data,
    selectedRasterLayer.layerName,
    getFunctionConfig,
    handleSelectChartType,
  ]);

  // Clear data when layer is removed
  useEffect(() => {
    if (removeLayerSignal) {
      setPlotReadyDataForSelectedAreaOnMap(null, "");
      setPlotReadyDataForSelectedFeatureFromTable(null, "");
      setData(null);
    }
  }, [
    removeLayerSignal,
    setPlotReadyDataForSelectedAreaOnMap,
    setPlotReadyDataForSelectedFeatureFromTable,
  ]);

  // Guard for missing timeSeriesQueryValues
  if (!data?.outputsFromMap?.timeSeriesQueryValues) {
    return null;
  }

  // Render time-series chart
  const renderTimeSeriesChart = () => {
    const timeSeries = data.outputsFromMap.timeSeriesQueryValues;
    const hasData =
      (Array.isArray(timeSeries) && timeSeries.length > 0) ||
      Object.values(timeSeries).some(
        (value) => Array.isArray(value) && value.length > 0
      );

    if (!hasData && queryIsReady) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p>No Data Available for this location</p>
        </div>
      );
    }

    if (!hasData || !queryIsReady) return null;

    return (
      <Chart
        data={timeSeries}
        chartType={selectedChartType}
        chartTitle="Time Series Query"
        palette={palette}
      />
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {renderTimeSeriesChart()}
    </div>
  );
});

ChartTimeseriesQueryDisplay.displayName = "ChartTimeseriesQueryDisplay";
