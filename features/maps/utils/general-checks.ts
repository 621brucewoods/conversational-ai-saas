export const checkLayerName = (layerName: string, existingNames: string[]) => {
  let uniqueLayerName = layerName;
  let counter = 1;

  while (existingNames.includes(uniqueLayerName)) {
    uniqueLayerName = `${layerName} (${counter})`;
    counter++;
  }

  return uniqueLayerName;
};
