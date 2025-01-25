import maplibregl from "maplibre-gl";

export const setupMapAttributions = (
  map: maplibregl.Map,
  googleSatelliteAttributionRef: any,
  osmAttributionRef: any,
  googleAttributionRef: any
) => {
  googleSatelliteAttributionRef.current = new maplibregl.AttributionControl({
    compact: false,
    customAttribution:
      '<span style="font-weight: 500;">Map data © 2024 Google</span>',
  });

  osmAttributionRef.current = new maplibregl.AttributionControl({
    compact: false,
    customAttribution:
      '<span style="font-weight: 500;">Map data © 2024 Google</span>',
  });

  googleAttributionRef.current = new maplibregl.AttributionControl({
    compact: false,
    customAttribution: "Google",
  });

  map.addControl(googleSatelliteAttributionRef.current, "bottom-right");
  map.addControl(osmAttributionRef.current, "bottom-right");
  map.addControl(googleAttributionRef.current, "bottom-right");

  osmAttributionRef.current._container.style.display = "none";
  googleAttributionRef.current._container.style.display = "none";
};
