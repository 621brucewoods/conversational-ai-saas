import proj4 from "proj4";
//@ts-ignore
import { reproject } from "reproject";
//@ts-ignore
import epsg from "epsg";
import shp from "shpjs";
import JSZip from "jszip";
import { booleanValid } from "@turf/turf";

export async function dragAndDropFileAnalyzer(file: File): Promise<any> {
  const extension = file.name?.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new Error("Invalid file: Unable to determine file extension.");
  }

  let geojson: any;

  switch (extension) {
    case "geojson":
    case "json": {
      try {
        const parsed = JSON.parse(await file.text());

        if (
          !parsed.features ||
          !Array.isArray(parsed.features) ||
          !parsed.features.every((feature: any) =>
            booleanValid(feature.geometry)
          )
        ) {
          throw new Error("Invalid GeoJSON format or geometry.");
        }

        geojson = parsed;
        return { type: "geojson", content: geojson };
      } catch (error) {
        throw new Error(`Failed to parse GeoJSON file: ${error}`);
      }
    }

    case "zip": {
      try {
        const zip = await JSZip.loadAsync(file);
        const entries = Object.keys(zip.files);

        // Check for required Shapefile components
        const requiredFiles = [".shp", ".dbf", ".shx"];
        const missingFiles = requiredFiles.filter(
          (ext) => !entries.some((entry) => entry.endsWith(ext))
        );

        if (missingFiles.length > 0) {
          throw new Error(
            `Missing required Shapefile components: ${missingFiles.join(", ")}`
          );
        }

        // Check for optional PRJ file
        const prjFile = entries.find((entry) => entry.endsWith(".prj"));
        if (!prjFile) {
          console.warn(
            "Projection file (.prj) is missing. Defaulting to WGS84."
          );
        }

        // Parse the shapefile
        geojson = await shp(await file.arrayBuffer());

        // Reproject GeoJSON/Shapefile to WGS84
        const fromProj = geojson?.crs?.properties?.name || "EPSG:4326"; // Default to WGS84
        geojson = reproject(geojson, fromProj, "EPSG:4326", proj4, epsg);

        return { type: "shapefile", content: geojson }; // Return as "shapefile"
      } catch (error) {
        throw new Error(
          `Failed to parse zipped Shapefile: ${error}. Ensure it includes SHP, DBF, SHX, and optionally PRJ files.`
        );
      }
    }

    default: {
      throw new Error(
        `Unsupported file format: ${extension}. Supported formats are: GeoJSON and zipped Shapefiles.`
      );
    }
  }
}
