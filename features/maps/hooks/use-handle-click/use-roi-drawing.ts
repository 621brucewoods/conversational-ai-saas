"use client";

import { useEffect, useState } from "react";
import { Map } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import useROIStore from "@/features/maps/stores/use-roi-store";
import useMapLayersStore from "@/features/maps/stores/use-map-layer-store";
import { useButtonsStore } from "@/stores/use-buttons-store";
import useToastMessageStore from "@/stores/use-toast-message-store";
import { generateUUID } from "@/features/chat/utils/general-utils";
import { calculateGeometryArea } from "../../utils/geometry-utils";
import { addRoiLayerToMap } from "../../utils/add-roi-layer-to-map";

interface UseRoiDrawingProps {
  map: Map | null;
  drawRef: React.RefObject<MapboxDraw | null>;
  setSecondaryMapBadgeText: (size: string) => void;
}

/**
 * Handles all ROI-related logic:
 *  - Polygon creation
 *  - Finalizing the ROI
 *  - Resetting ROI on sidebar close
 */
export default function useRoiDrawing({
  map,
  drawRef,
  setSecondaryMapBadgeText,
}: UseRoiDrawingProps) {
  const [finalizedRoiGeometry, setFinalizedRoiGeometry] = useState<any | null>(
    null
  );

  const isROIDrawingActive = useROIStore((state) => state.isROIDrawingActive);
  const setIsROIDrawingActive = useROIStore(
    (state) => state.setIsROIDrawingActive
  );
  const isRoiCreated = useROIStore((state) => state.isRoiCreated);
  const setIsRoiCreated = useROIStore((state) => state.setIsRoiCreated);

  const isRoiFinalized = useROIStore((state) => state.isRoiFinalized);
  const setIsRoiFinalized = useROIStore((state) => state.setIsRoiFinalized);

  const addRoiFeatureId = useROIStore((state) => state.addRoiFeatureId);
  const addRoiGeometry = useROIStore((state) => state.addRoiGeometry);

  const { addMapLayer } = useMapLayersStore();
  const { setToastMessage } = useToastMessageStore();
  const isArtifactSidebarOpen = useButtonsStore(
    (state) => state.isArtifactsSidebarOpen
  );
  const setActiveDrawingMode = useButtonsStore((state) => state.setDrawingMode);

  /**
   * (A) Handle creation of an ROI polygon
   */
  useEffect(() => {
    const handlePolygonDrawCreate = (e: any) => {
      const polygonFeature = e.features[0];
      const geometry = polygonFeature.geometry;

      if (!isROIDrawingActive) return;

      // Mark ROI property
      polygonFeature.properties.isROI = true;

      // Store the feature ID
      const featureId = polygonFeature.id;
      addRoiFeatureId(featureId);

      setIsRoiCreated(true);
      // Remove from MapboxDraw
      drawRef.current?.delete([featureId]);

      // Temporarily show geometry on the map
      addRoiLayerToMap(map!, geometry, "drawnPolygon");
      setFinalizedRoiGeometry(geometry);

      setSecondaryMapBadgeText(
        `Size: ${calculateGeometryArea(geometry).toFixed(2)} km²`
      );

      // Switch mode to simple_select so user doesn’t keep drawing
      setActiveDrawingMode("simple_select");
    };

    // Handle "Esc" to abort ROI drawing
    const handleEscapePress = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }

      if (map) {
        if (map.getLayer("drawnPolygon")) {
          map.removeLayer("drawnPolygon");
        }
        if (map.getLayer("drawnPolygon-border")) {
          map.removeLayer("drawnPolygon-border");
        }
        if (map.getSource("drawnPolygon")) {
          map.removeSource("drawnPolygon");
        }
      }

      if (!isROIDrawingActive) return;

      // Reset ROI states
      setIsRoiCreated(false);
      setIsRoiFinalized(false, "");
      setFinalizedRoiGeometry(null);
      setActiveDrawingMode("simple_select");
      setSecondaryMapBadgeText("");

      drawRef.current?.deleteAll();
    };

    if (map && drawRef.current) {
      map.on("draw.create", handlePolygonDrawCreate);
      window.addEventListener("keydown", handleEscapePress);
    }

    return () => {
      if (map && drawRef.current) {
        map.off("draw.create", handlePolygonDrawCreate);
      }
      window.removeEventListener("keydown", handleEscapePress);
    };
  }, [map, drawRef, isROIDrawingActive]);

  /**
   * (B) Finalize the ROI geometry
   */
  useEffect(() => {
    if (!isRoiFinalized.finalized || !finalizedRoiGeometry || !map) return;

    const roiName = isRoiFinalized.name;

    // Add ROI geometry to the store
    addRoiGeometry({
      id: generateUUID(),
      geometry: finalizedRoiGeometry,
      name: roiName,
      source: "drawn",
    });

    // Add ROI layer to the map
    addMapLayer({
      id: generateUUID(),
      name: roiName,
      visible: true,
      type: "roi",
      layerOpacity: 1,
      roiName: null,
    });

    // Show final ROI layer (and remove the temporary drawnPolygon)
    addRoiLayerToMap(map, finalizedRoiGeometry, `${roiName}_roi`);
    if (map) {
      if (map.getLayer("drawnPolygon")) {
        map.removeLayer("drawnPolygon");
      }
      if (map.getLayer("drawnPolygon-border")) {
        map.removeLayer("drawnPolygon-border");
      }
      if (map.getSource("drawnPolygon")) {
        map.removeSource("drawnPolygon");
      }
    }

    setToastMessage(`ROI "${roiName}" created successfully.`, "success");
    setIsRoiFinalized(true, "");
    setFinalizedRoiGeometry(null);
    setIsROIDrawingActive(false);
    setIsRoiCreated(false);
  }, [isRoiFinalized, map]);

  /**
   * (C) Reset ROI if artifact sidebar closes while ROI is still incomplete
   */
  useEffect(() => {
    if (isArtifactSidebarOpen || !isRoiCreated || isRoiFinalized.finalized)
      return;

    // If the sidebar closed, and ROI wasn't finalized, reset it
    setIsRoiCreated(false);
    setIsROIDrawingActive(false);
    setFinalizedRoiGeometry(null);
    setIsRoiFinalized(false, "");
    setSecondaryMapBadgeText("");

    if (map?.getLayer("drawnPolygon")) {
      map.removeLayer("drawnPolygon");
      map.removeLayer("drawnPolygon-border");
    }
  }, [isArtifactSidebarOpen, isRoiCreated, isRoiFinalized]);

  return null; // No return needed, unless you want to expose state
}
