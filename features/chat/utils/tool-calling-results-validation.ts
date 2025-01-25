interface GeospatialAnalysisResult {
  functionType?: string; // Optional properties to match ToolCallingMessageResults
  layerName?: string;
  legendConfig?: string;
  urlFormat?: string;
  mapStats?: any;
  uhiMetrics?: any;
}

interface ToolCallingMessageResults {
  geospatialAnalysis?: GeospatialAnalysisResult;
  citationSources?: Source[];
  draftedReport?: string;
  toolCallTitle?: string;
  reportFileName?: string;
}

export function validateToolCallingResults(
  messageResults: ToolCallingMessageResults
): Record<string, boolean> {
  const validationResults: Record<string, boolean> = {};

  // Validate geospatialAnalysis
  if (messageResults.geospatialAnalysis) {
    const { functionType, layerName, legendConfig, urlFormat } =
      messageResults.geospatialAnalysis;
    validationResults.geospatialAnalysis =
      !!functionType && !!layerName && !!legendConfig && !!urlFormat;
  } else {
    validationResults.geospatialAnalysis = false;
  }

  // Validate citationSources
  if (messageResults.citationSources) {
    validationResults.citationSources = Array.isArray(
      messageResults.citationSources
    );
  } else {
    validationResults.citationSources = false;
  }

  // Validate draftedReport
  if (messageResults.draftedReport) {
    validationResults.draftedReport =
      !!messageResults.draftedReport && !!messageResults.reportFileName; // Report file name must exist too
  } else {
    validationResults.draftedReport = false;
  }

  return validationResults;
}
