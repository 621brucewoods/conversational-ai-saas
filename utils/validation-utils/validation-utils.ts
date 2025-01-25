import validator from "validator";

export function isValidUrl(url: string): boolean {
  return validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
  });
}

export function sanitizeUrl(url: string): string {
  return validator.escape(url); // Escape potentially harmful characters
}

export function isValidLayerName(name: string): boolean {
  return validator.matches(name, /^[a-zA-Z0-9_-]+$/);
}

export function sanitizeLayerName(name: string): string {
  return validator.escape(name); // Escape potentially harmful characters
}

export function validateAndSanitizeUrl(url: string): string | null {
  if (!isValidUrl(url)) {
    console.warn("Invalid URL:", url);
    return null;
  }
  return sanitizeUrl(url);
}

export function validateAndSanitizeLayerName(name: string): string | null {
  if (!isValidLayerName(name)) {
    console.warn("Invalid layer name:", name);
    return null;
  }
  return sanitizeLayerName(name);
}
