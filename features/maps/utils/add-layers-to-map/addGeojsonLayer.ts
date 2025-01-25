import { Map } from "maplibre-gl";
import useColorPickerStore from "@/features/maps/stores/use-color-picker-store";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const addGeojsonLayer = async (
  map: Map,
  geojsonData: any,
  layerName: string
) => {
  const { setPickedColor } = useColorPickerStore.getState();
  const fillColor = getRandomColor();
  const outlineColor = "#ffffff";

  const sourceId = geojsonData.fileName || layerName;

  if (map.getSource(sourceId)) {
    map.removeLayer(layerName);
    map.removeSource(sourceId);
  }

  map.addSource(sourceId, {
    type: "geojson",
    data: geojsonData,
  });

  const geometryType = geojsonData.features[0].geometry.type;

  if (geometryType === "LineString") {
    map.addLayer({
      id: layerName,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": fillColor,
        "line-width": 2,
      },
    });
  } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
    map.addLayer({
      id: layerName,
      type: "fill-extrusion",
      source: sourceId,
      paint: {
        "fill-extrusion-color": fillColor,
        "fill-extrusion-height": ["get", "Height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.85,
      },
    });

    map.addLayer({
      id: `${layerName}-border`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": outlineColor,
        "line-width": 0,
        "line-opacity": 1,
      },
    });
  } else if (geometryType === "Point") {
    map.addLayer({
      id: layerName,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-color": fillColor,
        "circle-radius": 6,
      },
    });
  }
  setPickedColor(fillColor, layerName);
};
