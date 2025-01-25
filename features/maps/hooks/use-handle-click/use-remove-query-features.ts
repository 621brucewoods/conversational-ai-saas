"use client";

import { useEffect } from "react";
import { Map } from "maplibre-gl";
import useTableStore from "../../stores/use-table-store";
import useToastMessageStore from "@/stores/use-toast-message-store";

/**
 * Handles removing query features from the map if triggered by the store
 * (for example, user selects a row in a table to delete).
 */
export default function useRemoveQueryFeatures(map: Map | null) {
  const selectedFeatureToDelete = useTableStore(
    (state) => state.selectedFeatureToDelete
  );
  const { setToastMessage } = useToastMessageStore();

  useEffect(() => {
    if (!map || !selectedFeatureToDelete) return;

    const featureLayerName = selectedFeatureToDelete.featureLayerName;

    // Remove the main layer
    if (map.getLayer(featureLayerName)) {
      map.removeLayer(featureLayerName);
    }

    // Remove border layer if you have one
    const borderLayerName = `${featureLayerName}-border`;
    if (map.getLayer(borderLayerName)) {
      map.removeLayer(borderLayerName);
    }

    // Remove the source
    if (map.getSource(featureLayerName)) {
      map.removeSource(featureLayerName);
    }

    setToastMessage("Selected feature removed.", "success");
  }, [selectedFeatureToDelete, map]);
}
