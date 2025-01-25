"use server";
import { geeAuthenticate } from "@/features/maps/utils/authentication-utils/gee-auth";
import extractValuesFromUrbanHeatIslandMap from "./geospatial-analyses/extract-values-from-urban-heat-island-map";
import { extractValuesFromAirPollutionMap } from "./geospatial-analyses/extract-values-from-air-pollution-map";
import { extractValuesFromDynamicWorldMap } from "./geospatial-analyses/extract-values-from-google-dynamic-world-map";
import { extractValuesFromLandcoverChangeMap } from "./geospatial-analyses/extract-values-from-landcover-change-map";

type inputArgsType = {
  functionType: string;
  aggregationMethod?:
    | AggregationMethodTypeCategorical
    | AggregationMethodTypeNumerical;
  analysisOptions?: MultiAnalysisOptionsType[];
  tempCreatedMapInAsset?: any;
  geojsonFeature: any;
  startDate1: string;
  endDate1: string;
  startDate2?: string;
  endDate2?: string;
};

const validNumericalMethods: AggregationMethodTypeNumerical[] = [
  "Mean",
  "Median",
  "Max",
  "Min",
];
const validCategoricalMethods: AggregationMethodTypeCategorical[] = [
  "Mode",
  "90th Percentile",
];

export async function extractValuesFromGeeMap({
  functionType,
  analysisOptions,
  aggregationMethod,
  tempCreatedMapInAsset,
  geojsonFeature,
  startDate1,
  endDate1,
  startDate2,
  endDate2,
}: inputArgsType) {
  if (!functionType) return;
  await initializeGee();
  switch (functionType) {
    case "Air Pollution Analysis":
      if (
        validNumericalMethods.includes(
          aggregationMethod as AggregationMethodTypeNumerical
        )
      ) {
        return await extractValuesFromAirPollutionMap({
          geojsonFeature,
          gases:
            analysisOptions as MultiAnalysisOptionsTypeForAirPollutantsAnalysisType[],
          aggregationMethod:
            aggregationMethod as AggregationMethodTypeNumerical,
          startDate1,
          endDate1,
          startDate2,
          endDate2,
        });
      } else {
        throw new Error(
          "Invalid aggregation method for Air Pollutants Analysis. Expected 'Mean', 'Median', 'Max', or 'Min'."
        );
      }

    case "Urban Heat Island (UHI) Analysis":
      if (
        validNumericalMethods.includes(
          aggregationMethod as AggregationMethodTypeNumerical
        )
      ) {
        return await extractValuesFromUrbanHeatIslandMap({
          geojsonFeature,
          aggregationMethod:
            aggregationMethod as AggregationMethodTypeNumerical,
          startDate: startDate1,
          endDate: endDate1,
        });
      } else {
        throw new Error(
          "Invalid aggregation method for Urban Heat Island (UHI) Analysis. Expected 'Mean', 'Median', 'Max', or 'Min'."
        );
      }

    case "Land Use/Land Cover Maps":
      return await extractValuesFromDynamicWorldMap({
        geojsonFeature,
        startDate: startDate1,
        endDate: endDate1,
      });

    case "Land Use/Land Cover Change Maps":
      return await extractValuesFromLandcoverChangeMap({
        geojsonFeature,
        startDate1,
        endDate1,
        startDate2,
        endDate2,
      });

    default:
      return;
  }
}

const initializeGee = async () => {
  await geeAuthenticate();
};
