"use client";

export function UnauthorizedModal({
  onOpenSettings,
  onDismiss,
}: {
  onOpenSettings: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Unauthorized</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          The Moveet API rejected the request — the token is likely expired or invalid. Update it in
          Settings to keep loading orders.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={onOpenSettings}
          >
            Update token
          </button>
        </div>
      </div>
    </div>
  );
}
