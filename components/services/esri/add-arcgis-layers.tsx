"use client";

import { useEffect } from "react";
import { fetchAgolLayersList } from "@/lib/fetchers/services/esri/fetch-layers-list";
import { useAgolLayersStore } from "@/features/maps/stores/use-agol-layers-store";

export default function AddArcGisLayerClient() {
  const setAvailableAgolLayers = useAgolLayersStore(
    (state) => state.setAvailableAgolLayers
  );

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("esriChannel");

    const fetchAndSetLayers = async () => {
      try {
        const layers = await fetchAgolLayersList();
        if (!layers || layers.length === 0) {
          throw new Error("No layers found.");
        }

        const connectionStatus = "connected";
        broadcastChannel.postMessage({ layers, connectionStatus });
      } catch (error) {
        console.error("Error fetching AGOL layers:", error);
      } finally {
        broadcastChannel.close();
        if (window.opener) {
          window.close();
        }
      }
    };

    fetchAndSetLayers();

    return () => {
      broadcastChannel.close();
    };
  }, [setAvailableAgolLayers]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-lg font-bold">Loading Layers...</h1>
    </div>
  );
}
