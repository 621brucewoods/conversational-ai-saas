"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useROIStore from "../../stores/use-roi-store";
import { addRoiLayerToMap } from "../../utils/add-roi-layer-to-map";

export default function useAddRoiFromSession(mapInstance: Map | null) {
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);
  const roiGeometryFromSessionHistory = useROIStore(
    (state) => state.roiGeometryFromSessionHistory
  );
  const setRoiGeometryFromSessionHistory = useROIStore(
    (state) => state.setRoiGeometryFromSessionHistory
  );

  useEffect(() => {
    if (mapInstance && mapLoaded && roiGeometryFromSessionHistory) {
      const { geometry, name } = roiGeometryFromSessionHistory;
      const roiLayerName = `${name}_roi`;

      addRoiLayerToMap(mapInstance, geometry, roiLayerName);
      setRoiGeometryFromSessionHistory(null);
    }
  }, [mapInstance, mapLoaded, roiGeometryFromSessionHistory]);
}
