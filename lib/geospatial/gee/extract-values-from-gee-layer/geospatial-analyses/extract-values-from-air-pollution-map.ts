import ee from "@google/earthengine";
import { evaluate } from "@/features/maps/utils/gee-eval-utils";

type InputArgsType = {
  geojsonFeature: any;
  aggregationMethod: AggregationMethodType;
  startDate1: string;
  endDate1: string;
  startDate2?: string;
  endDate2?: string;
  gases: MultiAnalysisOptionsTypeForAirPollutantsAnalysisType[];
};

type AggregationMethodType = "Mean" | "Median" | "Max" | "Min";

export async function extractValuesFromAirPollutionMap({
  geojsonFeature,
  aggregationMethod,
  startDate1,
  endDate1,
  startDate2,
  endDate2,
  gases,
}: InputArgsType) {
  const features =
    geojsonFeature.type === "FeatureCollection"
      ? geojsonFeature.features
      : [geojsonFeature];

  // Adjusted the structure to store objects instead of arrays of strings
  const results: {
    monoTemporalQueryValues: {
      [gas: string]: {
        gasValue1?: string;
        gasValue2?: string;
        differenceValue?: string;
        percentageChange?: string;
        unit?: AirPollutantsUnits; // "mol/m²" | "ppm" | "mol fraction" | "unitless";
      };
    };
    timeSeriesQueryValues: { [gas: string]: any[] };
  } = {
    monoTemporalQueryValues: {},
    timeSeriesQueryValues: {},
  };

  // Initialize result object for each gas
  gases.forEach((gas) => {
    results.monoTemporalQueryValues[gas] = {}; // Initialize as an object
    results.timeSeriesQueryValues[gas] = [];
  });

  // Map the aggregationMethod to the corresponding EE reducer
  const reducerMapping: { [key in AggregationMethodType]: any } = {
    Mean: ee.Reducer.mean(),
    Median: ee.Reducer.median(),
    Max: ee.Reducer.max(),
    Min: ee.Reducer.min(),
  };

  // Get the appropriate reducer based on the aggregationMethod
  const selectedReducer = reducerMapping[aggregationMethod];

  const percentageMode =
    startDate2 !== "undefined--" && endDate2 !== "undefined--";

  for (const feature of features) {
    let geometry: any;
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

    let originalBandName: string;
    let unit: AirPollutantsUnits;
    for (const gas of gases) {
      switch (gas) {
        case "CO":
          originalBandName = `CO_column_number_density`;
          unit = "mol/m²";
          break;
        case "NO2":
          originalBandName = `tropospheric_NO2_column_number_density`;
          unit = "mol/m²";
          break;
        case "CH4":
          originalBandName = `CH4_column_volume_mixing_ratio_dry_air`;
          unit = "ppb";
          break;
        case "Aerosols":
          originalBandName = `absorbing_aerosol_index`;
          unit = "index";
          break;
        default:
          throw new Error("Unsupported gas type");
      }

      let imageBaseUrl;
      switch (gas) {
        case "CO":
        case "NO2":
          imageBaseUrl = `COPERNICUS/S5P/NRTI/L3_${gas}`;
          break;
        case "CH4":
          imageBaseUrl = `COPERNICUS/S5P/OFFL/L3_${gas}`;
          break;
        case "Aerosols":
          imageBaseUrl = `COPERNICUS/S5P/NRTI/L3_AER_AI`;
          break;
      }

      // Load gas data for the first time period
      const gas_period1 = ee
        .ImageCollection(imageBaseUrl)
        .select([originalBandName])
        .filterDate(startDate1, endDate1)
        .filterBounds(geometry);

      let combined_gas_period = gas_period1;

      if (
        startDate2 &&
        endDate2 &&
        startDate2 !== "undefined--" &&
        endDate2 !== "undefined--"
      ) {
        // Load gas data for the second time period
        const gas_period2 = ee
          .ImageCollection(imageBaseUrl)
          .select([originalBandName])
          .filterDate(startDate2, endDate2)
          .filterBounds(geometry);

        // Merge the two periods
        combined_gas_period = gas_period1.merge(gas_period2);
      }
      ///////////////////////////// Time series analysis ///////////////////////////////
      // Create time series features by date
      const timeSeriesFeatures = combined_gas_period.map(function (image: any) {
        const gasValuesDict = image.reduceRegion({
          reducer: selectedReducer, // Use the chosen aggregation method (mean, median, etc.)
          geometry: geometry,
          scale: 10,
          maxPixels: 1e9,
        });

        return ee.Feature(null, {
          date: image.date().format("YYYY-MM-dd"),
          [gas]: gasValuesDict.get(originalBandName),
        });
      });

      // Aggregate by date to handle multiple data points for the same day
      const uniqueDates = timeSeriesFeatures.aggregate_array("date").distinct(); // Get unique dates

      const groupedByDate = uniqueDates.map(function (date: any) {
        const filteredForDate = timeSeriesFeatures.filter(
          ee.Filter.eq("date", date)
        );

        // Apply the selected reducer to aggregate data for each day
        const reducedForDate = filteredForDate
          .aggregate_array(gas) // Collect all values for the same day
          .reduce(selectedReducer); // Reduce them using the selected method (mean, median, etc.)

        return ee.Feature(null, {
          date: date,
          [gas]: reducedForDate,
        });
      });

      // Convert the ee.List to an actual list
      const timeSeriesValues: any = await evaluate(groupedByDate);

      // Extract date and aggregated gas values for daily intervals
      const timeSeriesData = timeSeriesValues.map((feature: any) => {
        return {
          date: feature.properties.date,
          [gas]: feature.properties[gas]
            ? parseFloat(feature.properties[gas]).toExponential(2)
            : "N/A",
        };
      });

      // Add to timeSeriesQueryValues
      results.timeSeriesQueryValues[gas].push(...timeSeriesData);

      ///////////////////////////// Mono-temporal analysis ///////////////////////////////
      const gasValueDict1 = gas_period1.reduce(selectedReducer).reduceRegion({
        reducer: ee.Reducer.median(),
        scale: 10,
        geometry: geometry,
        maxPixels: 1e9,
      });

      let gasValue1: number | null;
      try {
        gasValue1 = (await evaluate(
          gasValueDict1.get(
            `${originalBandName}_${aggregationMethod.toLowerCase()}`
          )
        )) as number;
      } catch (e) {
        console.error(`Error retrieving ${gas} value for Period 1:`, e);
        gasValue1 = null;
      }

      if (gasValue1 !== null) {
        results.monoTemporalQueryValues[gas].gasValue1 =
          gasValue1.toExponential(2);
      } else {
        results.monoTemporalQueryValues[gas].gasValue1 = "N/A";
      }

      results.monoTemporalQueryValues[gas].unit = unit;

      if (percentageMode) {
        // Load gas data for the second time period
        const gas_period2 = ee
          .ImageCollection(imageBaseUrl)
          .select([originalBandName])
          .filterDate(startDate2, endDate2)
          .filterBounds(geometry);

        // Compute the median (or selected) value for period 2
        const gasValueDict2 = gas_period2.reduce(selectedReducer).reduceRegion({
          reducer: ee.Reducer.median(),
          scale: 10,
          geometry: geometry,
          maxPixels: 1e9,
        });

        let gasValue2: number | null;
        try {
          gasValue2 = (await evaluate(
            gasValueDict2.get(
              `${originalBandName}_${aggregationMethod.toLowerCase()}`
            )
          )) as number;
        } catch (e) {
          console.error(`Error retrieving ${gas} value for Period 2:`, e);
          gasValue2 = null;
        }

        if (gasValue2 !== null) {
          results.monoTemporalQueryValues[gas].gasValue2 =
            gasValue2.toExponential(2);
        } else {
          results.monoTemporalQueryValues[gas].gasValue2 = "N/A";
        }

        if (gasValue1 !== null && gasValue2 !== null) {
          const differenceValue = gasValue2 - gasValue1;
          let percentageChange: number | string;

          // Handle edge cases for percentage change
          if (gasValue1 === 0) {
            // If the initial value is zero, avoid division by zero
            percentageChange =
              gasValue2 === 0 ? 0 : gasValue2 > 0 ? "+∞" : "-∞"; // Infinite percentage change
          } else {
            percentageChange = (differenceValue / Math.abs(gasValue1)) * 100;
          }
          results.monoTemporalQueryValues[gas].differenceValue =
            differenceValue.toExponential(2);
          results.monoTemporalQueryValues[gas].percentageChange =
            typeof percentageChange === "string"
              ? percentageChange
              : percentageChange.toFixed(2) + "%";
        } else {
          results.monoTemporalQueryValues[gas].differenceValue = "N/A";
          results.monoTemporalQueryValues[gas].percentageChange = "N/A";
        }
      }
    }
  }

  // Sort the time series data for each gas from oldest to newest date
  for (const gas of gases) {
    results.timeSeriesQueryValues[gas].sort((a, b) => {
      const dateA = new Date(a.date) as any;
      const dateB = new Date(b.date) as any;
      return dateA - dateB; // Sorts in ascending order (oldest first)
    });
  }

  return {
    type: "function",
    name: "Air Pollutants Analysis ",
    values: results,
  };
}
