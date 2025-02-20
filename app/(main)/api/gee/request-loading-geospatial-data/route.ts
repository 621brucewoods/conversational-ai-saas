import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { geeAuthenticate } from "@/features/maps/utils/authentication-utils/gee-auth";
import { convertToEeGeometry } from "@/features/maps/utils/geometry-utils";
import { loadRasterData } from "@/lib/geospatial/gee/load-data/load-raster-data";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }

  const {
    geospatialDataType,
    dataType,
    selectedRoiGeometry,
    divideValue,
    datasetId,
    startDate,
    endDate,
    visParams,
    labelNames,
  } = body;

  if (!selectedRoiGeometry) {
    return NextResponse.json(
      {
        error:
          "No Region of Interest (ROI) was provided. Please provide an ROI.",
      },
      { status: 400 }
    );
  }

  let geometry = selectedRoiGeometry;

  if (typeof selectedRoiGeometry === "string") {
    try {
      const geometryString = decodeURIComponent(selectedRoiGeometry);
      geometry = JSON.parse(geometryString);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid geometry format" },
        { status: 400 }
      );
    }
  }

  try {
    await initializeGee();
    const eeReadyGeometry = convertToEeGeometry(geometry);

    switch (geospatialDataType) {
      case "Load GEE Data": {
        if (!datasetId || !startDate || !endDate || !visParams || !labelNames) {
          return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
          );
        }

        const result = await loadRasterData(
          datasetId,
          dataType,
          eeReadyGeometry,
          startDate,
          endDate,
          divideValue,
          visParams,
          labelNames
        );

        if (!result) {
          return NextResponse.json(
            { error: "Failed to load raster data" },
            { status: 500 }
          );
        }

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "Invalid geospatial data type" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process geospatial data" },
      { status: 500 }
    );
  }
}

const initializeGee = async () => {
  await geeAuthenticate();
};
