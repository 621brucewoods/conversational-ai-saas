import { create } from "zustand";

// Define the possible pages as an enum
export enum Pages {
  NewChat = "/",
  ChatHistory = "chat-history",
  BuildCenter = "build-center",
  KnowledgeBase = "knowledge-base",
  Integrations = "integrations",
  DraftedReports = "drafted-reports",
  Profile = "profile",
  Settings = "settings",
}

// Define the store's state and actions
interface SidebarButtonStoreState {
  pageToOpen: Pages | null; // The currently active page
  setPageToOpen: (page: Pages | null) => void; // Action to change the active page
}

// Create the Zustand store
const useSidebarButtonStores = create<SidebarButtonStoreState>((set) => ({
  pageToOpen: null, // Default page
  setPageToOpen: (page) => set({ pageToOpen: page }),
}));

export default useSidebarButtonStores;
