import { Map } from "maplibre-gl";

export const addGeeLayerToMap = async (
  map: Map,
  urlFormat: string,
  layerName: string,
  sourceId: string
) => {
  if (map.getSource(sourceId)) {
    map.removeLayer(layerName);
    map.removeSource(sourceId);
  }

  map.addSource(sourceId, {
    type: "raster",
    tiles: [urlFormat],
    tileSize: 256,
  });

  const layers = map.getStyle().layers;
  let firstDrawLayerId;
  if (layers) {
    const drawLayer = layers.find((layer) => layer.id.startsWith("gl-draw"));
    if (drawLayer) {
      firstDrawLayerId = drawLayer.id;
    }
  }

  map.addLayer(
    {
      id: layerName,
      type: "raster",
      source: sourceId,
      paint: {
        "raster-opacity": 0.8,
      },
    },
    firstDrawLayerId
  );
};
