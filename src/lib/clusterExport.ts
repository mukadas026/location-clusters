import type { MapOrder, MapSubOrder } from "./types";

export type ClusterKind = "origin" | "destination";

export type ClusterMarkerMeta =
  | { kind: "origin"; order: MapOrder }
  | { kind: "destination"; order: MapOrder; sub: MapSubOrder };

declare module "leaflet" {
  interface MarkerOptions {
    meta?: ClusterMarkerMeta;
  }
}

export interface ExportRow {
  order: MapOrder;
  sub: MapSubOrder;
}

type Cell = string | number | null | undefined;

const COLUMNS: { header: string; value: (row: ExportRow) => Cell }[] = [
  { header: "Order No", value: ({ order }) => order.orderNo },
  { header: "Tracking No", value: ({ sub }) => sub.trackingNo },
  { header: "Status", value: ({ sub }) => sub.status },
  { header: "Receiver Name", value: ({ sub }) => sub.receiverName },
  { header: "Receiver Phone", value: ({ sub }) => sub.receiver },
  { header: "Destination Address", value: ({ sub }) => sub.destinationAddress },
  { header: "Destination Lat", value: ({ sub }) => sub.destination?.[0] },
  { header: "Destination Lng", value: ({ sub }) => sub.destination?.[1] },
  { header: "Sender Name", value: ({ order }) => order.senderName },
  { header: "Origin Address", value: ({ order }) => order.originAddress },
  { header: "Price", value: ({ sub }) => sub.price },
  { header: "Note", value: ({ sub }) => sub.note },
];

const NUMERIC_LIKE = /^[+-]?[\d\s.]+$/;
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(cell: Cell): string {
  if (cell === null || cell === undefined) return "";
  let text = String(cell);

  // Stop spreadsheet apps from evaluating user-supplied text (names, notes) as formulas.
  if (typeof cell === "string" && FORMULA_PREFIX.test(text) && !NUMERIC_LIKE.test(text)) {
    text = `'${text}`;
  }

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toExportRows(metas: ClusterMarkerMeta[]): ExportRow[] {
  return metas.flatMap((meta) =>
    meta.kind === "origin" ? meta.order.subOrders.map((sub) => ({ order: meta.order, sub })) : [meta]
  );
}

export function buildCsv(rows: ExportRow[]): string {
  const lines = [COLUMNS.map((c) => c.header), ...rows.map((row) => COLUMNS.map((c) => c.value(row)))];
  return lines.map((line) => line.map(escapeCell).join(",")).join("\r\n");
}

export function csvFilename(kind: ClusterKind, now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `${kind}-cluster-${date}-${pad(now.getHours())}${pad(now.getMinutes())}.csv`;
}

export function downloadCsv(filename: string, csv: string) {
  // The BOM makes Excel read the file as UTF-8.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
