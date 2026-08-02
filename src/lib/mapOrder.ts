import { normalizeCoords } from "./normalizeCoords";
import type { MapOrder, MapSubOrder, RawOrder } from "./types";

export function toMapOrder(raw: RawOrder): MapOrder {
  const subOrders: MapSubOrder[] = raw.subOrders.map((sub) => ({
    _id: sub._id,
    destination: normalizeCoords(sub.destination),
    destinationAddress: sub.destination?.address ?? "",
    status: sub.status,
    trackingNo: sub.trackingNo,
    receiver: sub.receiver,
    receiverName: sub.receiverName,
    note: sub.note,
    price: sub.price,
    confirmationCode: sub.confirmationCode,
  }));

  return {
    _id: raw._id,
    orderNo: raw.orderNo,
    status: raw.status,
    deliveryType: raw.deliveryType,
    deliveryDate: raw.deliveryDate,
    createdAt: raw.createdAt,
    senderName: raw.senderName,
    origin: normalizeCoords(raw.origin),
    originAddress: raw.origin?.address ?? "",
    subOrders,
  };
}
