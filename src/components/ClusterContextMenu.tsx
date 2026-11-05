"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { findCluster, type ClusterLike, type ClusterRegistry } from "@/lib/clusterIcon";
import {
  buildCsv,
  csvFilename,
  downloadCsv,
  toExportRows,
  type ClusterKind,
  type ClusterMarkerMeta,
  type ExportRow,
} from "@/lib/clusterExport";

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE_PX = 10;
const CLICK_SUPPRESS_MS = 400;
const MENU_WIDTH = 176;
const MENU_HEIGHT = 84;

interface MenuState {
  x: number;
  y: number;
  kind: ClusterKind;
  rows: ExportRow[];
}

function menuStateFor(cluster: ClusterLike, x: number, y: number): MenuState | null {
  const metas = cluster
    .getAllChildMarkers()
    .map((marker) => marker.options.meta)
    .filter((meta): meta is ClusterMarkerMeta => Boolean(meta));
  if (metas.length === 0) return null;

  return { x, y, kind: metas[0].kind, rows: toExportRows(metas) };
}

export function ClusterContextMenu({ registry }: { registry: ClusterRegistry }) {
  const map = useMap();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = map.getContainer();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let origin = { x: 0, y: 0 };
    let longPressFired = false;
    let suppressClickUntil = 0;

    const cancelTimer = () => {
      clearTimeout(timer);
      timer = undefined;
    };

    const openFor = (target: EventTarget | null, x: number, y: number) => {
      const cluster = findCluster(registry, target);
      if (!cluster) return false;
      const state = menuStateFor(cluster, x, y);
      if (state) setMenu(state);
      return true;
    };

    const onContextMenu = (e: MouseEvent) => {
      if (openFor(e.target, e.clientX, e.clientY)) e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !findCluster(registry, e.target)) return;
      origin = { x: e.clientX, y: e.clientY };
      longPressFired = false;
      const target = e.target;
      timer = setTimeout(() => {
        longPressFired = openFor(target, origin.x, origin.y);
      }, LONG_PRESS_MS);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (timer === undefined) return;
      if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > MOVE_TOLERANCE_PX) cancelTimer();
    };

    const onPointerEnd = () => {
      cancelTimer();
      if (longPressFired) suppressClickUntil = Date.now() + CLICK_SUPPRESS_MS;
      longPressFired = false;
    };

    // Capture phase, so the click is stopped before Leaflet's cluster zoom handler sees it.
    const onClickCapture = (e: MouseEvent) => {
      if (Date.now() < suppressClickUntil) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    container.addEventListener("contextmenu", onContextMenu);
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerEnd);
    container.addEventListener("pointercancel", onPointerEnd);
    container.addEventListener("click", onClickCapture, true);

    return () => {
      cancelTimer();
      container.removeEventListener("contextmenu", onContextMenu);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerEnd);
      container.removeEventListener("pointercancel", onPointerEnd);
      container.removeEventListener("click", onClickCapture, true);
    };
  }, [map, registry]);

  useEffect(() => {
    if (!menu) return;

    const close = () => setMenu(null);
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    map.on("movestart zoomstart", close);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      map.off("movestart zoomstart", close);
    };
  }, [map, menu]);

  if (!menu) return null;

  const download = () => {
    downloadCsv(csvFilename(menu.kind), buildCsv(menu.rows));
    setMenu(null);
  };

  const count = menu.rows.length;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[2000] rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/10 dark:bg-zinc-900 dark:ring-white/10"
      style={{
        width: MENU_WIDTH,
        left: Math.max(4, Math.min(menu.x, window.innerWidth - MENU_WIDTH - 4)),
        top: Math.max(4, Math.min(menu.y, window.innerHeight - MENU_HEIGHT - 4)),
      }}
    >
      <div className="px-3 py-1.5 text-xs text-zinc-500">
        {count} sub-order{count === 1 ? "" : "s"}
      </div>
      <button
        role="menuitem"
        className="w-full rounded px-3 py-2 text-left text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
        onClick={download}
      >
        Download CSV
      </button>
    </div>,
    document.body
  );
}
