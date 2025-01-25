import { create } from "zustand";

interface CursorState {
  cursorState: string;
  setCursorState: (cursor: string) => void;
  reset: () => void;
}

const useCursorStore = create<CursorState>((set) => ({
  cursorState: "default",
  setCursorState: (cursor) => set({ cursorState: cursor }),
  reset: () => set({ cursorState: "default" }),
}));

export default useCursorStore;
