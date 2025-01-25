import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { geeAuthenticate } from "@/features/maps/utils/authentication-utils/gee-auth";
import { urbanHeatIslandAnalysis } from "@/lib/geospatial/gee/analysis-functions/heat-analysis/urban-heat-island-analysis";
import { airPollutionAnalysis } from "@/lib/geospatial/gee/analysis-functions/pollution-analysis/air-pollution-analysis";
import { convertToEeGeometry } from "@/features/maps/utils/geometry-utils";
import googleDynamicWorldMapping from "@/lib/geospatial/gee/analysis-functions/lancover-landuse-mapping/google-dynamic-world-landcover-mapping";
import landcoverChangeMapping from "@/lib/geospatial/gee/analysis-functions/lancover-landuse-mapping/landcover-change-mapping";

const validAnalysisOptionsForAtmosphericGasAnalysis: MultiAnalysisOptionsTypeForAirPollutantsAnalysisType[] =
  ["CO", "NO2", "CH4", "Aerosols"];

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  let geometry: any = null;

  const functionType = req.nextUrl.searchParams.get("functionType") || "";
  const selectedRoiGeometry =
    req.nextUrl.searchParams.get("selectedRoiGeometry") || "";

  if (selectedRoiGeometry && selectedRoiGeometry !== "undefined") {
    const geometryString = decodeURIComponent(selectedRoiGeometry);
    geometry = JSON.parse(geometryString);
  } else {
    throw new Error(
      "No Region of Interest (ROI) was selected for the analysis. Please provide an ROI and try again."
    );
  }

  const aggregationMethod =
    req.nextUrl.searchParams.get("aggregationMethod") || "";
  const startDate1 = req.nextUrl.searchParams.get("startDate1") || "";
  const endDate1 = req.nextUrl.searchParams.get("endDate1") || "";
  const startDate2 = req.nextUrl.searchParams.get("startDate2") || "";
  const endDate2 = req.nextUrl.searchParams.get("endDate2") || "";
  const multiAnalysisOptionsString =
    req.nextUrl.searchParams.get("multiAnalysisOptions") || "";
  const multiAnalysisOptions = multiAnalysisOptionsString
    ? JSON.parse(decodeURIComponent(multiAnalysisOptionsString))
    : [];

  try {
    await initializeGee();

    const convertedGeometry = convertToEeGeometry(geometry);

    let result;
    switch (functionType) {
      case "Air Pollution Analysis":
        if (
          multiAnalysisOptions.every((option: any) =>
            validAnalysisOptionsForAtmosphericGasAnalysis.includes(
              option as MultiAnalysisOptionsTypeForAirPollutantsAnalysisType
            )
          )
        ) {
          result = await airPollutionAnalysis(
            geometry,
            multiAnalysisOptions as MultiAnalysisOptionsTypeForAirPollutantsAnalysisType[],
            startDate1,
            endDate1,
            aggregationMethod as AggregationMethodTypeNumerical,
            startDate2,
            endDate2
          );
        } else {
          throw new Error(
            "Invalid analysis option for Air Pollutants Analysis"
          );
        }
        break;
      case "Land Use/Land Cover Maps":
        result = await googleDynamicWorldMapping(
          convertedGeometry,
          startDate1,
          endDate1
        );
        break;

      case "Land Use/Land Cover Change Maps":
        result = await landcoverChangeMapping(
          convertedGeometry,
          startDate1,
          endDate1,
          startDate2,
          endDate2
        );
        break;

      case "Urban Heat Island (UHI) Analysis":
        result = await urbanHeatIslandAnalysis(
          convertedGeometry,
          startDate1,
          endDate1,
          aggregationMethod as AggregationMethodTypeNumerical
        );
        break;
      default:
        throw new Error("Invalid function type");
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ result: error.message }, { status: 404 });
  }
}

// Function to initialize Google Earth Engine
const initializeGee = async () => {
  await geeAuthenticate();
};
