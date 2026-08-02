"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { STATUS_LABELS } from "./FilterBar";
import type { MapOrder } from "@/lib/types";
import { statusColor, STATUS_COLORS } from "@/lib/statusColors";

const GHANA_CENTER: [number, number] = [7.9465, -1.0232];

function divIcon(color: string, shape: "square" | "circle") {
  const radius = shape === "circle" ? "50%" : "3px";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:${radius};background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function myLocationIcon() {
  return L.divIcon({
    className: "",
    html: `<span style="position:relative;display:block;width:18px;height:18px;">
      <span style="position:absolute;inset:-5px;border-radius:50%;background:rgba(37,99,235,0.25);"></span>
      <span style="position:absolute;inset:0;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></span>
    </span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

interface MapProps {
  orders: MapOrder[];
  onSelectOrder: (id: string) => void;
}

export function Map({ orders, onSelectOrder }: MapProps) {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {
        // permission denied or unavailable — just skip the marker
      }
    );
  }, []);

  return (
    <div className="relative flex-1">
      <MapContainer center={GHANA_CENTER} zoom={7} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {myLocation && (
          <Marker position={myLocation} icon={myLocationIcon()}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        <MarkerClusterGroup maxClusterRadius={50} chunkedLoading>
          {orders
            .filter((o) => o.origin)
            .map((order) => (
              <Marker
                key={`origin-${order._id}`}
                position={order.origin as [number, number]}
                icon={divIcon(statusColor(order.status), "square")}
                eventHandlers={{ click: () => onSelectOrder(order._id) }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{order.senderName}</div>
                    <div className="text-zinc-600">{order.originAddress}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Order {order.orderNo.slice(0, 8)} &middot; {STATUS_LABELS[order.status] ?? order.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        <MarkerClusterGroup maxClusterRadius={50} chunkedLoading>
          {orders.flatMap((order) =>
            order.subOrders
              .filter((sub) => sub.destination)
              .map((sub) => (
                <Marker
                  key={`dest-${sub._id}`}
                  position={sub.destination as [number, number]}
                  icon={divIcon(statusColor(sub.status), "circle")}
                  eventHandlers={{ click: () => onSelectOrder(order._id) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{sub.receiverName}</div>
                      <div className="text-zinc-600">{sub.destinationAddress}</div>
                      {sub.note && <div className="text-zinc-500 italic">{sub.note}</div>}
                      <div className="mt-1 text-xs text-zinc-500">
                        Tracking {sub.trackingNo} &middot; {STATUS_LABELS[sub.status] ?? sub.status} &middot; GHS{" "}
                        {sub.price}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))
          )}
        </MarkerClusterGroup>
      </MapContainer>

      <Legend />
    </div>
  );
}

function Legend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-3 left-3 z-[1000] max-w-[calc(100vw-1.5rem)] rounded-md bg-white/95 p-2.5 text-xs shadow-md sm:bottom-4 sm:left-4 sm:p-3 dark:bg-zinc-900/95">
      <button
        className="flex w-full items-center justify-between gap-4 font-semibold text-zinc-700 dark:text-zinc-200"
        onClick={() => setExpanded((v) => !v)}
      >
        Status
        <span>{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                {STATUS_LABELS[status] ?? status}
              </div>
            ))}
          </div>
          <div className="mt-2 border-t border-zinc-200 pt-1.5 text-[11px] text-zinc-500 dark:border-zinc-700">
            Square = origin &middot; Circle = destination
          </div>
        </>
      )}
    </div>
  );
}
