"use client";

import { useState } from "react";
import { getStoredToken, setStoredToken } from "@/lib/tokenStorage";

export function SettingsModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [token, setToken] = useState(() => getStoredToken());

  function handleSave() {
    setStoredToken(token.trim());
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API token</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Overrides the server default for this browser only. Leave blank to fall back to the
          server-configured token.
        </p>
        <textarea
          className="mt-4 h-28 w-full resize-none rounded-md border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Paste the org token here..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
