"use server";
import { answerQuery } from "@/app/actions/rag-actions";
import {
  calculateGeometryArea,
  checkGeometryAreaIsLessThanThreshold,
} from "@/features/maps/utils/geometry-utils";
import { azure } from "@ai-sdk/azure";
import { convertToCoreMessages, generateText } from "ai";
import { NextResponse } from "next/server";

export async function requestGeospatialAnalysis(args: any) {
  const {
    functionType,
    startDate1String,
    endDate1String,
    startDate2String,
    endDate2String,
    aggregationMethod,
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
    experimental,
  } = args;

  const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;
  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the analysis. you need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
    selectedRoiGeometryInChat?.geometry,
    maxArea
  );
  const areaSqKm = calculateGeometryArea(selectedRoiGeometryInChat?.geometry);
  if (!geometryAreaCheckResult) {
    return {
      error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
    };
  }

  const url = new URL(
    "/api/gee/request-geospatial-analysis",
    process.env.BASE_URL
  );

  const payload = {
    functionType,
    startDate1: startDate1String,
    endDate1: endDate1String,
    startDate2: startDate2String,
    endDate2: endDate2String,
    aggregationMethod,
    selectedRoiGeometry,
    experimental,
  };

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return NextResponse.json(
        { error: "Failed to run the analysis" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // This is not suitable for production, but it's a good way to check if the response is correct
    if (Object.keys(data.mapStats).length === 0) {
      return {
        error: "Something went wrong! Failed to run the analysis.",
      };
    }
    return {
      ...data,
      title,
      layerName,
      functionType,
      startDate1: startDate1String,
      endDate1: endDate1String,
      startDate2: startDate2String,
      endDate2: endDate2String,
      aggregationMethod,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return NextResponse.json(
      { error: "Failed to run the analysis" },
      { status: 500 }
    );
  }
}

export async function requestLoadingGeospatialData(args: any) {
  const {
    geospatialDataType,
    dataType,
    selectedRoiGeometryInChat,
    datasetId,
    layerName,
    title,
    startDate,
    endDate,
    divideValue,
    visParams,
    labelNames,
    cookieStore,
  } = args;

  const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI). You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  const url = new URL(
    "/api/gee/request-loading-geospatial-data",
    process.env.BASE_URL
  );

  const payload = {
    geospatialDataType,
    dataType,
    datasetId,
    startDate,
    endDate,
    divideValue,
    visParams,
    labelNames,
    selectedRoiGeometry,
  };

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error during fetch:", data.error || response.statusText);
      return {
        error:
          typeof data.error === "string"
            ? data.error
            : "Failed to load geospatial data",
      };
    }

    if (!data.urlFormat || Object.keys(data.mapStats).length === 0) {
      return {
        error: "Something went wrong! Failed to load geospatial data.",
      };
    }

    return {
      ...data,
      layerName,
      title,
      datasetId,
      startDate,
      endDate,
      geospatialDataType,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to load geospatial data.",
    };
  }
}

// Tool to request a RAG query
export async function requestRagQuery(args: any) {
  const { query, title } = args; // Extract query parameter from arguments

  try {
    const data = await answerQuery(query);

    return { data, title };
  } catch (error) {
    console.error("Error during RAG fetch:", error);
    return NextResponse.json({ error: "Failed to fetch RAG" }, { status: 500 });
  }
}

// Tool to generate a report based on the conversation history
export async function draftReport(args: any) {
  try {
    const { messages, title, reportFileName } = args;

    const relevantMessages = messages.filter(
      (msg: any) =>
        msg.role === "user" ||
        (msg.role === "assistant" &&
          !msg.content.startsWith("You are an AI Assistant"))
    );

    // Create a prompt that focuses on synthesizing the existing conversation
    const reportPrompt = {
      role: "user",
      content: `Please draft a comprehensive report based on our previous conversation and analyses. The report should NOT inlcude your own comments. 
            Format it with the following structure:
            - Introduction: Brief context and purpose
            - Analyses Performed: Summary of conducted analyses
            - Key Findings: Important results, patterns, and trends
            - Limitations and Caveats: Important constraints
            - Recommendations & Next Steps: Future suggestions."`,
    };

    // Use all relevant conversation history plus the report request
    const conversationContext = [...relevantMessages, reportPrompt];

    const reportResponse = await generateText({
      model: azure("gpt-4o"),
      messages: convertToCoreMessages(conversationContext),
      tools: {}, // Empty tools object since we don't need tools for report generation
    });

    // For simplicity here, assume it's resolved into a single string once complete.
    const report = await reportResponse.text;

    return {
      report,
      title,
      reportFileName,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to draft report" },
      { status: 500 }
    );
  }
}

export async function requestWebScraping(args: any) {
  const { url, title } = args;

  try {
    const baseUrl = process.env.BASE_URL;

    const response = await fetch(
      new URL(
        `/api/web-scraper?url=${encodeURIComponent(url)}`,
        baseUrl
      ).toString()
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      return { error: "Failed to scrape the webpage" };
    }
  } catch (error) {
    console.error("Error during fetch:", error);
    return { error: "Failed to scrape the webpage" };
  }
}
