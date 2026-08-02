"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { OrderDetailPanel } from "@/components/OrderDetailPanel";
import { SettingsModal } from "@/components/SettingsModal";
import { UnauthorizedModal } from "@/components/UnauthorizedModal";
import { fetchWithToken } from "@/lib/tokenStorage";
import type { MapOrder } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map").then((m) => m.Map), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

export default function Home() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<MapOrder[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    fetchWithToken(`/api/orders?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json();

        if (res.status === 401) {
          setUnauthorized(true);
          setShowUnauthorizedModal(true);
          return;
        }
        setUnauthorized(false);

        if (!res.ok) throw new Error(body.error || "Failed to load orders");
        setOrders(body.orders);
        setTruncated(body.truncated);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <div className="flex h-dvh flex-col">
      <FilterBar
        status={status}
        search={search}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onRefresh={load}
        onOpenSettings={() => setSettingsOpen(true)}
        loading={loading}
        unauthorized={unauthorized}
      />
      <StatsBar orders={orders} truncated={truncated} />

      {error && (
        <div className="bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
      )}

      <div className="relative flex flex-1 flex-col">
        {loading && orders.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading orders...</div>
        ) : orders.length === 0 && !error ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            No orders match the current filters.
          </div>
        ) : (
          <Map orders={orders} onSelectOrder={setSelectedOrderId} />
        )}

        {selectedOrderId && (
          <OrderDetailPanel orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
        )}
      </div>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} onSaved={load} />}

      {showUnauthorizedModal && (
        <UnauthorizedModal
          onOpenSettings={() => {
            setShowUnauthorizedModal(false);
            setSettingsOpen(true);
          }}
          onDismiss={() => setShowUnauthorizedModal(false)}
        />
      )}
    </div>
  );
}
