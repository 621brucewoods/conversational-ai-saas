"use client";
import { useEffect } from "react";
import { toast, ToastPosition } from "react-hot-toast";
import useToastMessageStore from "@/stores/use-toast-message-store";
import { useTheme } from "next-themes";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconAlertCircleFilled,
  IconInfoCircleFilled,
  IconX,
} from "@tabler/icons-react";

export default function ToastMessage() {
  const { toastMessage, toastType, toastId, setToastMessage } =
    useToastMessageStore();
  const { theme } = useTheme();

  useEffect(() => {
    // If toastId is 0, or no message, skip
    if (!toastId || !toastMessage) return;

    // Otherwise, show the toast
    // (same code you had before)
    const baseToastOptions = {
      duration: toastType === "error" ? Infinity : 5000,
      position: "custom" as ToastPosition,
      className: "mr-3",
    };

    const darkBgText = "bg-muted text-foreground";
    const lightBgText = "bg-[#fffdf7] text-gray-700";

    const toastStyles = {
      success: {
        background: theme === "dark" ? darkBgText : lightBgText,
        ring: "ring-green-600/10",
        shadowColor: "shadow-green-600/10",
        icon: <IconCircleCheckFilled size={20} className="text-green-600" />,
      },
      error: {
        background: theme === "dark" ? darkBgText : lightBgText,
        ring: "ring-red-600/10",
        shadowColor: "shadow-red-600/10",
        icon: <IconCircleXFilled size={20} className="text-red-600" />,
      },
      warning: {
        background: theme === "dark" ? darkBgText : lightBgText,
        ring: "ring-amber-500/10",
        shadowColor: "shadow-amber-500/10",
        icon: <IconAlertCircleFilled size={20} className="text-amber-500" />,
      },
      default: {
        background: theme === "dark" ? darkBgText : lightBgText,
        ring: "ring-blue-600/10",
        shadowColor: "shadow-blue-600/10",
        icon: <IconInfoCircleFilled size={20} className="text-blue-600" />,
      },
    };

    const selectedStyle = toastStyles[toastType || "default"];

    const CustomToast = ({ message, t, visible }: any) => (
      <div className="fixed bottom-8 right-3">
        <div
          className={`
            ${selectedStyle.background}
            ${selectedStyle.ring}
            ${selectedStyle.shadowColor}
            shadow-lg ring-1 rounded-xl w-[400px]
            border border-stone-300 dark:border-stone-600
            transition-all duration-300 ease-in-out transform
            ${
              visible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }
            relative
          `}
        >
          <div className="flex gap-3 py-8 px-5">
            <div className="shrink-0 mt-1">{selectedStyle.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] leading-relaxed font-medium break-words whitespace-pre-wrap line-clamp-4">
                {message}
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="shrink-0 -mt-2 -me-2 p-2 rounded-lg text-gray-400/80 hover:text-gray-400 hover:bg-gray-50 transition-all absolute top-3 right-3"
              aria-label="Close"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>
      </div>
    );

    const toastOptions = {
      ...baseToastOptions,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
      },
    };

    const toastIdVal = toast.custom(
      (t: { id: string; visible: boolean }) => (
        <CustomToast message={toastMessage} t={t} visible={t.visible} />
      ),
      toastOptions
    );

    // Optionally: auto-dismiss if user clicks anywhere
    const handleClick = () => {
      const toastElement = document.querySelector(
        `[data-toast-id="${toastIdVal}"]`
      );
      if (toastElement) {
        toastElement.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
          toast.dismiss(toastIdVal);
        }, 300);
      } else {
        toast.dismiss(toastIdVal);
      }
    };

    document.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
      // Optionally clear message:
      // setToastMessage(""); // If you want the same message to show again easily
    };
  }, [toastId, toastMessage, toastType, theme, setToastMessage]);

  return null;
}
