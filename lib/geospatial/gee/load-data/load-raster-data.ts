"use server";
import ee from "@google/earthengine";
import { evaluate, getMapId } from "@/features/maps/utils/gee-eval-utils";
import { createClient } from "@/utils/supabase/server";

interface RasterDataResult {
  urlFormat: string;
  geojson: any;
  legendConfig: {
    labelNames: string[];
    palette: string[];
  };
  mapStats: Record<string, any>;
  extraDescription?: string;
}

interface visParams {
  palette?: string[];
  min?: number;
  max?: number;
}

export async function loadRasterData(
  datasetId: string,
  dataType: "Image" | "ImageCollection",
  geometry: any,
  startDate: string,
  endDate: string,
  divideValue: number,
  visParams: visParams,
  labelNames: string[]
): Promise<RasterDataResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Unauthenticated!");
  }

  let image;

  if (dataType === "ImageCollection") {
    const collection = ee
      .ImageCollection(datasetId)
      .filterBounds(geometry)
      .filterDate(startDate, endDate);

    // Check if collection is empty
    const count = await evaluate(collection.size());
    if (count === 0) {
      return {
        urlFormat: "",
        geojson: null,
        legendConfig: { labelNames: [], palette: [] },
        mapStats: {},
        extraDescription: "No data available for this area and date range.",
      };
    }

    image = collection.median();
  } else {
    image = ee.Image(datasetId);
  }

  // Check if the image contains bands
  const bandNames = (await evaluate(image.bandNames())) as any;
  if (!bandNames || bandNames.length === 0) {
    return {
      urlFormat: "",
      geojson: null,
      legendConfig: { labelNames: [], palette: [] },
      mapStats: {},
      extraDescription:
        "No bands available in this dataset for the selected area.",
    };
  }

  if (divideValue) {
    image = image.divide(divideValue);
  }

  const composite = image.clip(geometry);
  const { urlFormat } = (await getMapId(composite, visParams)) as any;
  const geojson = await evaluate(composite.geometry());
  let meanValue: number | null = null;
  await image.evaluate((res: any) => {
    const bands = Object.keys(res || {});
    if (bands.length && res[bands[0]] != null) {
      meanValue = res[bands[0]];
    }
  });
  const legendConfig = {
    labelNames: labelNames.length ? labelNames : ["Value"],
    palette: visParams?.palette || [],
    min: visParams?.min,
    max: visParams?.max,
  };

  const mapStats = { meanValue };
  return {
    urlFormat,
    geojson,
    legendConfig,
    mapStats,
    extraDescription: `Data loaded from ${datasetId} between ${startDate} and ${endDate}.`,
  };
}
