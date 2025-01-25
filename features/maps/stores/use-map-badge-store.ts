import { create } from "zustand";

interface BadgeState {
  text: string;
  secondaryText: string;
  setText: (text: string) => void;
  setSecondaryText: (secondaryText: string) => void;
  reset: () => void;
}

const useBadgeStore = create<BadgeState>((set) => ({
  text: "ROI Drawing Mode", // Default text
  secondaryText: "", // Default secondaryText

  // Action to set the primary text
  setText: (text) => set({ text }),

  // Action to set the secondary text
  setSecondaryText: (secondaryText) => set({ secondaryText }),

  // Reset both text and secondaryText to defaults
  reset: () => set({ text: "ROI Drawing Mode", secondaryText: "" }),
}));

export default useBadgeStore;
