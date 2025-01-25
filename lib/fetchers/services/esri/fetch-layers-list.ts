export const fetchAgolLayersList = async () => {
  try {
    const response = await fetch("/api/services/esri/fetch-layers-list");
    if (!response.ok) {
      throw new Error("Failed to fetch services");
    }

    const serviceData = await response.json();

    const serviceDataResults = serviceData.results;

    if (!serviceDataResults || serviceDataResults.length === 0) {
      console.warn("No services found.");
      return [];
    }

    const filteredServiceDataResults = serviceDataResults.map(
      (service: any) => {
        return {
          name: service.title,
          type: service.type,
          url: service.url,
        };
      }
    );

    return filteredServiceDataResults;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};
