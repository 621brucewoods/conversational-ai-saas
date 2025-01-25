export const handleArcGISAuth = () => {
  const authorizationUrl = `/api/auth/esri/authorize`;

  try {
    window.open(
      authorizationUrl,
      "ArcGIS Auth",
      "width=600,height=500,left=200,top=200"
    );
  } catch (error) {
    console.error("Failed to open ArcGIS Auth window:", error);
  }
};
