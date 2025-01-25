// This is an example of

import ee from "@google/earthengine";

type InputArgsType = {
  geojsonFeature: any;
  tempCreatedMapInAsset: any;
  startDate: string;
  endDate: string;
};

export async function extractValuesFromSentinelLandcoverLanduseMap({
  geojsonFeature,
  tempCreatedMapInAsset,
}: InputArgsType) {
  const features =
    geojsonFeature.type === "FeatureCollection"
      ? geojsonFeature.features
      : [geojsonFeature];
  const results: {
    monoTemporalQueryValues: any[];
    timeSeriesQueryValues: any[];
  } = { monoTemporalQueryValues: [], timeSeriesQueryValues: [] };

  const labelNames = [
    "Built",
    "Tree",
    "Rangeland",
    "Flooded Vegetation",
    "Water",
    "Bare",
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
          geometry = ee.Geometry(feature);
        } else {
          throw new Error("Unsupported geometry type");
        }
      }
    } catch (error) {
      console.error("Error creating geometry:", error);
      continue;
    }

    try {
      // Extract the task ID from tempCreatedMapInAsset
      const [gcpPath, taskId] = tempCreatedMapInAsset.split("|");

      // Wait until the prediction map is ready in the asset
      await waitForTaskCompletion(taskId);

      // const eePredictionMap = ee.Image(geeAssetsId + "/" + assetName);
      const eePredictionMap = ee.Image.loadGeoTIFF(`${gcpPath}.tif`);

      // Reduce region and calculate class occurrences
      const reduce = eePredictionMap
        .reduceRegion({
          reducer: ee.Reducer.frequencyHistogram(),
          scale: 10,
          geometry: geometry,
          maxPixels: 1e20,
        })
        .get("band1");

      const result = await new Promise<{ [key: string]: number }>(
        (resolve, reject) => {
          reduce.evaluate((info: any, error: any) => {
            if (error) {
              reject(error);
            } else if (info) {
              resolve(info);
            } else {
              reject(new Error("Failed to get class histogram"));
            }
          });
        }
      );

      if (result) {
        const totalPixels = Object.values(result).reduce(
          (sum, count) => sum + count,
          0
        );
        const classPercentages = Object.keys(result).map((classId) => {
          const count = result[classId];
          const percentage = ((count / totalPixels) * 100).toFixed(0);
          return {
            name: labelNames[parseInt(classId) - 1],
            percentage,
          };
        });

        results.monoTemporalQueryValues.push(...classPercentages);
      }
    } catch (error) {
      console.error("Error obtaining class histogram:", error);
    }
  }

  return results;
}

// Function to track task completion on GEE
async function waitForTaskCompletion(taskId: string) {
  return new Promise<void>((resolve, reject) => {
    const checkStatus = () => {
      ee.data.getTaskStatus([taskId], (status: any) => {
        if (status[0].state === "COMPLETED") {
          resolve();
        } else if (
          status[0].state === "FAILED" ||
          status[0].state === "CANCELLED"
        ) {
          reject(new Error(`Task failed or cancelled: ${status[0].state}`));
        } else {
          // Continue checking every 5 seconds
          setTimeout(checkStatus, 5000);
        }
      });
    };
    checkStatus();
  });
}
