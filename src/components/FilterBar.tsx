"use client";

import { useState } from "react";
import { ORDER_STATUSES } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  "in-progress": "In Progress",
  "picked-up": "Picked Up",
  arrived: "Arrived",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};

interface FilterBarProps {
  statuses: string[];
  search: string;
  onStatusesChange: (statuses: string[]) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  loading: boolean;
  unauthorized?: boolean;
}

export function FilterBar({
  statuses,
  search,
  onStatusesChange,
  onSearchChange,
  onRefresh,
  onOpenSettings,
  loading,
  unauthorized,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const statusFilterActive = statuses.length !== ORDER_STATUSES.length;
  const activeCount = (statusFilterActive ? 1 : 0) + (search ? 1 : 0);

  function toggleStatus(s: string) {
    onStatusesChange(statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s]);
  }

  return (
    <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <button
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={() => setExpanded((v) => !v)}
        >
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-zinc-900 px-1.5 text-xs text-white dark:bg-zinc-50 dark:text-zinc-900">
              {activeCount}
            </span>
          )}
          <span className="text-xs">{expanded ? "▾" : "▸"}</span>
        </button>

        <div className="flex-1" />

        {unauthorized && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            Unauthorized — token expired
          </span>
        )}

        <button
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        <button
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={onOpenSettings}
        >
          Settings
        </button>
      </div>

      {expanded && (
        <div className="flex flex-wrap items-start gap-4 border-t border-zinc-200 px-3 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-800">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs text-zinc-500">
              <span>Status</span>
              <button className="underline hover:text-zinc-700 dark:hover:text-zinc-300" onClick={() => onStatusesChange(ORDER_STATUSES.slice())}>
                All
              </button>
              <button className="underline hover:text-zinc-700 dark:hover:text-zinc-300" onClick={() => onStatusesChange([])}>
                None
              </button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {ORDER_STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={statuses.includes(s)} onChange={() => toggleStatus(s)} />
                  {STATUS_LABELS[s]}
                </label>
              ))}
            </div>
          </div>

          <input
            type="search"
            className="min-w-0 flex-1 basis-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none sm:basis-[220px] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Search order no, tracking no, name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export { STATUS_LABELS };
