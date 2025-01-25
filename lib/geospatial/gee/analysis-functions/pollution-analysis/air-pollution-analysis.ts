// An example of a bi-temporal analysis function that compares air pollution data between two time periods.
// In this version, no outlier detection and filtering is done. So, the extreme values may be erroneous.

import ee from "@google/earthengine";
import { getMapId, evaluate } from "@/features/maps/utils/gee-eval-utils";

interface MonitoringResult {
  urlFormat: string;
  geojson: any;
  legendConfig: {
    min: number;
    max: number;
    palette: string[];
  };
  mapStats: {
    [gas: string]: {
      Mean: {
        actual: string;
        percentage: string | null;
      };
      Median: {
        actual: string;
        percentage: string | null;
      };
      Min: {
        actual: string;
        percentage: string | null;
      };
      Max: {
        actual: string;
        percentage: string | null;
      };
      unit: AirPollutantsUnits;
    };
  };
}

// Function to apply the correct aggregation method
const applyAggregationMethod = (
  collection: any,
  method: AggregationMethodTypeNumerical
): any => {
  switch (method) {
    case "Mean":
      return collection.mean();
    case "Median":
      return collection.median();
    case "Max":
      return collection
        .reduce(ee.Reducer.max())
        .rename([collection.first().bandNames().get(0)]);
    case "Min":
      return collection.min();
    default:
      throw new Error("Unsupported aggregation method");
  }
};

