import { apiRequest } from "./client";

/**
 * Public menu API calls
 */

export async function getPublicMenu(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.category && params.category !== "All") {
    searchParams.append("category", params.category);
  }
  if (params.search) {
    searchParams.append("search", params.search);
  }
  if (params.isVeg !== undefined && params.isVeg !== null) {
    searchParams.append("isVeg", String(params.isVeg));
  }
  if (params.isBestseller !== undefined && params.isBestseller !== null) {
    searchParams.append("isBestseller", String(params.isBestseller));
  }
  if (params.sort) {
    searchParams.append("sort", params.sort);
  }

  const query = searchParams.toString();
  const endpoint = query ? `/menu?${query}` : "/menu";

  const response = await apiRequest(endpoint, {
    method: "GET",
  });

  return response?.data?.menu || response?.data?.menuItems || [];
}

export async function getPublicMenuItem(id) {
  const response = await apiRequest(`/menu/${id}`, {
    method: "GET",
  });
  return response?.data?.item || response?.data?.menuItem || null;
}
