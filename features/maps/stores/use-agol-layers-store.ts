import { create } from "zustand";
import {
  isValidUrl,
  sanitizeUrl,
  isValidLayerName,
  sanitizeLayerName,
} from "@/utils/validation-utils/validation-utils";
import { checkLayerName } from "../utils/general-checks";

interface Layer {
  name: string;
  type: string;
  url: string;
  data_url?: string;
}

interface AgolLayers {
  availableAgolLayers: Layer[];
  agolLayerRequestedToImport: Layer | null;
  removeAgolLayerFromList: (url: string) => void;
  setAvailableAgolLayers: (layers: Layer[]) => void;
  setAgolLayerRequestedToImport: (layer: Layer | null) => void;
  reset: () => void;
}

export const useAgolLayersStore = create<AgolLayers>((set) => {
  const broadcastChannel = new BroadcastChannel("esriChannel");

  // Safely handle incoming messages from BroadcastChannel
  broadcastChannel.onmessage = (event: MessageEvent) => {
    try {
      const { layers } = event.data;

      if (Array.isArray(layers)) {
        const sanitizedLayers = layers
          .filter(
            (layer) => isValidUrl(layer.url) && isValidLayerName(layer.name)
            // (layer) => isValidLayerName(layer.name)
          ) // Validate input
          .map((layer) => ({
            ...layer,
            // name: sanitizeLayerName(layer.name),
            name: layer.name,
            // url: sanitizeUrl(layer.url),
            url: layer.url,
          }));

        set({ availableAgolLayers: sanitizedLayers });
      }
    } catch (error) {
      console.error("Error processing BroadcastChannel message:", error);
    }
  };

  const generateDataUrl = (layer: Layer): string => {
    if (layer.type === "Feature Service") {
      return `${layer.url}/0/query?f=pgeojson&where=1=1`;
    } else if (layer.type === "WFS Server") {
      return `${layer.url}?service=WFS&request=GetFeature&typeName=${layer.name}&outputFormat=application/json`;
    }
    return layer.url;
  };

  return {
    availableAgolLayers: [],
    agolLayerRequestedToImport: null,

    removeAgolLayerFromList: (url: string) => {
      set((state) => ({
        availableAgolLayers: state.availableAgolLayers.filter(
          (layer) => layer.url !== url
        ),
      }));
    },

    setAvailableAgolLayers: (layers: Layer[]) => {
      // We'll build up our final array step by step
      const finalLayers: Layer[] = [];

      layers.forEach((incomingLayer) => {
        // Validate
        if (
          isValidUrl(incomingLayer.url) &&
          isValidLayerName(incomingLayer.name)
        ) {
          // Get the existing layer names so far
          const existingNames = finalLayers.map((l) => l.name);

          // Generate a unique name
          const uniqueName = checkLayerName(incomingLayer.name, existingNames);

          // Create the new layer object
          const newLayer: Layer = {
            ...incomingLayer,
            name: uniqueName,
            url: incomingLayer.url,
            data_url: generateDataUrl(incomingLayer),
          };

          // Push it into the final array
          finalLayers.push(newLayer);
        }
      });

      // Now set finalLayers into zustand
      set({ availableAgolLayers: finalLayers });

      // And broadcast
      try {
        broadcastChannel.postMessage({ layers: finalLayers });
      } catch (error) {
        console.error("Error broadcasting layers:", error);
      }
    },

    setAgolLayerRequestedToImport: (layer: Layer | null) => {
      if (layer && isValidUrl(layer.url) && isValidLayerName(layer.name)) {
        set({ agolLayerRequestedToImport: layer });
      } else {
        console.warn("Attempted to set an invalid layer for import:", layer);
      }
    },
    reset: () => {
      set({
        availableAgolLayers: [],
        agolLayerRequestedToImport: null,
      });
    },
  };
});
