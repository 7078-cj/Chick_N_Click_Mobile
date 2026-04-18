import { apiRequest } from "./http";

export function fetchCategories() {
  return apiRequest("/api/category", {});
}

export function fetchFoods() {
  return apiRequest("/api/foods", {});
}
