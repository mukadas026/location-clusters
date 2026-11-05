# Cluster CSV export

Right-click (desktop) or long-press (touch) a map cluster to download its sub-orders as CSV. Click-to-zoom is unchanged.

## Decisions
- **Trigger:** `contextmenu` on desktop. Touch uses a custom ~500ms `pointerdown` timer (cancelled on >10px move), since iOS never fires `contextmenu` on long-press. The click after a long-press is swallowed in the capture phase so the cluster doesn't zoom.
- **Scope:** clusters only. Single markers still open the detail panel.
- **Menu:** floating at the pointer, shows "N sub-orders" and a Download CSV action. Closes on outside click, Escape, or map move/zoom.
- **Origin clusters** export all sub-orders of the clustered orders; destination clusters export their own sub-orders. Same row shape.
- **Columns:** order no, tracking no, status, receiver name, receiver phone, destination address, lat, lng, sender name, origin address, price, note. Confirmation code is deliberately excluded (delivery secret).
- **Phone:** `MapSubOrder.receiver` is already the receiver's phone number; no API change.
- **File:** UTF-8 with BOM (Excel), named `{origin|destination}-cluster-YYYY-MM-DD-HHmm.csv`. Text cells starting with `= + - @` are prefixed with `'` to avoid formula injection.
- **Filtering:** export respects the active status filter, since markers come from `filteredOrders`.

## How it works
- Markers carry `meta` (`order`, and `sub` for destinations) via a `MarkerOptions` augmentation in `src/lib/clusterExport.ts`.
- `src/lib/clusterIcon.ts` replicates the default cluster icon and adds `data-cluster-id` (from `L.stamp`), so DOM events map back to the cluster layer through a `WeakRef` registry.
- `src/components/ClusterContextMenu.tsx` listens on the map container and renders the menu in a portal.
