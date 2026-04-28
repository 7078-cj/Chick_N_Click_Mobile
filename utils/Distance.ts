export function Distance(lat: number, lng: number) {
  const origin_lat = 14.958753194320153;
  const origin_lng = 120.75846924744896;

  const latFrom = (origin_lat * Math.PI) / 180;
  const lngFrom = (origin_lng * Math.PI) / 180;
  const latTo = (lat * Math.PI) / 180;
  const lngTo = (lng * Math.PI) / 180;

  // Haversine formula
  const earthRadius = 6371;

  const latDelta = latTo - latFrom;
  const lngDelta = lngTo - lngFrom;

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(latFrom) * Math.cos(latTo) * Math.sin(lngDelta / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;

  return distance; // km
}

export const DELIVERY_BASE_KM = 3;
export const DELIVERY_BASE_PRICE = 55;
export const DELIVERY_EXTRA_PRICE_PER_KM = 10;

export function computeDelivery(distanceKm: number): {
  price: number;
  extraKm: number;
} {
  if (distanceKm <= DELIVERY_BASE_KM) {
    return { price: DELIVERY_BASE_PRICE, extraKm: 0 };
  }
  const extraKm = Math.ceil(distanceKm - DELIVERY_BASE_KM);
  return {
    price: DELIVERY_BASE_PRICE + extraKm * DELIVERY_EXTRA_PRICE_PER_KM,
    extraKm,
  };
}

export function formatCurrency(value: number): string {
  return `₱${value.toFixed(2)}`;
}

export function statusColor(status?: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return { bg: "bg-emerald-100", text: "text-emerald-800" };
    case "cancelled":
    case "rejected":
      return { bg: "bg-red-100", text: "text-red-700" };
    case "pending":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "preparing":
    case "processing":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" };
  }
}

export function paymentColor(status?: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case "paid":
    case "verified":
      return { bg: "bg-emerald-100", text: "text-emerald-800" };
    case "failed":
    case "rejected":
      return { bg: "bg-red-100", text: "text-red-700" };
    default:
      return { bg: "bg-amber-100", text: "text-amber-800" };
  }
}

export function resolveCustomerName(user?: {
  first_name?: string;
  last_name?: string;
  name?: string;
}): string {
  if (user?.first_name) {
    return `${user.first_name} ${user.last_name ?? ""}`.trim();
  }
  return user?.name ?? "Customer";
}
