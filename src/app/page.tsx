"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { OrderDetailPanel } from "@/components/OrderDetailPanel";
import { clearStoredToken, fetchWithToken, getSession } from "@/lib/tokenStorage";
import type { MapOrder } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map").then((m) => m.Map), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

export default function Home() {
  const router = useRouter();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<string[]>(["assigned"]);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<MapOrder[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetchWithToken(`/api/orders?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json();

        if (res.status === 401) return;

        if (!res.ok) throw new Error(body.error || "Failed to load orders");
        setOrders(body.orders);
        setTruncated(body.truncated);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const session = getSession();
    if (session) setOrgName(session.orgName);
    else router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (orgName === null) return;
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load, orgName]);

  function logout() {
    clearStoredToken();
    router.replace("/login");
  }

  // Status is filtered client-side (multi-select) — no refetch needed when it changes.
  const filteredOrders = useMemo(
    () => orders.filter((order) => statuses.includes(order.status)),
    [orders, statuses]
  );

  if (orgName === null) return null;

  return (
    <div className="flex h-dvh flex-col">
      <FilterBar
        statuses={statuses}
        search={search}
        onStatusesChange={setStatuses}
        onSearchChange={setSearch}
        onRefresh={load}
        onLogout={logout}
        orgName={orgName}
        loading={loading}
      />
      <StatsBar orders={filteredOrders} truncated={truncated} />

      {error && (
        <div className="bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
      )}

      <div className="relative flex flex-1 flex-col">
        {loading && orders.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading orders...</div>
        ) : filteredOrders.length === 0 && !error ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            No orders match the current filters.
          </div>
        ) : (
          <Map orders={filteredOrders} onSelectOrder={setSelectedOrderId} />
        )}

        {selectedOrderId && (
          <OrderDetailPanel orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
        )}
      </div>
    </div>
  );
}
