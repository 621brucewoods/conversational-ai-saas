import { useEffect, useCallback } from "react";
import { Map } from "maplibre-gl";

// Store imports
import useGeojsonStore from "@/features/maps/stores/use-geojson-store";
import useMapLayersStore from "../stores/use-map-layer-store";
import useLayerSelectionStore from "@/features/maps/stores/use-layer-selection-store";
import useColorPickerStore from "@/features/maps/stores/use-color-picker-store";
import { useGeeOutputStore } from "@/features/maps/stores/use-gee-ouput-store";
import projectConfigs from "@/custom-configs/project-config";

export const useMapLayersManagement = (
  mapRef: React.RefObject<Map | null>,
  mapLoaded: boolean,
  googleSatelliteAttributionRef: React.RefObject<any>,
  osmAttributionRef: React.RefObject<any>,
  googleAttributionRef: React.RefObject<any>,
  show3dImageryMap: boolean,
  previousBasemap: string,
  imagery3dCredits: string
) => {
  const { geojsonData, getLastGeojsonData } = useGeojsonStore();
  const {
    mapLayers,
    addMapLayer,
    getLayerPropertiesByName,
    getMapLayersLength,
  } = useMapLayersStore();
  const selectedRasterLayer = useLayerSelectionStore(
    (state) => state.selectedRasterLayer
  );
  const setSelectRasterLayer = useLayerSelectionStore(
    (state) => state.setSelectRasterLayer
  );

  const { pickedColor } = useColorPickerStore();
  const getGeeOutputByLayerName = useGeeOutputStore(
    (state) => state.getGeeOutputByLayerName
  );

  const { initialFlyToCoords: initialCoords } = projectConfigs;
  const opacity = 0.6;

  const { urlFormat, uhiMetrics, mapStats, legendConfig } =
    getGeeOutputByLayerName(selectedRasterLayer.layerName)!;
  // **Update Layer Opacity and Color**
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const layerOpacity = getLayerPropertiesByName(
        selectedRasterLayer.layerName
      )?.layerOpacity;
      const layerType = getLayerPropertiesByName(
        selectedRasterLayer.layerName
      )?.layerType;

      if (layerType?.includes("vector")) {
        if (layerType.toLowerCase().includes("polygon")) {
          mapRef.current.setPaintProperty(
            selectedRasterLayer.layerName,
            "fill-extrusion-opacity",
            layerOpacity
          );
          if (
            pickedColor &&
            pickedColor.layerName === selectedRasterLayer.layerName
          ) {
            mapRef.current.setPaintProperty(
              selectedRasterLayer.layerName,
              "fill-extrusion-color",
              pickedColor.color
            );
          }
        } else if (layerType.toLowerCase().includes("line")) {
          mapRef.current.setPaintProperty(
            selectedRasterLayer.layerName,
            "line-opacity",
            layerOpacity
          );
          if (
            pickedColor &&
            pickedColor.layerName === selectedRasterLayer.layerName
          ) {
            mapRef.current.setPaintProperty(
              selectedRasterLayer.layerName,
              "line-color",
              pickedColor.color
            );
          }
        } else if (layerType.toLowerCase().includes("point")) {
          mapRef.current.setPaintProperty(
            selectedRasterLayer.layerName,
            "circle-opacity",
            layerOpacity
          );
          if (
            pickedColor &&
            pickedColor.layerName === selectedRasterLayer.layerName
          ) {
            mapRef.current.setPaintProperty(
              selectedRasterLayer.layerName,
              "circle-color",
              pickedColor.color
            );
          }
        }
      } else if (layerType === "raster") {
        mapRef.current.setPaintProperty(
          selectedRasterLayer.layerName,
          "raster-opacity",
          layerOpacity
        );
      }
    }
  }, [
    mapLoaded,
    selectedRasterLayer,
    getLayerPropertiesByName(selectedRasterLayer.layerName)?.layerOpacity,
    pickedColor,
  ]);

  // **Toggle Layer Visibility**
  const toggleLayer = useCallback(
    (layerName: string) => {
      if (mapRef.current) {
        const visibility = mapRef.current.getLayoutProperty(
          layerName,
          "visibility"
        );
        const newVisibility = visibility === "visible" ? "none" : "visible";
        mapRef.current.setLayoutProperty(
          layerName,
          "visibility",
          newVisibility
        );
      }
    },
    [mapRef]
  );

  // **Update Layer Visibility from Store**
  useEffect(() => {
    if (mapLoaded && mapRef.current && getMapLayersLength() > 0) {
      mapLayers.forEach((layer) => {
        if (mapRef.current) {
          mapRef.current.setLayoutProperty(
            layer.name,
            "visibility",
            layer.visible ? "visible" : "none"
          );
        }
      });
    }
  }, [mapLoaded, getMapLayersLength(), mapLayers]);

  // **Reorder Layers**
  useEffect(() => {
    if (mapLoaded && mapRef.current && getMapLayersLength() > 0) {
      const map = mapRef.current;

      map.on("idle", () => {
        if (!map) return;

        const layers = map.getStyle().layers;

        // Separate raster and non-raster layers
        const rasterLayers = layers.filter((layer: any) =>
          mapLayers.some((m) => m.name === layer.id && m.type === "raster")
        );

        const nonRasterLayers = layers.filter((layer: any) =>
          mapLayers.some((m) => m.name === layer.id && m.type !== "raster")
        );

        // Move non-raster layers to the top
        nonRasterLayers.forEach((nonRasterLayer) => {
          try {
            if (nonRasterLayer.id.startsWith("gl-draw")) return;
            map.moveLayer(nonRasterLayer.id);
          } catch (error) {
            console.error(`Failed to move layer ${nonRasterLayer.id}:`, error);
          }
        });
      });
    }
  }, [mapLoaded, getMapLayersLength(), mapLayers]);

  // **Add 3D Imagery Attributions**
  useEffect(() => {
    if (googleAttributionRef.current && show3dImageryMap) {
      googleAttributionRef.current.options.customAttribution = imagery3dCredits;
    }
    if (
      !show3dImageryMap &&
      previousBasemap &&
      googleSatelliteAttributionRef.current &&
      osmAttributionRef.current
    ) {
      googleSatelliteAttributionRef.current._container.style.display =
        previousBasemap === "esriSatelliteImagery" ? "block" : "none";
      osmAttributionRef.current._container.style.display =
        previousBasemap === "openStreetMap" ? "block" : "none";
    }
  }, [
    show3dImageryMap,
    imagery3dCredits,
    googleAttributionRef,
    googleSatelliteAttributionRef,
    osmAttributionRef,
    previousBasemap,
  ]);

  // **Initial Map Fly-To**
  // useEffect(() => {
  //   if (mapRef.current) {
  //     mapRef.current.flyTo({
  //       center: [initialCoords.lng, initialCoords.lat],
  //       zoom: 17,
  //       pitch: 65,
  //       bearing: -17.6,
  //       essential: true,
  //       duration: 5000,
  //     });
  //   }
  // }, []);

  // **Toggle Basemap**
  const toggleBasemap = useCallback(
    (layerName: string) => {
      if (mapRef.current) {
        const map = mapRef.current;

        if (!map.getSource("esri-imagery")) {
          map.addSource("esri-imagery", {
            type: "raster",
            tiles: ["/api/basemaps/google/satellite?x={x}&y={y}&z={z}"],
            tileSize: 256,
          });
          map.addLayer({
            id: "esriSatelliteImagery",
            type: "raster",
            source: "esri-imagery",
            minzoom: 0,
            maxzoom: 25,
          });
        }
        if (!map.getSource("osm-tiles")) {
          map.addSource("osm-tiles", {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          });
          map.addLayer({
            id: "openStreetMap",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 25,
            layout: {
              visibility: "none",
            },
          });
        }

        map.setLayoutProperty(
          "esriSatelliteImagery",
          "visibility",
          layerName === "esriSatelliteImagery" ? "visible" : "none"
        );
        map.setLayoutProperty(
          "openStreetMap",
          "visibility",
          layerName === "openStreetMap" ? "visible" : "none"
        );

        const visibleLayers = map
          .getStyle()
          .layers.filter((layer) => layer.layout?.visibility === "visible");
        if (
          googleSatelliteAttributionRef.current &&
          osmAttributionRef.current
        ) {
          googleSatelliteAttributionRef.current._container.style.display =
            visibleLayers.some((layer) => layer.id === "esriSatelliteImagery")
              ? "block"
              : "none";
          osmAttributionRef.current._container.style.display =
            visibleLayers.some((layer) => layer.id === "openStreetMap")
              ? "block"
              : "none";
        }
      }
    },
    [mapRef, googleSatelliteAttributionRef, osmAttributionRef]
  );

  return {
    toggleLayer,
    toggleBasemap,
  };
};
