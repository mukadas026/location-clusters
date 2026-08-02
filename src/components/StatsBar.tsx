"use client";

import { useMemo, useState } from "react";
import type { MapOrder } from "@/lib/types";
import { STATUS_LABELS } from "./FilterBar";

export function StatsBar({ orders, truncated }: { orders: MapOrder[]; truncated: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(() => {
    const byStatus = new Map<string, number>();
    for (const order of orders) {
      byStatus.set(order.status, (byStatus.get(order.status) || 0) + 1);
    }
    return byStatus;
  }, [orders]);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-2.5 py-1 font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
        onClick={() => setExpanded((v) => !v)}
      >
        {orders.length} orders
        <span className="text-xs">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <>
          {[...counts.entries()].map(([status, count]) => (
            <span
              key={status}
              className="rounded-md border border-zinc-300 px-2.5 py-1 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              {STATUS_LABELS[status] ?? status}: {count}
            </span>
          ))}
          {truncated && (
            <span className="rounded-md bg-amber-100 px-2.5 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Showing a capped subset — narrow filters for the full set
            </span>
          )}
        </>
      )}
    </div>
  );
}
