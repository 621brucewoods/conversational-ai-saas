"use server";

import ee from "@google/earthengine";
import { extractYear } from "@/utils/general/general-utils";
import { evaluate, getMapId } from "@/features/maps/utils/gee-eval-utils";
import { createClient } from "@/utils/supabase/server";
type AggregationMethodType = "Median" | "Mean" | "Max" | "Min";

// Function to apply the correct aggregation method
const applyAggregationMethod = (
  collection: any,
  method: AggregationMethodType
): any => {
  switch (method) {
    case "Mean":
      return collection.mean();
    case "Median":
      return collection.median();
    case "Max":
      return collection.max();
    case "Min":
      return collection.min();
    default:
      throw new Error("Unsupported aggregation method");
  }
};

// Function to get the urban areas from the Dynamic World dataset
const getUrbanAreas = (geometry: any, startDate: any, endDate: any) => {
  const landCover = ee
    .ImageCollection("GOOGLE/DYNAMICWORLD/V1")
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .select("label")
    .mode()
    .clip(geometry);

  // Select built areas (label 6 in the Dynamic World dataset represents urban/built)
  const urbanAreas = landCover.eq(6);
  const nonUrbanAreas = landCover.neq(6);

  return { urbanAreas, nonUrbanAreas };
};

// Function to calculate the Surface Urban Heat Island Intensity (SUHII) index
const calculateSUHIIIndex = async (
  lst: any,
  geometry: any,
  startDate: any,
  endDate: any
) => {
  const { urbanAreas, nonUrbanAreas } = getUrbanAreas(
    geometry,
    startDate,
    endDate
  );
  const urbanLST = lst.updateMask(urbanAreas);
  const nonUrbanLST = lst.updateMask(nonUrbanAreas);
  const urbanLSTMean = urbanLST
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e15,
    })
    .get("LST_Celsius");

  const nonUrbanLSTMean = nonUrbanLST
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e13,
    })
    .get("LST_Celsius");

  const urbanMean: any = await evaluate(urbanLSTMean);
  const nonUrbanMean: any = await evaluate(nonUrbanLSTMean);

  const suhiiIndex = (urbanMean - nonUrbanMean).toFixed(2);

  return suhiiIndex;
};

// Function to calculate the Impervious Surface Area (ISA) index
const calculateISAIndex = async (
  geometry: any,
  startDate: any,
  endDate: any
) => {
  const { urbanAreas, nonUrbanAreas } = getUrbanAreas(
    geometry,
    startDate,
    endDate
  );

  const isaUrbanArea = urbanAreas
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e15,
    })
    .get("label");

  const nonUrbanArea = nonUrbanAreas
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e13,
    })
    .get("label");

  const urbanArea: any = await evaluate(isaUrbanArea);
  const nonUrbanAreaValue: any = await evaluate(nonUrbanArea);

  const isaRatio = (urbanArea / (urbanArea + nonUrbanAreaValue)).toFixed(2);
  return isaRatio;
};

// Function to calculate the Urban Heat Hazard Index (UHHI)
const calculateUHHIInex = async (
  geometry: any,
  lst: any,
  populationLayer: any,
  startDate: any,
  endDate: any
) => {
  // Load population density from Earth Engine (replace with actual population layer when you get it later from the city)
  const populationDensity = ee
    .ImageCollection(populationLayer)
    .select("population_density")
    .filterBounds(geometry)
    .filterDate("2020-01-01", "2020-02-01")
    .median()
    .clip(geometry);

  const populationMean = populationDensity
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e13,
    })
    .get("population_density");

  const lstMean = lst
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e13,
    })
    .get("LST_Celsius");

  const populationMeanValue: any = await evaluate(populationMean);
  const lstMeanValue: any = await evaluate(lstMean);

  const uhhIndex = (lstMeanValue * populationMeanValue).toFixed(2);
  return uhhIndex;
};

