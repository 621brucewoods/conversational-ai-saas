import { create } from "zustand";

type FunctionConfig = {
  functionType: string | null;
  startDate: Date | null;
  endDate: Date | null;
  startDate2?: Date | null;
  endDate2?: Date | null;
  layerName: string | null;
  selectedRoiGeometry: any | null;
  multiAnalysisOptions?: MultiAnalysisOptionsType[];
  aggregationMethod?: AggregationMethodType;
  legendConfig: any;
};

type FunctionStore = {
  functionConfigs: FunctionConfig[];
  lastFunctionType: string | null;
  addFunctionConfig: (config: FunctionConfig) => void;
  getFunctionConfig: (layerName: string) => FunctionConfig | undefined;
  getFunctionTypeByLayerName: (layerName: string) => string | null;
  setLastFunctionType: (funcType: string | null) => void;
  removeFunctionConfig: (layerName: string) => void;
  reset: () => void;
};

const useFunctionStore = create<FunctionStore>((set, get) => ({
  functionConfigs: [],
  lastFunctionType: null,

  // Function to add a new function configuration
  addFunctionConfig: (config) => {
    set((state) => ({
      functionConfigs: [
        ...state.functionConfigs,
        {
          ...config,
          selectedRoiGeometry: config.selectedRoiGeometry || null, // Ensure selectedRoiGeometry is always populated, default to null if missing
        },
      ],
      lastFunctionType: config.functionType, // Set the last function type to the newly added config
    }));
  },

  // Function to get a function configuration based on layerName and functionType
  getFunctionConfig: (layerName) => {
    return get().functionConfigs.find(
      (config) => config.layerName === layerName
    );
  },

  // Function to get the functionType based on layerName
  getFunctionTypeByLayerName: (layerName) => {
    const config = get().functionConfigs.find(
      (config) => config.layerName === layerName
    );
    return config ? config.functionType : null;
  },

  // Setter for lastFunctionType
  setLastFunctionType: (funcType) => set({ lastFunctionType: funcType }),

  // Function to remove a function configuration by layerName
  removeFunctionConfig: (layerName) => {
    set((state) => ({
      functionConfigs: state.functionConfigs.filter(
        (config) => config.layerName !== layerName
      ),
    }));
  },
  reset: () =>
    set({
      functionConfigs: [],
      lastFunctionType: null,
    }),
}));

export default useFunctionStore;
