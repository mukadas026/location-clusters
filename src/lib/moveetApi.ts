import type { OrderDetailResponse, OrdersListResponse, RawOrder } from "./types";

const DEFAULT_BASE_URL = "https://api.moveet.delivery";
const PAGE_SIZE = 100;
const MAX_ORDERS = 2000;

function baseUrl() {
  return process.env.MOVEET_API_BASE_URL || DEFAULT_BASE_URL;
}

function upstreamHeaders(token: string) {
  return {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://admin.moveet.delivery",
    referer: "https://admin.moveet.delivery/",
    token,
  };
}

export class MoveetApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "MoveetApiError";
  }
}

async function upstreamFetch(path: string, token: string) {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: upstreamHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new MoveetApiError(`Upstream request failed: ${res.status} ${res.statusText}`, res.status);
  }

  return res.json();
}

export interface OrdersFilter {
  status?: string;
  search?: string;
}

async function fetchOrdersPage(filter: OrdersFilter, page: number, token: string): Promise<OrdersListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (filter.status) params.set("status", filter.status);
  if (filter.search) params.set("search", filter.search);

  return upstreamFetch(`/api/org/orders?${params.toString()}`, token);
}

/** Loops upstream pages until all matching orders are collected or MAX_ORDERS is hit. */
export async function fetchAllOrders(
  filter: OrdersFilter,
  token: string
): Promise<{ orders: RawOrder[]; truncated: boolean }> {
  const orders: RawOrder[] = [];
  let page = 1;
  let total = Infinity;

  while (orders.length < total && orders.length < MAX_ORDERS) {
    const { payload } = await fetchOrdersPage(filter, page, token);
    orders.push(...payload.orders);
    total = payload.total;

    if (payload.orders.length === 0) break;
    page += 1;
  }

  return { orders, truncated: orders.length < total };
}

export async function fetchOrderById(id: string, token: string): Promise<RawOrder> {
  const { payload } = (await upstreamFetch(`/api/org/orders/${id}`, token)) as OrderDetailResponse;
  return payload;
}
