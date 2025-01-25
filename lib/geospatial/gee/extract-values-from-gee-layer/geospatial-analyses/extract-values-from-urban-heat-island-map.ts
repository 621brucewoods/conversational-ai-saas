"use server";
import ee from "@google/earthengine";
import { evaluate } from "@/features/maps/utils/gee-eval-utils";
import { extractYear } from "@/utils/general/general-utils";

type inputArgsType = {
  geojsonFeature: any;
  aggregationMethod: AggregationMethodType;
  startDate: string;
  endDate: string;
};

type AggregationMethodType = "Mean" | "Median" | "Max" | "Min";

export default async function extractValuesFromUrbanHeatIslandMap({
  geojsonFeature,
  aggregationMethod,
  startDate,
  endDate,
}: inputArgsType): Promise<any> {
  const startYearNumber = extractYear(startDate);
  const endYearNumber = extractYear(endDate);

  // Map the aggregationMethod to the corresponding EE reducer
  const reducerMapping: { [key in AggregationMethodType]: any } = {
    Mean: ee.Reducer.mean(),
    Median: ee.Reducer.median(),
    Max: ee.Reducer.max(),
    Min: ee.Reducer.min(),
  };

  // Get the appropriate reducer based on the aggregationMethod
  const selectedReducer = reducerMapping[aggregationMethod];

  const results: {
    monoTemporalQueryValues: string[];
    timeSeriesQueryValues: any[];
  } = {
    monoTemporalQueryValues: [],
    timeSeriesQueryValues: [],
  };

  let geometry: any;

  try {
    const features =
      geojsonFeature.type === "FeatureCollection"
        ? geojsonFeature.features
        : [geojsonFeature];

    for (const feature of features) {
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
    }
  } catch (error) {
    console.error("Error creating geometry:", error);
    return null;
  }

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

  const getLSTForYear = (year: any): any => {
    const startDate = ee.Date.fromYMD(year, 6, 1);
    const endDate = ee.Date.fromYMD(year, 8, 31);

    const combinedCollection = ee
      .ImageCollection("LANDSAT/LC08/C02/T1_L2")
      .merge(ee.ImageCollection("LANDSAT/LC09/C02/T1_L2"))
      .filterBounds(geometry)
      .filterDate(startDate, endDate)
      .map((image: any) => applyScaleFactors(image.clip(geometry)));

    // const maxLST = combinedCollection.max();
    const aggregatedLST = combinedCollection.reduce(selectedReducer);
    const yearStr = ee.String("LST_").cat(ee.Number(year).format("%d"));

    return ee.Algorithms.If(
      aggregatedLST.bandNames().size().gt(0),
      aggregatedLST.set("year", year).rename([yearStr]),
      null
    );
  };

  const years = ee.List.sequence(startYearNumber, endYearNumber);

  const lstImages = ee.ImageCollection.fromImages(
    years.map((year: any) => ee.Image(getLSTForYear(year)))
  ).toBands();

  const reduce = lstImages.reduceRegion({
    reducer: selectedReducer,
    scale: 10,
    geometry: geometry,
    maxPixels: 1e13,
  });

  const values = reduce.values().map((value: any) => ee.Number(value).toInt());

  const evaluateData: number[] = (await evaluate(values)) as number[];

  const yearsList: any = [];
  for (let year = startYearNumber; year <= endYearNumber; year++) {
    yearsList.push(year);
  }

  const timeSeriesData = evaluateData.map((value, index) => {
    return {
      year: yearsList[index],
      value: value,
    };
  });

  // Add time series data to results
  results.timeSeriesQueryValues.push(...timeSeriesData);

  /////////////////////////////// Mono-temporal analysis ///////////////////////////////

  const getAggregatedLSTForPeriod = (
    startYearNum: number,
    endYearNum: number
  ) => {
    const startDate = ee.Date.fromYMD(startYearNum, 6, 1);
    const endDate = ee.Date.fromYMD(endYearNum, 8, 31);

    const combinedCollection = ee
      .ImageCollection("LANDSAT/LC08/C02/T1_L2")
      .merge(ee.ImageCollection("LANDSAT/LC09/C02/T1_L2"))
      .filterBounds(geometry)
      .filterDate(startDate, endDate)
      .map((image: any) => applyScaleFactors(image.clip(geometry)));

    // Reduce the collection using selectedReducer
    const aggregatedLST = combinedCollection.reduce(selectedReducer);

    return aggregatedLST;
  };

  // Compute mono-temporal analysis
  let monoTemporalValue;

  // Compute aggregated LST over the period
  const aggregatedLST = getAggregatedLSTForPeriod(
    startYearNumber,
    endYearNumber
  );

  // Reduce over geometry
  const reducedAggregatedLST = aggregatedLST.reduceRegion({
    reducer: selectedReducer,
    scale: 1,
    geometry: geometry,
    maxPixels: 1e13,
  });

  // Get the value
  monoTemporalValue = reducedAggregatedLST.values().get(0);

  // Evaluate the value
  let evaluatedMonoTemporalValue;
  try {
    evaluatedMonoTemporalValue = await evaluate(monoTemporalValue);
  } catch (e) {
    console.error("Error retrieving mono-temporal value:", e);
    evaluatedMonoTemporalValue = null;
  }

  if (
    evaluatedMonoTemporalValue !== null &&
    evaluatedMonoTemporalValue !== undefined
  ) {
    results.monoTemporalQueryValues.push(
      parseInt(evaluatedMonoTemporalValue.toString()).toFixed(0)
    );
  }

  return results;
}
