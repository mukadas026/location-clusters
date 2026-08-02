import type { LatLng, RawPoint } from "./types";

// Generous bounding box around Ghana (with margin) — filters out [0,0]
// placeholders and other clearly-wrong values without being overly strict.
const GHANA_LAT_RANGE: [number, number] = [3, 12];
const GHANA_LNG_RANGE: [number, number] = [-4, 2];

/**
 * Source data stores `coordinates` as [lat, lng] despite the GeoJSON
 * `type: "Point"` wrapper implying [lng, lat] — confirmed against real
 * destination data (e.g. Tamale-area orders resolve to ~9.4N, ~0.84W).
 * Returns null for missing/placeholder/out-of-range points so callers can
 * skip them rather than plotting a bad marker.
 */
export function normalizeCoords(point: RawPoint | null | undefined): LatLng | null {
  if (!point || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    return null;
  }

  const [lat, lng] = point.coordinates;

  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  if (lat < GHANA_LAT_RANGE[0] || lat > GHANA_LAT_RANGE[1]) return null;
  if (lng < GHANA_LNG_RANGE[0] || lng > GHANA_LNG_RANGE[1]) return null;

  return [lat, lng];
}
