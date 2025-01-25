import { create } from "zustand";

interface ColorStore {
  pickedColor: { color: string; layerName: string | null };
  isPickerOpen: boolean;
  setPickedColor: (color: string, layerName: string) => void;
  setPickerOpen: (isOpen: boolean) => void;
  reset: () => void;
}

const useColorPickerStore = create<ColorStore>((set) => ({
  pickedColor: { color: "#FFFFFF", layerName: null },
  isPickerOpen: false,
  setPickedColor: (color: string, layerName: string) =>
    set({ pickedColor: { color, layerName } }),
  setPickerOpen: (isOpen: boolean) => set({ isPickerOpen: isOpen }),
  reset: () =>
    set({
      pickedColor: { color: "#FFFFFF", layerName: null },
      isPickerOpen: false,
    }),
}));

export default useColorPickerStore;
