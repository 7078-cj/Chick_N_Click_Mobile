import { apiRequest } from "./http";

export function fetchOrders(token: string) {
  return apiRequest("/api/orders", {
    token,
    headers: { "Content-Type": "application/json" },
  });
}

export function cancelOrderRequest(token: string, orderId: number) {
  return apiRequest(`/api/order/${orderId}/cancel`, {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
  });
}
