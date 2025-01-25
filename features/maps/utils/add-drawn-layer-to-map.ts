import { Map, Popup } from "maplibre-gl";
import useColorPickerStore from "@/features/maps/stores/use-color-picker-store";
import { Feature as GeoJSONFeature, Geometry } from "geojson";

function getRandomBrightColor(): string {
  let r, g, b, brightness;
  do {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
    brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  } while (brightness < 130);
  return `rgb(${r}, ${g}, ${b})`;
}

export const addDrawnLayerToMap = async (
  map: Map,
  geojsonData: any,
  layerName: string
) => {
  const { setPickedColor } = useColorPickerStore.getState();
  const randomColor = getRandomBrightColor();

  // Remove existing layers/sources with the same name
  if (map.getSource(layerName)) {
    const layers = map.getStyle().layers || [];
    layers.forEach((layer) => {
      if (layer.id === layerName || layer.id.startsWith(`${layerName}-`)) {
        if (map.getLayer(layer.id)) {
          map.removeLayer(layer.id);
        }
      }
    });
    map.removeSource(layerName);
  }

  // Add the new GeoJSON source
  map.addSource(layerName, {
    type: "geojson",
    data: geojsonData,
  });

  // Determine geometry type
  const geometryType =
    geojsonData.features?.[0]?.geometry?.type || geojsonData?.type;

  let isPoint = false;
  let isPolygon = false;
  let isLine = false;

  if (geometryType === "Point" || geometryType === "MultiPoint") {
    isPoint = true;
  } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
    isPolygon = true;
  } else if (
    geometryType === "LineString" ||
    geometryType === "MultiLineString"
  ) {
    isLine = true;
  }

  // Add layers based on geometry type
  if (isPoint) {
    map.addLayer({
      id: layerName,
      type: "circle",
      source: layerName,
      paint: {
        "circle-radius": 6,
        "circle-color": randomColor,
        "circle-opacity": 0.8,
        "circle-stroke-color": "#4d4d4d",
        "circle-stroke-width": 2,
      },
    });
  } else if (isPolygon) {
    // If you also want to show the polygon fill (optional):
    map.addLayer({
      id: layerName,
      type: "fill",
      source: layerName,
      paint: {
        "fill-color": randomColor,
        "fill-opacity": 0.3,
      },
    });

    map.addLayer({
      id: `${layerName}-border`,
      type: "line",
      source: layerName,
      paint: {
        "line-color": randomColor,
        "line-width": 3.5,
        "line-opacity": 1,
      },
    });
  } else if (isLine) {
    map.addLayer({
      id: layerName,
      type: "line",
      source: layerName,
      paint: {
        "line-color": randomColor,
        "line-width": 4,
        "line-opacity": 1,
      },
    });
  } else {
    // Fallback: treat unknown geometry as a line
    map.addLayer({
      id: layerName,
      type: "line",
      source: layerName,
      paint: {
        "line-color": randomColor,
        "line-width": 4,
        "line-opacity": 1,
      },
    });
  }

  // Store the picked color if it's not a special case
  if (layerName !== "geocodedPoint") {
    setPickedColor(randomColor, layerName);
  }

  /**
   * Add popup on hover
   */
  const popup = new Popup({
    closeButton: false,
    closeOnClick: false,
  });

  // Change cursor to pointer when hovering on the layer
  map.on("mouseenter", layerName, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Show popup on mousemove
  map.on("mousemove", layerName, (e) => {
    if (!e.features || !e.features[0]) return;
    const feature = e.features[0];
    const description = feature.properties?.description || "No info";

    popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
  });

  // Reset cursor and remove popup on mouse leave
  map.on("mouseleave", layerName, () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
};
