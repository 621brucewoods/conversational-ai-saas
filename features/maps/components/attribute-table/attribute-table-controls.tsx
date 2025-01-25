"use client";

import React, { useState, useEffect } from "react";
import { IconFocusCentered, IconTrash } from "@tabler/icons-react";
import useQueryRasterFromVectorLayerStore from "../../stores/map-queries-stores/useQueryRasterFromVectorLayerStore";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useLayerSelectionStore from "../../stores/use-layer-selection-store";
import usePlotReadyDataFromVectorLayerStore from "../../stores/plots-stores/usePlotReadyFromVectorLayerStore";
import useDrawnFeatureOnMapStore from "../../stores/use-drawn-feature-on-map-store";
import useTableStore from "../../stores/use-table-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { set } from "lodash";

interface AttributeTableControlsProps {
  isDataAvailable: boolean;
  handleZoomInQuery: () => void;
  setSelectedRow: (row: number | null) => void;
  onClose: () => void;
}

interface RasterLayerProps {
  name: string;
}

const AttributeTableControls = ({
  isDataAvailable,
  handleZoomInQuery,
  setSelectedRow,
  onClose,
}: AttributeTableControlsProps) => {
  const { selectedDrawnFeature, removeDrawnFeature } =
    useDrawnFeatureOnMapStore();
  const { mapLayers } = useMapLayersStore();
  const { setIsQueryActive } = useQueryRasterFromVectorLayerStore();
  const deleteSelectedFeature = useTableStore(
    (state) => state.deleteSelectedFeature
  );
  const setSelectRasterLayer = useLayerSelectionStore(
    (state) => state.setSelectRasterLayer
  );
  const { setPlotReadyDataForSelectedFeatureFromTable } =
    usePlotReadyDataFromVectorLayerStore();
  const { drawnFeaturesOnMap } = useDrawnFeatureOnMapStore();
  const [currentRasterLayer, setCurrentRasterLayer] =
    useState<RasterLayerProps>({ name: "" });
  const [availableRasterLayers, setAvailableRasterLayers] = useState<any[]>([]);

  const handleDeleteFeatures = () => {
    if (selectedDrawnFeature) {
      setSelectedRow(null);
      removeDrawnFeature(selectedDrawnFeature.UID);
      deleteSelectedFeature(selectedDrawnFeature);
    }
  };

  function handleQueryRaster() {
    setIsQueryActive(true);
  }

  useEffect(() => {
    const rasterLayers = mapLayers.filter(({ type }) => type === "raster");
    setAvailableRasterLayers(rasterLayers);
    const lastRasterLayer =
      rasterLayers.length > 0 ? rasterLayers[rasterLayers.length - 1] : null;
    if (lastRasterLayer) {
      const tempCurrentLayer = { name: lastRasterLayer.name };
      setCurrentRasterLayer(tempCurrentLayer);
      setSelectRasterLayer(tempCurrentLayer.name);
    } else {
      setCurrentRasterLayer({ name: "" });
      setSelectRasterLayer("");
    }
  }, [mapLayers.length, mapLayers, setSelectRasterLayer]);

  const handleRasterLayerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPlotReadyDataForSelectedFeatureFromTable(null, "");
    setCurrentRasterLayer({ name: event.target.value });
    setSelectRasterLayer(event.target.value);
  };

  return (
    <TooltipProvider>
      <section className=" flex w-full divide-x divide-stone-600 h-8 z-1000 bg-background">
        <section className="flex p-2 bg-background h-8 w-fit divide-x divide-stone-600">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-auto px-6">
                <IconTrash
                  size={19}
                  className="hover:text-red-500"
                  onClick={handleDeleteFeatures}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Delete selected feature</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="px-6 text-foreground disabled:text-muted"
                onClick={handleZoomInQuery}
                disabled={!selectedDrawnFeature}
              >
                <IconFocusCentered size={19} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Zoom in to query</TooltipContent>
          </Tooltip>
        </section>
        <section className="flex h-fit w-full mb-5 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <select
                id="vector-layer-select"
                className=" w-full h-8 max-w-md font-medium bg-background border border-r-stone-600 outline-none"
              >
                {drawnFeaturesOnMap.length > 0 && (
                  <option key="Drawn Features" value="Drawn Features">
                    Drawn Features
                  </option>
                )}
              </select>
            </TooltipTrigger>
            <TooltipContent side="top">Select vector layer</TooltipContent>
          </Tooltip>
        </section>
        <section className="flex h-fit w-full mb-5 text-sm "></section>
      </section>
    </TooltipProvider>
  );
};

export default AttributeTableControls;
