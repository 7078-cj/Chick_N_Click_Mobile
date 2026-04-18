import { apiRequest } from "./http";

export function fetchSides() {
  return apiRequest("/api/sides", { credentials: "include" });
}

export function fetchDrinks() {
  return apiRequest("/api/drinks", { credentials: "include" });
}
