"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useColorPickerStore from "../../stores/use-color-picker-store";

export function useUpdateLayerColor(mapInstance: Map | null) {
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);
  const getLayerPropertiesByName = useMapLayersStore(
    (state) => state.getLayerPropertiesByName
  );
  const pickedColor = useColorPickerStore((state) => state.pickedColor);

  useEffect(() => {
    if (
      !mapInstance ||
      !mapLoaded ||
      !pickedColor ||
      pickedColor.color === "#NaNNaNNaN"
    )
      return;

    const mapLayer = getLayerPropertiesByName(pickedColor.layerName || "");
    if (mapLayer?.layerType === "roi") {
      const layerName = `${pickedColor.layerName}_roi`;
      const styleLayer = mapInstance.getLayer(layerName);

      if (styleLayer?.type === "fill-extrusion") {
        mapInstance.setPaintProperty(
          layerName,
          "fill-extrusion-color",
          pickedColor.color
        );
      } else if (styleLayer?.type === "fill") {
        // Update the fill color
        mapInstance.setPaintProperty(
          layerName,
          "fill-color",
          pickedColor.color
        );
      }

      // Also update the border color, if that layer exists
      const borderLayerId = `${layerName}-border`;
      const borderLayer = mapInstance.getLayer(borderLayerId);

      if (borderLayer?.type === "line") {
        mapInstance.setPaintProperty(
          borderLayerId,
          "line-color",
          pickedColor.color
        );
      }
    }
  }, [mapInstance, mapLoaded, pickedColor]);
}