export const airPollutionAnalysis = async (
  geometry: any,
  analysisOptions: MultiAnalysisOptionsTypeForAirPollutantsAnalysisType[],
  startDate1: string,
  endDate1: string,
  aggregationMethod: AggregationMethodTypeNumerical,
  startDate2 = "undefined--",
  endDate2 = "undefined--"
): Promise<MonitoringResult> => {
  if (endDate1 === "undefined--") {
    throw new Error("endDate1 is required");
  }

  const gasInfo: {
    [key: string]: {
      collectionId: string;
      bandName: string;
      unit: AirPollutantsUnits;
    };
  } = {
    CO: {
      collectionId: "COPERNICUS/S5P/NRTI/L3_CO",
      bandName: "CO_column_number_density",
      unit: "mol/m²",
    },
    NO2: {
      collectionId: "COPERNICUS/S5P/NRTI/L3_NO2",
      bandName: "tropospheric_NO2_column_number_density",
      unit: "mol/m²",
    },
    CH4: {
      collectionId: "COPERNICUS/S5P/OFFL/L3_CH4",
      bandName: "CH4_column_volume_mixing_ratio_dry_air",
      unit: "ppb",
    },
    Aerosols: {
      collectionId: "COPERNICUS/S5P/NRTI/L3_AER_AI",
      bandName: "absorbing_aerosol_index",
      unit: "index",
    },
  };

  const period1Images: { [gas: string]: any } = {};
  const period2Images: { [gas: string]: any } = {};
  const analysisImages: { [gas: string]: any } = {};
  const minValues: { [gas: string]: number } = {};
  const maxValues: { [gas: string]: number } = {};
  const meanValues: { [gas: string]: number } = {};
  const medianValues: { [gas: string]: number } = {};

  // New variables to store period1 and period2 stats
  const meanPeriod1Values: { [gas: string]: number } = {};
  const medianPeriod1Values: { [gas: string]: number } = {};

  const meanPeriod2Values: { [gas: string]: number } = {};
  const medianPeriod2Values: { [gas: string]: number } = {};

  const percentageMode =
    startDate2 !== "undefined--" && endDate2 !== "undefined--";

  for (const gas of analysisOptions) {
    const gasData = gasInfo[gas];

    // Period 1 collection and image
    const collection1 = ee
      .ImageCollection(gasData.collectionId)
      .select([gasData.bandName], [gas])
      .filterDate(startDate1, endDate1)
      .filterBounds(geometry);

    const img_period1 = applyAggregationMethod(
      collection1,
      aggregationMethod
    ).clip(geometry);

    period1Images[gas] = img_period1;

    // Compute stats for period 1
    const statsPeriod1 = img_period1.reduceRegion({
      reducer: ee.Reducer.min()
        .combine({ reducer2: ee.Reducer.max(), sharedInputs: true })
        .combine({ reducer2: ee.Reducer.mean(), sharedInputs: true })
        .combine({ reducer2: ee.Reducer.median(), sharedInputs: true }),
      scale: 1113.2,
      geometry: geometry,
      maxPixels: 1e9,
    });

    const [minValue1, maxValue1, meanValue1, medianValue1] = (await Promise.all(
      [
        evaluate(statsPeriod1.get(`${gas}_min`)),
        // evaluate(statsPeriod1.get(`${gas}_p90`)),
        evaluate(statsPeriod1.get(`${gas}_max`)),
        evaluate(statsPeriod1.get(`${gas}_mean`)),
        evaluate(statsPeriod1.get(`${gas}_median`)),
      ]
    )) as number[];

    if (!percentageMode) {
      // If not in percentage mode, use period1 stats
      minValues[gas] = minValue1;
      maxValues[gas] = maxValue1;
      meanValues[gas] = meanValue1;
      medianValues[gas] = medianValue1;
    }

    meanPeriod1Values[gas] = meanValue1;
    medianPeriod1Values[gas] = medianValue1;

    if (percentageMode) {
      // Period 2 collection and image
      const collection2 = ee
        .ImageCollection(gasData.collectionId)
        .select([gasData.bandName], [gas])
        .filterDate(startDate2, endDate2)
        .filterBounds(geometry);

      const img_period2 = applyAggregationMethod(
        collection2,
        aggregationMethod
      ).clip(geometry);

      period2Images[gas] = img_period2;

      // Compute stats for period 2
      const statsPeriod2 = img_period2.reduceRegion({
        reducer: ee.Reducer.min()
          .combine({
            // reducer2: ee.Reducer.percentile([90]),
            reducer2: ee.Reducer.max(),
            sharedInputs: true,
          })
          .combine({ reducer2: ee.Reducer.mean(), sharedInputs: true })
          .combine({ reducer2: ee.Reducer.median(), sharedInputs: true }),
        scale: 1113.2,
        geometry: geometry,
        maxPixels: 1e9,
      });

      const [minValue2, maxValue2, meanValue2, medianValue2] =
        (await Promise.all([
          evaluate(statsPeriod2.get(`${gas}_min`)),
          // evaluate(statsPeriod2.get(`${gas}_p90`)),
          evaluate(statsPeriod2.get(`${gas}_max`)),
          evaluate(statsPeriod2.get(`${gas}_mean`)),
          evaluate(statsPeriod2.get(`${gas}_median`)),
        ])) as number[];

      // Use period 2 stats for actual values
      minValues[gas] = minValue2;
      maxValues[gas] = maxValue2;
      meanValues[gas] = meanValue2;
      medianValues[gas] = medianValue2;

      meanPeriod2Values[gas] = meanValue2;
      medianPeriod2Values[gas] = medianValue2;

      // Compute percentage change images
      analysisImages[gas] = img_period2
        .subtract(img_period1)
        .divide(img_period1)
        .multiply(100);
    } else {
      // If not in percentage mode, analysis image is period1 image
      analysisImages[gas] = img_period1;
    }
  }

  const mapStats: { [gas: string]: any } = {};
  for (const gas of analysisOptions) {
    let percentageMeanChange = null;
    let percentageMedianChange = null;

    if (percentageMode) {
      // Handle mean percentage change
      if (meanPeriod1Values[gas] === 0) {
        // Period 1 is zero
        percentageMeanChange = meanPeriod2Values[gas] !== 0 ? 100 : 0;
      } else if (meanPeriod1Values[gas] < 0 && meanPeriod2Values[gas] < 0) {
        // Both periods are negative
        percentageMeanChange =
          ((meanPeriod2Values[gas] - meanPeriod1Values[gas]) /
            Math.abs(meanPeriod1Values[gas])) *
          100;
      } else if (meanPeriod1Values[gas] < 0 && meanPeriod2Values[gas] > 0) {
        // Negative to positive
        percentageMeanChange =
          ((meanPeriod2Values[gas] - meanPeriod1Values[gas]) /
            Math.abs(meanPeriod1Values[gas])) *
          100;
      } else if (meanPeriod1Values[gas] > 0 && meanPeriod2Values[gas] < 0) {
        // Positive to negative
        percentageMeanChange =
          ((meanPeriod2Values[gas] - meanPeriod1Values[gas]) /
            Math.abs(meanPeriod1Values[gas])) *
          100;
      } else {
        // Default case (both positive or one is zero)
        percentageMeanChange =
          ((meanPeriod2Values[gas] - meanPeriod1Values[gas]) /
            Math.abs(meanPeriod1Values[gas])) *
          100;
      }

      // Handle median percentage change
      if (medianPeriod1Values[gas] === 0) {
        // Period 1 is zero
        percentageMedianChange = medianPeriod2Values[gas] !== 0 ? 100 : 0;
      } else if (medianPeriod1Values[gas] < 0 && medianPeriod2Values[gas] < 0) {
        // Both periods negative
        percentageMedianChange =
          ((medianPeriod2Values[gas] - medianPeriod1Values[gas]) /
            Math.abs(medianPeriod1Values[gas])) *
          100;
      } else if (medianPeriod1Values[gas] < 0 && medianPeriod2Values[gas] > 0) {
        // Negative to positive
        percentageMedianChange =
          ((medianPeriod2Values[gas] - medianPeriod1Values[gas]) /
            Math.abs(medianPeriod1Values[gas])) *
          100;
      } else if (medianPeriod1Values[gas] > 0 && medianPeriod2Values[gas] < 0) {
        // Positive to negative
        percentageMedianChange =
          ((medianPeriod2Values[gas] - medianPeriod1Values[gas]) /
            Math.abs(medianPeriod1Values[gas])) *
          100;
      } else {
        // Default case
        percentageMedianChange =
          ((medianPeriod2Values[gas] - medianPeriod1Values[gas]) /
            Math.abs(medianPeriod1Values[gas])) *
          100;
      }
    }

    mapStats[gas] = {
      Mean: {
        actual: meanValues[gas].toExponential(2),
        percentage: percentageMode ? percentageMeanChange?.toFixed(0) : null,
      },
      Median: {
        actual: medianValues[gas].toExponential(2),
        percentage: percentageMode ? percentageMedianChange?.toFixed(0) : null,
      },
      Min: {
        actual: minValues[gas].toExponential(2),
        percentage: null,
      },
      Max: {
        actual: maxValues[gas].toExponential(2),
        percentage: null,
      },
      unit: gasInfo[gas].unit,
    };
  }

  // Combine the analysis images
  const combinedHotspot = analysisOptions.reduce((acc, gas) => {
    return acc ? acc.max(analysisImages[gas]) : analysisImages[gas];
  }, null as any);

  // Get the band name of combinedHotspot
  const bandNames: any = await evaluate(combinedHotspot.bandNames());
  const bandName = bandNames[0]; // Assuming single band

  // Compute max value from combinedHotspot
  const combinedHotspotStats = combinedHotspot.reduceRegion({
    reducer: ee.Reducer.min().combine({
      reducer2: ee.Reducer.max(),
      sharedInputs: true,
    }),
    geometry: geometry,
    scale: 1113.2,
    maxPixels: 1e9,
  });

  // Retrieve both values
  const [minValue, maxValue] = (await Promise.all([
    evaluate(combinedHotspotStats.get(`${bandName}_min`)),
    evaluate(combinedHotspotStats.get(`${bandName}_max`)),
  ])) as number[];

  const hotspotVisParams = percentageMode
    ? { min: minValue, max: maxValue, palette: ["blue", "white", "red"] }
    : { min: 0, max: 1, palette: ["blue", "yellow", "red"] };

  const { urlFormat } = (await getMapId(
    combinedHotspot.clip(geometry),
    hotspotVisParams
  )) as any;
  const imageGeom = combinedHotspot.geometry();
  const imageGeometryGeojson = await evaluate(imageGeom);

  return {
    urlFormat,
    geojson: imageGeometryGeojson,
    legendConfig: percentageMode
      ? { min: minValue, max: maxValue, palette: ["blue", "white", "red"] }
      : { min: 0, max: 1, palette: ["blue", "yellow", "red"] },
    mapStats,
  };
};
