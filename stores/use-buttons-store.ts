import { create } from "zustand";

type ButtonGroup = "draw_point" | "draw_polygon" | "simple_select" | null; // Drawing mode
type BuildCenterButton =
  | "AiAssistantBuilder"
  | "WorkflowBuilder"
  | "AiAppBuilder"
  | null; // BuildCenter buttons

// Define the types for the workflow action buttons
type WorkflowActionButton = "stop" | "run" | "queue"; // Active workflow action button

// Define the types for the AiAppBuilder action buttons
type AiAppBuilderActionButton = "run" | "stop" | "queue" | "save"; // Active AiAppBuilder action button

interface ButtonsStore {
  activeDrawingMode: ButtonGroup; // Current active drawing mode
  setDrawingMode: (mode: ButtonGroup) => void; // Function to set the drawing mode

  isArtifactsSidebarOpen: boolean;
  toggleArtifactsSidebar: () => void;

  buildCenterButtons: BuildCenterButton; // Active BuildCenter button
  setBuildCenterButton: (button: BuildCenterButton) => void; // Function to set the BuildCenter button

  workflowActionButtonsState: WorkflowActionButton; // Active workflow action button
  setWorkflowActionButton: (button: WorkflowActionButton) => void; // Function to set the workflow action button

  aiAppBuilderActionButtonsState: Record<AiAppBuilderActionButton, boolean>; // Active states for AiAppBuilder action buttons
  toggleAiAppBuilderActionButton: (button: AiAppBuilderActionButton) => void; // Function to toggle AiAppBuilder action button state

  // New state for sidebar collapse
  isSidebarCollapsed: boolean; // State for whether the sidebar is collapsed
  toggleSidebarCollapse: () => void; // Function to toggle the sidebar collapse state

  activeBasemap: BasemapType;
  toggleBasemap: () => void;

  reset(): void;
}

export const useButtonsStore = create<ButtonsStore>((set) => ({
  // Existing state for drawing mode
  activeDrawingMode: null,
  setDrawingMode: (mode) =>
    set((state) => ({
      activeDrawingMode: state.activeDrawingMode === mode ? null : mode, // Toggle drawing mode
    })),

  // State for BuildCenter buttons
  buildCenterButtons: null, // Default no active button
  setBuildCenterButton: (button) =>
    set((state) => ({
      buildCenterButtons: state.buildCenterButtons === button ? null : button, // Toggle BuildCenter button
    })),

  // State for workflow action buttons
  workflowActionButtonsState: "run", // Default no active workflow action button
  setWorkflowActionButton: (button) =>
    set((state) => ({
      workflowActionButtonsState:
        state.workflowActionButtonsState === button ? "run" : button, // Toggle workflow action button
    })),

  // State for AiAppBuilder action buttons
  aiAppBuilderActionButtonsState: {
    run: false,
    stop: false,
    queue: false,
    save: false,
  }, // All buttons are initially inactive
  toggleAiAppBuilderActionButton: (button) =>
    set((state) => ({
      aiAppBuilderActionButtonsState: {
        ...state.aiAppBuilderActionButtonsState,
        [button]: !state.aiAppBuilderActionButtonsState[button], // Toggle the specific button state
      },
    })),

  isArtifactsSidebarOpen: false,
  toggleArtifactsSidebar: () =>
    set((state) => ({
      isArtifactsSidebarOpen: !state.isArtifactsSidebarOpen,
    })),
  closeArtifactsSidebar: () =>
    set(() => ({
      isArtifactsSidebarOpen: false,
    })),

  // State for sidebar collapse
  isSidebarCollapsed: false, // Default to expanded
  toggleSidebarCollapse: () =>
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed, // Toggle collapse state
    })),

  // Existing state for basemap toggle
  activeBasemap: "satellite",
  toggleBasemap: () =>
    set((state) => ({
      activeBasemap: state.activeBasemap === "satellite" ? "osm" : "satellite",
    })),

  reset: () =>
    set(() => ({
      activeDrawingMode: null,
      isArtifactsSidebarOpen: false,
      activeBasemap: "satellite",
    })),
}));
