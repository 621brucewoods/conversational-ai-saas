"use client";

import { useEffect, RefObject } from "react";
import { Map, AttributionControl } from "maplibre-gl";
import { useButtonsStore } from "@/stores/use-buttons-store";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useMapControls from "../use-handle-click/use-map-controls";

interface UseBasemapToggleParams {
  mapInstance: Map | null;
  googleSatelliteAttributionRef: RefObject<AttributionControl | null>;
  osmAttributionRef: RefObject<AttributionControl | null>;
  googleAttributionRef?: RefObject<AttributionControl | null>;
}

export default function useBasemapToggle({
  mapInstance,
  googleSatelliteAttributionRef,
  osmAttributionRef,
  googleAttributionRef,
}: UseBasemapToggleParams) {
  // Subscribe to the store's current basemap
  const activeBasemap = useButtonsStore((state) => state.activeBasemap);
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);

  useEffect(() => {
    if (!mapInstance || !mapLoaded) return;

    if (activeBasemap === "satellite") {
      mapInstance.setLayoutProperty(
        "googleSatelliteImagery",
        "visibility",
        "visible"
      );
      mapInstance.setLayoutProperty("googleRoadmap", "visibility", "none");

      if (googleSatelliteAttributionRef.current) {
        googleSatelliteAttributionRef.current._container.style.display =
          "block";
      }
      if (osmAttributionRef.current) {
        osmAttributionRef.current._container.style.display = "none";
      }
      // googleAttributionRef?.current?._container.style.display = "block";
    } else {
      mapInstance.setLayoutProperty(
        "googleSatelliteImagery",
        "visibility",
        "none"
      );
      mapInstance.setLayoutProperty("googleRoadmap", "visibility", "visible");

      if (googleSatelliteAttributionRef.current) {
        googleSatelliteAttributionRef.current._container.style.display = "none";
      }
      if (osmAttributionRef.current) {
        osmAttributionRef.current._container.style.display = "block";
      }
      // googleAttributionRef?.current?._container.style.display = "none";
    }
  }, [
    mapInstance,
    activeBasemap,
    googleSatelliteAttributionRef,
    osmAttributionRef,
    googleAttributionRef,
  ]);
}
