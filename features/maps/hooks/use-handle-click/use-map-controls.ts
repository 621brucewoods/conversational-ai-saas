"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useButtonsStore } from "@/stores/use-buttons-store";
import useCursorStore from "@/features/maps/stores/use-cursor-store";

/**
 * Sets up the map controls (navigation, draw) and handles mode changes
 * for the draw tools (point, polygon, etc.).
 */
export default function useMapControls(map: Map | null) {
  const drawRef = useRef<MapboxDraw | null>(null);

  const activeDrawingMode = useButtonsStore((state) => state.activeDrawingMode);
  const setActiveDrawingMode = useButtonsStore((state) => state.setDrawingMode);

  const { setCursorState } = useCursorStore();

  // Add navigation control & initialize MapboxDraw
  useEffect(() => {
    if (map && !drawRef.current) {
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        }),
        "bottom-right"
      );

      // Initialize MapboxDraw
      drawRef.current = new MapboxDraw({
        displayControlsDefault: true,
      });
      // @ts-ignore
      map.addControl(drawRef.current);

      // If you want to handle "draw.modechange" globally:
      map.on("draw.modechange", (e: any) => {
        if (e.mode === "draw_point") {
          setActiveDrawingMode(e.mode);
          setCursorState("pointer");
        } else if (e.mode === "draw_polygon") {
          setActiveDrawingMode(e.mode);
          setCursorState("crosshair");
        } else {
          setCursorState("default");
        }
      });
    }
  }, [map]);

  // React to changes in the store’s activeDrawingMode
  useEffect(() => {
    if (!map || !drawRef.current) return;

    if (activeDrawingMode === "draw_point") {
      drawRef.current.changeMode("draw_point");
      setCursorState("pointer");
    } else if (activeDrawingMode === "draw_polygon") {
      drawRef.current.changeMode("draw_polygon");
      setCursorState("crosshair");
    } else {
      drawRef.current.changeMode("simple_select");
      setCursorState("default");
    }
  }, [map, activeDrawingMode]);

  return { drawRef };
}
