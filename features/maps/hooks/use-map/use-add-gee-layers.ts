"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import { useGeeOutputStore } from "@/features/maps/stores/use-gee-ouput-store";
import { addGeeLayerToMap } from "@/features/maps/utils/add-gee-layer-to-map";
import useMapLayersStore from "../../stores/use-map-layer-store";

export default function useAddGeeLayers(mapInstance: Map | null) {
  const { geeLayersList } = useGeeOutputStore();
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);

  useEffect(() => {
    if (!mapInstance || !mapLoaded || geeLayersList.length === 0) return;

    const currentMapLayers = mapInstance.getStyle().layers || [];
    const currentMapLayerIds = currentMapLayers.map((layer) => layer.id);

    geeLayersList.forEach((geeLayer) => {
      const { urlFormat, layerName } = geeLayer;

      // Only add the layer if it has a urlFormat and isn't already on the map
      if (urlFormat && !currentMapLayerIds.includes(layerName)) {
        addGeeLayerToMap(mapInstance, urlFormat, layerName, layerName);
      }
    });
  }, [mapInstance, mapLoaded, geeLayersList]);
}
