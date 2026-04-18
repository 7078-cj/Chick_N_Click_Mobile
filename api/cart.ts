import { apiRequest } from "./http";

export function fetchCart(token: string) {
  return apiRequest("/api/cart", {
    token,
    credentials: "include",
  });
}

export function postCartAdd(token: string, foodId: number, body: unknown) {
  return apiRequest(`/api/cart/add/${foodId}`, {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function deleteCartItem(token: string, foodId: number) {
  return apiRequest(`/api/cart/remove/${foodId}`, {
    method: "DELETE",
    token,
  });
}

export function placeOrder(token: string, formData: FormData) {
  return apiRequest("/api/order/place", {
    method: "POST",
    token,
    headers: { Accept: "application/json" },
    body: formData,
  });
}
