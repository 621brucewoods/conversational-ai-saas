import ee from "@google/earthengine";
import * as turf from "@turf/turf";

type InputArgsType = {
  geojsonFeature: any;
  startDate: string;
  endDate: string;
};

export async function extractValuesFromDynamicWorldMap({
  geojsonFeature,
  startDate,
  endDate,
}: InputArgsType) {
  const features =
    geojsonFeature.type === "FeatureCollection"
      ? geojsonFeature.features
      : [geojsonFeature];

  const results: {
    monoTemporalQueryValues: any[];
    timeSeriesQueryValues: any[];
  } = { monoTemporalQueryValues: [], timeSeriesQueryValues: [] };

  const labelNames: string[] = [
    "Water",
    "Trees",
    "Grass",
    "Flooded Vegetation",
    "Crops",
    "Shrub & Scrub",
    "Built Area",
    "Bare Ground",
    "Snow & Ice",
  ];

  for (const feature of features) {
    let geometry;
    try {
      if (feature) {
        if (feature.type === "Point") {
          geometry = ee.Geometry.Point(feature.coordinates);
        } else if (
          feature.type === "Polygon" ||
          feature.type === "MultiPolygon"
        ) {
          let allCoordinates = [];
          if (feature.type === "Polygon") {
            allCoordinates = feature.coordinates.reduce(
              (acc: any, ring: any) => acc.concat(ring),
              []
            );
          }
          if (feature.type === "MultiPolygon") {
            allCoordinates = feature.coordinates.reduce(
              (acc: any, polygon: any) =>
                acc.concat(
                  polygon.reduce(
                    (accRing: any, ring: any) => accRing.concat(ring),
                    []
                  )
                ),
              []
            );
          }
          if (
            allCoordinates.length >= 3 &&
            allCoordinates[0] !== allCoordinates[allCoordinates.length - 1]
          ) {
            allCoordinates.push(allCoordinates[0]);
          }
          geometry = ee.Geometry.Polygon(allCoordinates);
        } else {
          throw new Error("Unsupported geometry type");
        }
      }
    } catch (error) {
      console.error("Error creating geometry:", error);
      continue;
    }

    const dwMap = ee
      .ImageCollection("GOOGLE/DYNAMICWORLD/V1")
      .filterBounds(geometry)
      .filterDate(startDate, endDate)
      .select("label")
      .mode()
      .clip(geometry);

    try {
      const reduce = dwMap.reduceRegion({
        reducer: ee.Reducer.frequencyHistogram(),
        scale: 10,
        geometry,
        maxPixels: 1e13,
      });

      const result = await new Promise<{ label: { [key: string]: number } }>(
        (resolve, reject) => {
          reduce.getInfo((info: { label: { [key: string]: number } }) => {
            if (info && info.label) {
              resolve(info);
            } else {
              reject(new Error("Dynamic World data is undefined"));
            }
          });
        }
      );

      const totalPixels = Object.values(result.label).reduce(
        (sum, count) => sum + count,
        0
      );
      const classPercentages = Object.keys(result.label).map((classId) => {
        const count = result.label[classId];
        const percentage = ((count / totalPixels) * 100).toFixed(0);
        return {
          name: labelNames[parseInt(classId)],
          percentage,
        };
      });

      results.monoTemporalQueryValues.push(...classPercentages);
    } catch (error) {
      console.error(
        "Error obtaining DW histogram, attempting mode reducer:",
        error
      );
      try {
        const reduceMode = dwMap.reduceRegion({
          reducer: ee.Reducer.mode(),
          scale: 10,
          geometry,
          maxPixels: 1e13,
        });

        const modeResult = await new Promise<{ label: number }>(
          (resolve, reject) => {
            reduceMode.getInfo((info: { label: number }) => {
              if (info) {
                resolve(info);
              } else {
                reject(new Error("Failed to get mode value"));
              }
            });
          }
        );

        if (modeResult.label >= 0) {
          results.monoTemporalQueryValues.push({
            name: labelNames[modeResult.label],
            percentage: 100,
          });
        }
      } catch (modeError) {
        console.error("Failed to obtain mode value:", modeError);
      }
    }
  }

  return results;
}
