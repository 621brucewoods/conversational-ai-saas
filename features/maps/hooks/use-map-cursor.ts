import { useEffect } from "react";
import useCursorStore from "@/features/maps/stores/use-cursor-store";
import useMapLayersStore from "../stores/use-map-layer-store";

export const useMapCursor = () => {
  const { cursorState } = useCursorStore();
  const mapCurrent = useMapLayersStore((state) => state.mapCurrent);

  useEffect(() => {
    if (!mapCurrent) return;

    const updateCursor = () => {
      switch (cursorState) {
        case "default":
          mapCurrent.getCanvas().style.cursor = "grab";
          break;
        case "pointer":
          mapCurrent.getCanvas().style.cursor = "pointer";
          break;
        case "crosshair":
          mapCurrent.getCanvas().style.cursor = "crosshair";
          break;
        default:
          mapCurrent.getCanvas().style.cursor = "default";
          break;
      }
    };

    updateCursor();

    const handleMouseDown = () => {
      if (mapCurrent.getCanvas().style.cursor === "pointer") return;

      mapCurrent.getCanvas().style.cursor = "grabbing";
    };
    const handleMouseUp = updateCursor;
    const handleMouseMove = updateCursor;
    const handleMouseOut = updateCursor;

    mapCurrent.on("mousedown", handleMouseDown);
    mapCurrent.on("mouseup", handleMouseUp);
    mapCurrent.on("mousemove", handleMouseMove);
    mapCurrent.on("mouseout", handleMouseOut);

    return () => {
      mapCurrent.off("mousedown", handleMouseDown);
      mapCurrent.off("mouseup", handleMouseUp);
      mapCurrent.off("mousemove", handleMouseMove);
      mapCurrent.off("mouseout", handleMouseOut);
    };
  }, [mapCurrent, cursorState]);
};
