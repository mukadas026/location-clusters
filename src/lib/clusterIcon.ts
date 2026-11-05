import L from "leaflet";

export interface ClusterLike {
  getAllChildMarkers(): L.Marker[];
  getChildCount(): number;
}

export type ClusterRegistry = Map<number, WeakRef<ClusterLike>>;

export const CLUSTER_ID_ATTR = "data-cluster-id";

const PRUNE_THRESHOLD = 1000;

function prune(registry: ClusterRegistry) {
  for (const [id, ref] of registry) {
    if (!ref.deref()) registry.delete(id);
  }
}

/**
 * Same markup as markercluster's default icon, plus a data attribute that lets DOM events on the
 * icon be traced back to the cluster layer (Leaflet gives no other way to do that).
 */
export function createClusterIconFactory(registry: ClusterRegistry) {
  return (cluster: ClusterLike) => {
    const id = L.stamp(cluster);
    registry.set(id, new WeakRef(cluster));
    if (registry.size > PRUNE_THRESHOLD) prune(registry);

    const count = cluster.getChildCount();
    const size = count < 10 ? "small" : count < 100 ? "medium" : "large";

    return L.divIcon({
      html: `<div ${CLUSTER_ID_ATTR}="${id}"><span>${count}</span></div>`,
      className: `marker-cluster marker-cluster-${size}`,
      iconSize: L.point(40, 40),
    });
  };
}

export function findCluster(registry: ClusterRegistry, target: EventTarget | null): ClusterLike | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest(`[${CLUSTER_ID_ATTR}]`);
  if (!el) return null;
  return registry.get(Number(el.getAttribute(CLUSTER_ID_ATTR)))?.deref() ?? null;
}
