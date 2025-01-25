"use client";
import { useState } from "react";
import useMapLayersStore from "../../stores/use-map-layer-store";
import useMapControls from "./use-map-controls";
import useRoiDrawing from "./use-roi-drawing";
import useQueryDrawing from "./use-query-drawing";
import useRemoveQueryFeatures from "./use-remove-query-features";
import useBadgeStore from "../../stores/use-map-badge-store";

/**
 * The main hook that orchestrates all the smaller hooks.
 * It references the global map from your store, then
 * passes it to each specialized hook.
 */
export default function useHandleClick() {
  const setSecondaryMapBadgeText = useBadgeStore(
    (state) => state.setSecondaryText
  );

  // 1) Get the Map instance from store
  const map = useMapLayersStore((state) => state.mapCurrent);

  // 2) Set up map controls & return drawRef
  const { drawRef } = useMapControls(map);

  // 3) ROI drawing logic (all in one file)
  useRoiDrawing({ map, drawRef, setSecondaryMapBadgeText });

  // 4) Query logic for polygons + points
  useQueryDrawing({ map, drawRef });

  // 5) Removal of query features
  useRemoveQueryFeatures(map);

  // Optional: return anything if needed
  return null;
}
