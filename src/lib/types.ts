export const ORDER_STATUSES = [
  "pending",
  "assigned",
  "in-progress",
  "picked-up",
  "arrived",
  "delivered",
  "completed",
  "cancelled",
  "failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface RawPoint {
  type: "Point";
  address: string;
  coordinates: [number, number];
}

export interface RawRider {
  _id: string;
  vehicleType: string;
  status?: string;
  phone: string;
  name: string;
  plateNumber?: string;
}

export interface RawSmsLog {
  _id: string;
  phone: string;
  message: string;
  status: string;
  at: string;
}

export interface RawWebhookLog {
  _id: string;
  event: string;
  status: string;
  httpStatus: number;
  at: string;
}

export interface RawSubOrder {
  _id: string;
  destination: RawPoint;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  labelPrinted: boolean;
  trackingNo: string;
  receiver: string;
  receiverName: string;
  receiverAltName?: string | null;
  receiverAltPhone?: string;
  price: number;
  note?: string;
  confirmationCode: string;
  amountPaid: number;
  statusHistory: unknown[];
  trail: unknown[];
  logs: string[];
  createdAt: string;
  updatedAt: string;
  labelPrintedAt?: string;
  mainOrder: string;
  rider?: string;
}

export interface RawOrder {
  _id: string;
  dispatch: { round: number; acceptedBy: string | null; offeredTo: string[] };
  commission: { settled: boolean };
  isPackaged: boolean;
  status: string;
  packageType: string;
  packageSize: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryType: string;
  deliveryStatus: string;
  deliveryProofType: string;
  deliveryProofStatus: string;
  shipperOrg?: string;
  dispatchedOrg?: string;
  user: { _id: string; phone: string; name: string };
  orderType: string;
  orderNo: string;
  sender: string;
  senderName: string;
  externalClientId?: string;
  externalOrderId: string;
  deliveryDate: string;
  origin: RawPoint;
  subOrders: RawSubOrder[];
  logs: string[];
  smsLogs: RawSmsLog[];
  webhookLogs: RawWebhookLog[];
  createdAt: string;
  updatedAt: string;
  rider?: RawRider;
}

export interface OrdersListResponse {
  status: number;
  payload: {
    orders: RawOrder[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface OrderDetailResponse {
  status: number;
  payload: RawOrder;
}

/** [lat, lng] — normalized shape used everywhere on the frontend. */
export type LatLng = [number, number];

export interface MapSubOrder {
  _id: string;
  destination: LatLng | null;
  destinationAddress: string;
  status: string;
  trackingNo: string;
  receiver: string;
  receiverName: string;
  note?: string;
  price: number;
  confirmationCode: string;
}

/** Lean shape returned by /api/orders — enough for markers, popups, and stats. */
export interface MapOrder {
  _id: string;
  orderNo: string;
  status: string;
  deliveryType: string;
  deliveryDate: string;
  createdAt: string;
  senderName: string;
  origin: LatLng | null;
  originAddress: string;
  subOrders: MapSubOrder[];
}
