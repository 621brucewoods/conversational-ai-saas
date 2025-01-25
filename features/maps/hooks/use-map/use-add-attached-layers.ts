"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useROIStore from "../../stores/use-roi-store";
import { generateUUID } from "@/features/chat/utils/general-utils";
import { addRoiLayerToMap } from "../../utils/add-roi-layer-to-map";

export default function useAddAttachedLayers(mapInstance: Map | null) {
  const addRoiGeometry = useROIStore((state) => state.addRoiGeometry);
  const newAttachedRoi = useROIStore((state) => state.newAttachedRoi);
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);
  const addMapLayer = useMapLayersStore((state) => state.addMapLayer);

  useEffect(() => {
    if (!mapInstance || !mapLoaded || !newAttachedRoi) return;
    const { geometry: geojson, name: layerName } = newAttachedRoi;

    addRoiLayerToMap(mapInstance, geojson, `${layerName}_roi`);

    addRoiGeometry({
      id: generateUUID(),
      geometry: geojson,
      name: layerName,
      source: "attached",
    });

    addMapLayer({
      id: generateUUID(),
      name: layerName,
      visible: true,
      type: "roi",
      roiName: null,
    });
  }, [mapInstance, mapLoaded, newAttachedRoi]);
}