// Entry point for the Urban Heat Island Analysis
export const urbanHeatIslandAnalysis = async (
  geometry: any,
  startDate: any,
  endDate: any,
  aggregationMethod: AggregationMethodType
) => {
  // Authenticate the user
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Unauthenticated!");
  }

  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  const applyScaleFactors = (image: any): any => {
    const thermalBand = image.select("ST_B10").multiply(0.00341802).add(149.0);
    const lst = thermalBand.subtract(273.15).rename("LST_Celsius");
    const QABand = image.select("QA_PIXEL");
    // Create a cloud mask
    const cloudMask = QABand.bitwiseAnd(1 << 3)
      .or(QABand.bitwiseAnd(1 << 1))
      .or(QABand.bitwiseAnd(1 << 4))
      .eq(0);

    const maskedLST = lst.updateMask(cloudMask);

    return maskedLST.set("system:time_start", image.get("system:time_start"));
  };

  // Function to remove outliers from the collection
  const removeOutliers = (collection: any): any => {
    // Compute statistics
    const mean = collection.mean();
    const stdDev = collection.reduce(ee.Reducer.stdDev());
    const threshold = stdDev.multiply(2); // 2 standard deviations threshold

    // Filter images within the threshold
    const filteredCollection = collection.map((image: any) => {
      const lst = image.select("LST_Celsius");
      const diff = lst.subtract(mean).abs();
      return image.updateMask(diff.lte(threshold));
    });

    return filteredCollection;
  };

  // Function to get LST for a given year
  const getLSTForYear = (year: any): any => {
    const startDate = ee.Date.fromYMD(year, 6, 1);
    const endDate = ee.Date.fromYMD(year, 8, 31);

    let combinedCollection = ee
      .ImageCollection("LANDSAT/LC08/C02/T1_L2")
      .merge(ee.ImageCollection("LANDSAT/LC09/C02/T1_L2"))
      .filterBounds(geometry)
      .filterDate(startDate, endDate)
      .map(applyScaleFactors);

    // Remove outliers if necessary
    if (aggregationMethod === "Max" || aggregationMethod === "Min") {
      combinedCollection = removeOutliers(combinedCollection);
    }

    // Apply aggregation
    const aggregatedResult = applyAggregationMethod(
      combinedCollection,
      aggregationMethod
    );

    return aggregatedResult.set("year", year);
    // return combinedCollection.median().set("year", year);
  };

  const years = ee.List.sequence(startYear, endYear);

  // Calculate statistics for each year
  const lstStatsByYear = years.map((year: any) => {
    const lstForYear = getLSTForYear(year);
    const stats = lstForYear.reduceRegion({
      reducer: ee.Reducer.mean()
        .combine(ee.Reducer.median(), "", true)
        .combine(ee.Reducer.min(), "", true)
        .combine(ee.Reducer.max(), "", true)
        .combine(ee.Reducer.percentile([25]), "", true)
        .combine(ee.Reducer.percentile([75]), "", true),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e9,
    });

    return ee.Dictionary({
      year: year,
      mean: stats.get("LST_Celsius_mean"),
      median: stats.get("LST_Celsius_median"),
      min: stats.get("LST_Celsius_min"),
      max: stats.get("LST_Celsius_max"),
      q1: stats.get("LST_Celsius_p25"),
      q3: stats.get("LST_Celsius_p75"),
    });
  });

  // Convert lstStatsByYear to client-side data
  const lstStatsByYearInfo = (await evaluate(lstStatsByYear)) as number[];

  // Structure the output as required
  const mapStats: any = {};
  lstStatsByYearInfo.forEach((stat: any) => {
    const year = stat.year.toString();
    mapStats[year] = {
      Mean: Number(stat.mean.toFixed(0)),
      Median: Number(stat.median.toFixed(0)),
      Min: Number(stat.min.toFixed(0)),
      Max: Number(stat.max.toFixed(0)),
      Q1: Number(stat.q1.toFixed(0)), // 25th percentile (Q1)
      Q3: Number(stat.q3.toFixed(0)), // 75th percentile (Q3)
    };
  });

  // Visualization part
  const lstImages = ee.ImageCollection.fromImages(
    years.map((year: any) => getLSTForYear(year))
  );

  const lastMapForVisualization = applyAggregationMethod(
    lstImages,
    aggregationMethod
  ).clip(geometry);

  const suhiiIndex = await calculateSUHIIIndex(
    lastMapForVisualization,
    geometry,
    startDate,
    endDate
  );
  const isaIndex = await calculateISAIndex(geometry, startDate, endDate);
  const uhhiIndex = await calculateUHHIInex(
    geometry,
    lastMapForVisualization,
    "CIESIN/GPWv411/GPW_Population_Density",
    startDate,
    endDate
  );

  const lstVizDict = lastMapForVisualization.reduceRegion({
    reducer: ee.Reducer.min().combine({
      reducer2: ee.Reducer.percentile([99]),
      sharedInputs: true,
    }),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e9,
  });

  const minLSTValue = await evaluate(lstVizDict.get("LST_Celsius_min"));
  const maxLSTValue = await evaluate(lstVizDict.get("LST_Celsius_p99"));

  const legendPalette = [
    "#0000FF", // Blue
    "#00FFFF", // Cyan
    "#00FF00", // Green
    "#FFFF00", // Yellow
    "#FFA500", // Orange
    "#FF0000", // Red
  ];

  const vis = { min: minLSTValue, max: maxLSTValue, palette: legendPalette };

  // Get the URL format for the visualization
  const { urlFormat } = (await getMapId(lastMapForVisualization, vis)) as any;
  const imageGeom = lastMapForVisualization.geometry();
  const imageGeometryGeojson = await evaluate(imageGeom);

  const uhiMetrics = [
    {
      Metric: "SUHII",
      Value: suhiiIndex,
      Unit: "°C",
      Description:
        "Surface Urban Heat Island Intensity (SUHII) measures the temperature difference between urban and rural areas.",
    },
    {
      Metric: "ISA",
      Value: isaIndex,
      Unit: "%",
      Description:
        "Impervious Surface Area (ISA) to LST ratio represents the proportion of impervious surfaces (like buildings and roads) relative to the land surface temperature.",
    },
    {
      Metric: "UHHI",
      Value: uhhiIndex,
      Unit: "°C × people/km²",
      Description:
        "Urban Heat Hazard Index (UHHI) combines population density and land surface temperature (LST) to quantify the heat exposure risk for the urban population.",
    },
  ];

  return {
    urlFormat,
    uhiMetrics,
    geojson: imageGeometryGeojson,
    legendConfig: {
      min: minLSTValue,
      max: maxLSTValue,
      palette: legendPalette,
    },
    mapStats: mapStats,
  };
};
