import { generateUUID } from "@/features/chat/utils/general-utils";

export const fetchSelectedEsriLayer = async (
  selectedAgolLayerToAdd: any,
  addRoiGeometry: ({ id, name, geometry, source }: ROIGeometry) => void
) => {
  if (selectedAgolLayerToAdd) {
    try {
      const response = await fetch(
        `/api/services/esri/fetch-selected-layer?layerUrl=${encodeURIComponent(
          selectedAgolLayerToAdd?.url || ""
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AGOL layer");
      }

      const data = await response.json();

      addRoiGeometry({
        id: generateUUID(),
        geometry: data,
        name: selectedAgolLayerToAdd.name,
        source: "arcgis",
      });
    } catch (error) {
      console.error("Error fetching and adding AGOL layer:", error);
    }
  }
};
