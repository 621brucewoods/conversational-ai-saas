"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useZoomRequestStore from "../../stores/use-map-layer-zoom-request-store";
import {
  calculateGeometryCentroid,
  calculateZoomLevel,
  convertFeatureToGeometry,
} from "@/features/maps/utils/geometry-utils";

export default function useZoomToGeometry(mapInstance: Map | null) {
  const mapLoaded = useMapLayersStore((state) => state.mapLoaded);

  const zoomRequestGeometry = useZoomRequestStore(
    (state) => state.zoomRequestWithGeometry
  );
  const setZoomRequestWithGeometry = useZoomRequestStore(
    (state) => state.setZoomRequestWithGeometry
  );

  const zoomRequestFromTable = useZoomRequestStore(
    (state) => state.zoomRequestFromTable
  );
  const setZoomRequestFromTable = useZoomRequestStore(
    (state) => state.setZoomRequestFromTable
  );

  useEffect(() => {
    if (
      !mapInstance ||
      !mapLoaded ||
      (!zoomRequestFromTable && !zoomRequestGeometry)
    )
      return;

    let targetPoint: [number, number] = [-75.7003, 45.4201];
    let targetZoom = 12;
    let isHandled = false;

    if (zoomRequestGeometry?.geometry) {
      // Handle zoomRequestGeometry
      targetPoint = calculateGeometryCentroid(zoomRequestGeometry.geometry);
      targetZoom = calculateZoomLevel(zoomRequestGeometry.geometry);

      isHandled = true;
    } else if (zoomRequestFromTable?.geometry) {
      // Handle zoomRequestFromTable
      const geometry = convertFeatureToGeometry(zoomRequestFromTable);
      targetPoint = calculateGeometryCentroid(geometry);
      targetZoom = calculateZoomLevel(geometry);
      isHandled = true;
    }

    if (isHandled) {
      mapInstance.flyTo({
        center: targetPoint,
        zoom: targetZoom,
        essential: true,
        maxDuration: 1000,
      });

      // Delay clearing the state until after the animation completes
      const timeout = setTimeout(() => {
        if (zoomRequestGeometry?.geometry) setZoomRequestWithGeometry(null);
        if (zoomRequestFromTable?.geometry) setZoomRequestFromTable(null);
      }, 1100);

      return () => clearTimeout(timeout);
    }
  }, [mapLoaded, zoomRequestGeometry, zoomRequestFromTable]);
}
