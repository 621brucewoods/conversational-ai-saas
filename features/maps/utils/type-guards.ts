// Type guard for Feature
export function isFeature(obj: unknown): obj is Feature {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "UID" in obj &&
    "geometry" in obj &&
    "drawnFeatureName" in obj &&
    "rasterLayerName" in obj
  );
}

// Type guard for ROIGeometry
export function isROIGeometry(obj: unknown): obj is ROIGeometry {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "geometry" in obj &&
    "source" in obj
  );
}
