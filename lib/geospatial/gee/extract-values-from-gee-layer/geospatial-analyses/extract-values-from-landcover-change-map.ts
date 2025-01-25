import ee from "@google/earthengine";

const PROB_THRESHOLD = 0.5;

type InputArgsType = {
  geojsonFeature: any;
  startDate1: string;
  endDate1: string;
  startDate2: string | undefined;
  endDate2: string | undefined;
};

export async function extractValuesFromLandcoverChangeMap({
  geojsonFeature,
  startDate1,
  endDate1,
  startDate2,
  endDate2,
}: InputArgsType) {
  const results: {
    monoTemporalQueryValues: any[];
    timeSeriesQueryValues: any[];
    biTemporalQueryValues: Array<{
      year1Distribution: Record<string, string>;
      year2Distribution: Record<string, string>;
    }>;
  } = {
    monoTemporalQueryValues: [],
    timeSeriesQueryValues: [],
    biTemporalQueryValues: [],
  };

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

  const features =
    geojsonFeature.type === "FeatureCollection"
      ? geojsonFeature.features
      : [geojsonFeature];

  for (const feature of features) {
    let geometry;
    try {
      geometry = parseGeometry(feature);
    } catch (error) {
      console.error("Error creating geometry:", error);
      continue;
    }

    try {
      const fromCollection = ee
        .ImageCollection("GOOGLE/DYNAMICWORLD/V1")
        .filterBounds(geometry)
        .filterDate(startDate1, endDate1)
        .map((img: any) => {
          const probBands = img.select([
            "water",
            "trees",
            "grass",
            "flooded_vegetation",
            "crops",
            "shrub_and_scrub",
            "built",
            "bare",
            "snow_and_ice",
          ]);
          const maxProb = probBands.reduce(ee.Reducer.max());
          // Mask out pixels where the max probability < threshold
          return img.updateMask(maxProb.gte(PROB_THRESHOLD));
        });

      const fromImage = fromCollection.select("label").mode().clip(geometry);

      const toCollection = ee
        .ImageCollection("GOOGLE/DYNAMICWORLD/V1")
        .filterBounds(geometry)
        .filterDate(startDate2, endDate2)
        .map((img: any) => {
          const probBands = img.select([
            "water",
            "trees",
            "grass",
            "flooded_vegetation",
            "crops",
            "shrub_and_scrub",
            "built",
            "bare",
            "snow_and_ice",
          ]);
          const maxProb = probBands.reduce(ee.Reducer.max());
          return img.updateMask(maxProb.gte(PROB_THRESHOLD));
        });

      const toImage = toCollection.select("label").mode().clip(geometry);

      const fromHistogram = fromImage
        .reduceRegion({
          reducer: ee.Reducer.frequencyHistogram(),
          geometry,
          scale: 10,
          maxPixels: 1e13,
        })
        .get("label");

      const toHistogram = toImage
        .reduceRegion({
          reducer: ee.Reducer.frequencyHistogram(),
          geometry,
          scale: 10,
          maxPixels: 1e13,
        })
        .get("label");

      const [fromResult, toResult] = await Promise.all([
        new Promise<any>((resolve, reject) => {
          fromHistogram.evaluate((info: any) =>
            info ? resolve(info) : reject(new Error("No year1 histogram"))
          );
        }),
        new Promise<any>((resolve, reject) => {
          toHistogram.evaluate((info: any) =>
            info ? resolve(info) : reject(new Error("No year2 histogram"))
          );
        }),
      ]);

      const year1Distribution: Record<string, string> = {};
      if (fromResult) {
        const totalYear1Pixels = Object.values(fromResult).reduce(
          (sum: number, val: unknown) => sum + (val as number),
          0
        );
        for (const key in fromResult) {
          const classIndex = parseInt(key, 10);
          const count = fromResult[key];
          const pct = ((count / totalYear1Pixels) * 100).toFixed(1);
          const className = labelNames[classIndex] || `Unknown_${classIndex}`;
          year1Distribution[className] = pct;
        }
      }

      const year2Distribution: Record<string, string> = {};
      if (toResult) {
        const totalYear2Pixels = Object.values(toResult).reduce(
          (sum: number, val: unknown) => sum + (val as number),
          0
        );
        for (const key in toResult) {
          const classIndex = parseInt(key, 10);
          const count = toResult[key];
          const pct = ((count / totalYear2Pixels) * 100).toFixed(1);
          const className = labelNames[classIndex] || `Unknown_${classIndex}`;
          year2Distribution[className] = pct;
        }
      }

      results.biTemporalQueryValues.push({
        year1Distribution,
        year2Distribution,
      });
    } catch (err) {
      console.error("Error computing year1/year2 distributions:", err);
    }
  }

  return results;
}

function parseGeometry(featureGeom: any) {
  if (!featureGeom) throw new Error("Missing geometry");

  if (featureGeom.type === "Feature") {
    return parseGeometry(featureGeom.geometry);
  }

  switch (featureGeom.type) {
    case "Point":
      return ee.Geometry.Point(featureGeom.coordinates);

    case "Polygon":
    case "MultiPolygon": {
      let allCoords: number[][] = [];
      if (featureGeom.type === "Polygon") {
        allCoords = featureGeom.coordinates.reduce(
          (acc: any, ring: any) => acc.concat(ring),
          []
        );
      } else {
        allCoords = featureGeom.coordinates.reduce(
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
        allCoords.length >= 3 &&
        JSON.stringify(allCoords[0]) !==
          JSON.stringify(allCoords[allCoords.length - 1])
      ) {
        allCoords.push(allCoords[0]);
      }
      return ee.Geometry.Polygon(allCoords);
    }

    default:
      throw new Error(`Unsupported geometry type: ${featureGeom.type}`);
  }
}
