"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import { useAgolLayersStore } from "../../stores/use-agol-layers-store";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useROIStore from "../../stores/use-roi-store";
import { generateUUID } from "@/features/chat/utils/general-utils";
import { addRoiLayerToMap } from "../../utils/add-roi-layer-to-map";

export default function useAddArcGisLayers(mapInstance: Map | null) {
  const agolLayerRequestedToImport = useAgolLayersStore(
    (state) => state.agolLayerRequestedToImport
  );
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);
  const addMapLayer = useMapLayersStore((state) => state.addMapLayer);
  const roiGeometries = useROIStore((state) => state.roiGeometries);

  useEffect(() => {
    if (!mapInstance || !mapLoaded || !agolLayerRequestedToImport) return;

    const layerName = agolLayerRequestedToImport.name;
    const geojson = roiGeometries.find(
      (roi) => roi.name === layerName && roi.source === "arcgis"
    )?.geometry;

    if (geojson) {
      addRoiLayerToMap(mapInstance, geojson, `${layerName}_roi`);
      addMapLayer({
        id: generateUUID(),
        name: layerName,
        visible: true,
        type: "roi",
        roiName: null,
      });
      return;
    }
  }, [mapInstance, mapLoaded, agolLayerRequestedToImport]);
}
