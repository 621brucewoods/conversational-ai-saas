import { create } from "zustand";
import { checkLayerName } from "../utils/general-checks";

interface ROIStoreState {
  // ROI drawing state
  isROIDrawingActive: boolean;
  setIsROIDrawingActive: (isActive: boolean) => void;

  isRoiCreated: boolean;
  setIsRoiCreated: (isCreated: boolean) => void;

  isRoiFinalized: { finalized: boolean; name: string };
  setIsRoiFinalized: (finalized: boolean, name: string) => void;

  selectedGeometryInChat: ROIGeometry | null;
  setSelectedGeometryByName: (name: string) => void;

  newAttachedRoi: ROIGeometry | null;
  setNewAttachedRoi: (roi: ROIGeometry | null) => void;

  roiGeometries: ROIGeometry[];
  addRoiGeometry: ({ id, geometry, name, source }: ROIGeometry) => void;
  removeRoiGeometry: (id: string) => void;
  getRoiGeometryByName: (name: string) => ROIGeometry | null;

  roiGeometryFromSessionHistory: ROIGeometry | null;
  setRoiGeometryFromSessionHistory: (roi: ROIGeometry | null) => void;
  // Method to get the last ROI geometry
  getLastRoiGeometry: () => ROIGeometry | null;
  // ROI Feature IDs
  roiFeatureIds: string[];
  setRoiFeatureIds: (ids: string[]) => void;
  addRoiFeatureId: (id: string) => void;
  removeRoiFeatureIds: (ids: string[]) => void;
  reset: () => void;
}

const useROIStore = create<ROIStoreState>((set, get) => ({
  // ROI drawing state
  isROIDrawingActive: false,
  setIsROIDrawingActive: (isActive) => set({ isROIDrawingActive: isActive }),

  selectedGeometryInChat: null,
  setSelectedGeometryByName: (name) => {
    const roiGeometries = get().roiGeometries;
    const selectedGeometryInChat = roiGeometries.find(
      (roi) => roi.name === name
    );
    set({ selectedGeometryInChat });
  },

  roiGeometryFromSessionHistory: null,
  setRoiGeometryFromSessionHistory: (roi) =>
    set({ roiGeometryFromSessionHistory: roi }),

  newAttachedRoi: null,
  setNewAttachedRoi: (roi) => set({ newAttachedRoi: roi }),

  isRoiCreated: false,
  setIsRoiCreated: (isCreated) => set({ isRoiCreated: isCreated }),

  isRoiFinalized: { finalized: false, name: "" },
  setIsRoiFinalized: (finalized, name) =>
    set({ isRoiFinalized: { finalized, name } }),

  // ROIs with geometry and name
  roiGeometries: [],
  addRoiGeometry: ({ id, geometry, name, source }: ROIGeometry) => {
    const currentGeometries = get().roiGeometries;

    // If an ROI with the same id already exists, skip adding a new one
    const existingRoiWithSameId = currentGeometries.find(
      (roi) => roi.id === id
    );
    if (existingRoiWithSameId) {
      return;
    }

    // Gather all existing names into one string for checkLayerName
    const existingNames = currentGeometries.map((roi) => roi.name);

    // If name not provided, create a default "ROI X"
    if (!name) {
      const count = currentGeometries.filter((roi) =>
        roi.name.startsWith("ROI")
      ).length;
      name = `ROI ${count + 1}`;
    }

    // Ensure uniqueness via checkLayerName
    const uniqueName = checkLayerName(name, existingNames);

    // Save the geometry with the final unique name
    set({
      roiGeometries: [
        ...currentGeometries,
        { id, name: uniqueName, geometry, source },
      ],
    });
  },

  removeRoiGeometry: (id) => {
    const currentGeometries = get().roiGeometries;
    set({
      roiGeometries: currentGeometries.filter((roi) => roi.id !== id),
    });
  },

  getRoiGeometryByName: (name) => {
    const roiGeometries = get().roiGeometries;
    return roiGeometries.find((roi) => roi.name === name) ?? null;
  },

  // Method to get the last ROI geometry
  getLastRoiGeometry: () => {
    const roiGeometries = get().roiGeometries;
    return roiGeometries.length > 0
      ? roiGeometries[roiGeometries.length - 1]
      : null;
  },

  // ROI Feature IDs
  roiFeatureIds: [],
  setRoiFeatureIds: (ids) => set({ roiFeatureIds: ids }),
  addRoiFeatureId: (id) => {
    const currentIds = get().roiFeatureIds;
    set({ roiFeatureIds: [...currentIds, id] });
  },

  removeRoiFeatureIds: (idsToRemove) => {
    const currentIds = get().roiFeatureIds;
    set({
      roiFeatureIds: currentIds.filter((id) => !idsToRemove.includes(id)),
    });
  },
  reset: () =>
    set({
      isROIDrawingActive: false,
      isRoiCreated: false,
      newAttachedRoi: null,
      isRoiFinalized: { finalized: false, name: "" },
      selectedGeometryInChat: null,
      roiGeometries: [],
      roiGeometryFromSessionHistory: null,
      roiFeatureIds: [],
    }),
}));

export default useROIStore;
