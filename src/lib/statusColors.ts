export const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  "in-progress": "#6366f1",
  "picked-up": "#8b5cf6",
  arrived: "#14b8a6",
  delivered: "#22c55e",
  completed: "#16a34a",
  cancelled: "#ef4444",
  failed: "#dc2626",
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#71717a";
}
