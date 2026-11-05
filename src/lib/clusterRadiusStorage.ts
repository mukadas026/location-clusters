export const MIN_CLUSTER_RADIUS = 20;
export const MAX_CLUSTER_RADIUS = 150;
export const CLUSTER_RADIUS_STEP = 5;
export const DEFAULT_CLUSTER_RADIUS = 50;

const STORAGE_KEY = "moveet_cluster_radius";

export function getStoredClusterRadius(): number {
  if (typeof window === "undefined") return DEFAULT_CLUSTER_RADIUS;
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  if (!Number.isFinite(stored) || stored < MIN_CLUSTER_RADIUS || stored > MAX_CLUSTER_RADIUS) {
    return DEFAULT_CLUSTER_RADIUS;
  }
  return stored;
}

export function setStoredClusterRadius(radius: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(radius));
}
