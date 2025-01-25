// zustand store
import { create } from "zustand";

interface ToastStore {
  toastMessage: string;
  toastType: "success" | "error" | "warning";
  toastId: number;
  setToastMessage: (
    toastMessage: string,
    toastType?: "success" | "error" | "warning"
  ) => void;
}

const useToastMessageStore = create<ToastStore>((set) => ({
  toastMessage: "",
  toastType: "success",
  toastId: 0,

  setToastMessage: (
    toastMessage: string,
    toastType: "success" | "error" | "warning" = "success"
  ) =>
    set({
      toastMessage,
      toastType,
      toastId: Date.now(),
    }),
}));

export default useToastMessageStore;
