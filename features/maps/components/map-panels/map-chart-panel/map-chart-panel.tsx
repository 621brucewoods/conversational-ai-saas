import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import {
  ChartQueryDisplay,
  ChartTimeseriesQueryDisplay,
} from "@/features/charts/components/charts-display";
import useMapDisplayStore from "@/features/maps/stores/use-map-display-store";
import useROIStore from "@/features/maps/stores/use-roi-store";
import { Button } from "@/components/ui/button";

const MapChartPanel = () => {
  const isChartPanelOpen = useMapDisplayStore(
    (state) => state.isMapChartPanelOpen
  );
  const toggleChartPanel = useMapDisplayStore(
    (state) => state.toggleMapChartPanel
  );
  const isROIDrawingActive = useROIStore((state) => state.isROIDrawingActive);

  useEffect(() => {
    if (isROIDrawingActive && isChartPanelOpen) {
      toggleChartPanel();
    }
  }, [isROIDrawingActive]);

  return (
    <div
      className={`absolute top-20 bottom-20 right-0 w-64 pl-2 z-[1000] bg-secondary
                  transition-transform duration-300 rounded-l-xl
                  ${isChartPanelOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex flex-col gap-3 h-[70%]">
        {/* 1) Move the button slightly down (mt-2 or mt-3) and to the left (ml-2 or ml-3) */}
        <Button
          className="p-2 mt-3 ml-2"
          variant="ghost"
          size="icon"
          onClick={toggleChartPanel}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>

        <ChartQueryDisplay />
        <ChartTimeseriesQueryDisplay />
      </div>
    </div>
  );
};

export default MapChartPanel;
