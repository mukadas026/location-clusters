"use client";

import { useEffect, useState } from "react";
import { fetchWithToken } from "@/lib/tokenStorage";
import type { RawOrder } from "@/lib/types";
import { STATUS_LABELS } from "./FilterBar";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="ml-2 rounded border border-zinc-300 px-1.5 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function OrderDetailPanel({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [order, setOrder] = useState<RawOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOrder(null);
    setError(null);

    fetchWithToken(`/api/orders/${orderId}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load order");
        if (!cancelled) setOrder(body.order);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="absolute inset-y-0 right-0 z-[1100] w-full max-w-sm overflow-y-auto border-l border-zinc-200 bg-white p-5 shadow-xl sm:max-w-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Order detail</h2>
        <button
          className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}
      {!order && !error && <div className="text-sm text-zinc-500">Loading...</div>}

      {order && (
        <div className="space-y-6 text-sm">
          <section>
            <div className="text-xs uppercase tracking-wide text-zinc-400">Order</div>
            <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{order.orderNo}</div>
            <div className="text-zinc-600 dark:text-zinc-400">
              {STATUS_LABELS[order.status] ?? order.status} &middot; {order.deliveryType} &middot;{" "}
              {new Date(order.deliveryDate).toLocaleDateString()}
            </div>
            <div className="mt-1 text-zinc-600 dark:text-zinc-400">
              From <span className="font-medium">{order.senderName}</span> &middot; {order.origin.address}
            </div>
          </section>

          {order.rider && (
            <section>
              <div className="text-xs uppercase tracking-wide text-zinc-400">Rider</div>
              <div className="mt-1 text-zinc-800 dark:text-zinc-200">
                {order.rider.name} &middot; {order.rider.vehicleType}
                {order.rider.plateNumber ? ` (${order.rider.plateNumber})` : ""}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">{order.rider.phone}</div>
            </section>
          )}

          <section>
            <div className="text-xs uppercase tracking-wide text-zinc-400">Sub-orders</div>
            <div className="mt-2 space-y-3">
              {order.subOrders.map((sub) => (
                <div key={sub._id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{sub.receiverName}</span>
                    <span className="text-xs text-zinc-500">{STATUS_LABELS[sub.status] ?? sub.status}</span>
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400">{sub.destination.address}</div>
                  {sub.note && <div className="italic text-zinc-500">{sub.note}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <span>
                      Tracking {sub.trackingNo}
                      <CopyButton value={sub.trackingNo} />
                    </span>
                    <span>
                      Code {sub.confirmationCode}
                      <CopyButton value={sub.confirmationCode} />
                    </span>
                    <span>GHS {sub.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {order.logs.length > 0 && (
            <section>
              <div className="text-xs uppercase tracking-wide text-zinc-400">Activity log</div>
              <ul className="mt-2 space-y-1.5 text-zinc-700 dark:text-zinc-300">
                {order.logs.map((log, i) => (
                  <li key={i} className="border-l-2 border-zinc-200 pl-2 dark:border-zinc-800">
                    {log}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {order.smsLogs.length > 0 && (
            <section>
              <div className="text-xs uppercase tracking-wide text-zinc-400">SMS history</div>
              <ul className="mt-2 space-y-2">
                {order.smsLogs.map((sms) => (
                  <li key={sms._id} className="text-zinc-700 dark:text-zinc-300">
                    <div className="text-xs text-zinc-400">{new Date(sms.at).toLocaleString()}</div>
                    {sms.message}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {order.webhookLogs.length > 0 && (
            <section>
              <div className="text-xs uppercase tracking-wide text-zinc-400">Webhook history</div>
              <ul className="mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
                {order.webhookLogs.map((hook) => (
                  <li key={hook._id} className="flex justify-between text-xs">
                    <span>{hook.event}</span>
                    <span className="text-zinc-400">
                      {hook.httpStatus} &middot; {new Date(hook.at).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
