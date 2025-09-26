
export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API;

export function buildApiUrl(path) {
  const normalizedBase = BACKEND_API_URL.replace(/\/$/, "");
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}