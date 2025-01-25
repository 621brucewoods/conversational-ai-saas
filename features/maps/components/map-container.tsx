"use client";

import React, { memo } from "react";
import { Maximize, Minimize } from "lucide-react";
import useMapDisplayStore from "@/features/maps/stores/use-map-display-store";
import MapCustomControls from "./map-custom-controls/map-custom-controls";
import useHandleClick from "../hooks/use-handle-click/use-handle-click";
import { useMapCursor } from "@/features/maps/hooks/use-map-cursor";
import useMap from "../hooks/use-map/use-map";
import MapChartPanel from "./map-panels/map-chart-panel/map-chart-panel";
import MapLayersPanel from "./map-panels/map-layers-panel/map-layers-panel";
import MapRoiControls from "./map-custom-controls/map-roi-controls";
import useROIStore from "@/features/maps/stores/use-roi-store";
import MapBadge from "./map-badge";
import AttributeTable from "./attribute-table/attribute-table";
import LoadingWidget from "@/components/loading-widgets/loading-primary";
import useLayerSelectionStore from "../stores/use-layer-selection-store";
import useBadgeStore from "../stores/use-map-badge-store";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MAP_CONTAINER_ID = "map";

const MapContainer = () => {
  const mapMaximizeRequested = useMapDisplayStore(
    (state) => state.mapMaximizeRequested
  );
  const setMapMaximizeRequested = useMapDisplayStore(
    (state) => state.setMapMaximizeRequested
  );
  const setDisplayMapRequestedFromChatResponse = useMapDisplayStore(
    (state) => state.setDisplayMapRequestedFromChatResponse
  );
  const setDisplayMapRequestedFromInsightsViewerIcon = useMapDisplayStore(
    (state) => state.setDisplayRawMapRequestedFromInsightsViewerIcon
  );
  const isROIDrawingActive = useROIStore((state) => state.isROIDrawingActive);
  const selectedRasterLayer = useLayerSelectionStore(
    (state) => state.selectedRasterLayer
  );
  const secondaryMapBadgeText = useBadgeStore((state) => state.secondaryText);

  useMap(MAP_CONTAINER_ID);
  useHandleClick();
  useMapCursor();

  const handleResize = () => {
    setMapMaximizeRequested(!mapMaximizeRequested);
  };

  const isMapFullScreen = mapMaximizeRequested;

  return (
    <TooltipProvider>
      <div className="flex w-full h-full justify-center items-center z-[1000]">
        <div
          id={MAP_CONTAINER_ID}
          className="relative w-full h-full rounded-lg overflow-hidden"
        >
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-[10000] text-gray-800">
            {isROIDrawingActive ? <MapRoiControls /> : <MapCustomControls />}
          </div>
          {isROIDrawingActive ? (
            <MapBadge secondaryText={secondaryMapBadgeText} />
          ) : (
            <MapBadge
              type="query_layer"
              heading={selectedRasterLayer.layerName}
            />
          )}
          <MapChartPanel />
          <MapLayersPanel />
          <AttributeTable />
          <LoadingWidget />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="absolute top-2 left-2 bg-background bg-opacity-80 hover:bg-muted p-1 rounded-lg z-[10] text-foreground"
                onClick={handleResize}
              >
                {isMapFullScreen ? (
                  <Minimize size={21} />
                ) : (
                  <Maximize size={21} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isMapFullScreen ? "Minimize map" : "Maximize map"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default memo(MapContainer);
