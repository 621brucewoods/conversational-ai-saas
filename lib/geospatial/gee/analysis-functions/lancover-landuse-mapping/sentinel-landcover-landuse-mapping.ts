// This is an example of how to invoke a Google Cloud Run function.
// The Cloud Run function contains the JavaScript code that invokes a Vertex AI deep-leanring model to perform landcover landuse mapping using Sentinel-2 data in Google Eearth Egnine.

"use server";
import { getIdentityTokenGoogle } from "@/features/maps/utils/authentication-utils/gee-auth";
import { convertEeGeometryToGeoJSON } from "@/features/maps/utils/geometry-utils";
import { createClient } from "@/utils/supabase/server";
export const sentinelLandcoverLanduseMapping = async (
  geometry: any,
  startDate: any,
  endDate: any
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Unauthenticated!");
  }

  try {
    const url = `${process.env.GEE_CLOUD_RUN_URL}/lulc_mapping`;
    const token = await getIdentityTokenGoogle(url);

    const jsonGeometry = convertEeGeometryToGeoJSON(geometry);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        geometry: jsonGeometry,
        startDate,
        endDate,
        aggregationMethod: "Median", // Median here means the aggregation method for the image collection not the resulting land-cover map
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `Cloud Run request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error calling Cloud Run function:", error);
    throw error;
  }
};
