import { create } from "zustand";

interface FeatureStore {
  drawnFeaturesOnMap: Feature[];
  selectedDrawnFeature: Feature | null;
  lastRemovedDrawnFeature: string | null;
  addDrawnFeatureOnMap: (drawnFeatureOnMap: Omit<Feature, "UID">) => void;
  removeDrawnFeature: (uid: string) => void;
  removeAllDrawnFeatures: () => void;
  selectDrawnFeature: (uid: string) => void;
  clearSelectedDrawnFeature: () => void;
  uidCounter: number;
  reset: () => void;
}

const useDrawnFeatureOnMapStore = create<FeatureStore>((set) => ({
  drawnFeaturesOnMap: [],
  selectedDrawnFeature: null,
  lastRemovedDrawnFeature: null,
  uidCounter: 1,

  // Add a drawn feature
  addDrawnFeatureOnMap: (drawnFeatureOnMap) =>
    set((state) => {
      let featureExists = false;

      if (drawnFeatureOnMap.Geometry === "Point") {
        // Check for existing Point feature with the same Lat/Lon
        featureExists = state.drawnFeaturesOnMap.some(
          (existingFeature) =>
            existingFeature.Geometry === "Point" &&
            existingFeature.Lat === drawnFeatureOnMap.Lat &&
            existingFeature.Lon === drawnFeatureOnMap.Lon
        );
      } else if (drawnFeatureOnMap.Geometry === "Polygon") {
        // Check for existing Polygon feature with the same Coordinates
        featureExists = state.drawnFeaturesOnMap.some(
          (existingFeature) =>
            existingFeature.Geometry === "Polygon" &&
            JSON.stringify(existingFeature.Coordinates) ===
              JSON.stringify(drawnFeatureOnMap.Coordinates)
        );
      }

      if (featureExists) {
        console.warn("Feature with the same coordinates already exists");
        return state;
      }

      const newFeature: Feature = {
        ...drawnFeatureOnMap,
        UID: state.uidCounter.toString(),
      } as Feature;

      return {
        drawnFeaturesOnMap: [...state.drawnFeaturesOnMap, newFeature],
        uidCounter: state.uidCounter + 1,
      };
    }),

  // Remove a drawn feature
  removeDrawnFeature: (uid) =>
    set((state) => ({
      drawnFeaturesOnMap: state.drawnFeaturesOnMap.filter(
        (drawnFeatureOnMap) => drawnFeatureOnMap.UID !== uid
      ),
      lastRemovedDrawnFeature: uid,
      // If the removed feature was selected, clear the selection
      selectedDrawnFeature:
        state.selectedDrawnFeature?.UID === uid
          ? null
          : state.selectedDrawnFeature,
    })),

  // Remove all drawn features
  removeAllDrawnFeatures: () =>
    set({ drawnFeaturesOnMap: [], uidCounter: 1, selectedDrawnFeature: null }),

  // Select a drawn feature by UID
  selectDrawnFeature: (uid) =>
    set((state) => ({
      selectedDrawnFeature:
        state.drawnFeaturesOnMap.find(
          (drawnFeatureOnMap) => drawnFeatureOnMap.UID === uid
        ) || null,
    })),

  // Clear the selected drawn feature
  clearSelectedDrawnFeature: () => set({ selectedDrawnFeature: null }),
  reset: () =>
    set({
      drawnFeaturesOnMap: [],
      selectedDrawnFeature: null,
      lastRemovedDrawnFeature: null,
      uidCounter: 1,
    }),
}));

export default useDrawnFeatureOnMapStore;
