import { apiRequest } from "./client";

/**
 * Public category retrieval API calls
 */

export async function getCategories() {
  const response = await apiRequest("/categories", {
    method: "GET",
  });
  return response?.data?.categories || [];
}
