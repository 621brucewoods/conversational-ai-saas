function stringifyNested(value: any): string {
  if (value == null) {
    return "No data available";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  const copy = { ...value };

  if (
    Array.isArray(copy.monoTemporalQueryValues) &&
    copy.monoTemporalQueryValues.length === 0
  ) {
    delete copy.monoTemporalQueryValues;
  }

  if (
    Array.isArray(copy.timeSeriesQueryValues) &&
    copy.timeSeriesQueryValues.length === 0
  ) {
    delete copy.timeSeriesQueryValues;
  }

  if (Object.keys(copy).length === 0) {
    return "No data available";
  }

  return JSON.stringify(copy, null, 2);
}

export function formatQueryForTable(query: any): string {
  return stringifyNested(query);
}
