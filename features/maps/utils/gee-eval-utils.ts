export function getMapId(image: any, vis: any) {
  return new Promise((resolve, reject) => {
    image.getMapId(vis, (obj: any, error: any) =>
      error ? reject(new Error(error)) : resolve(obj)
    );
  });
}

// Utility function to evaluate objects
export function evaluate(obj: any) {
  return new Promise((resolve, reject) =>
    obj.evaluate((result: any, error: any) =>
      error ? reject(new Error(error)) : resolve(result)
    )
  );
}
