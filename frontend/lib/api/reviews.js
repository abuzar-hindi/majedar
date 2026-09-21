import { apiRequest } from "./client";

/**
 * Customer rating API call (Star ratings only, 1-5 stars, no comments)
 */

export async function submitRating({ orderId, menuItemId, rating }) {
  const response = await apiRequest("/reviews", {
    method: "POST",
    body: {
      orderId,
      menuItemId,
      rating: Number(rating),
    },
  });
  return response?.data?.review || response?.data;
}

export async function getMenuItemReviews(menuItemId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/reviews/menu/${menuItemId}?${query}` : `/reviews/menu/${menuItemId}`;
  const response = await apiRequest(endpoint, {
    method: "GET",
  });
  return response?.data || { reviews: [], total: 0 };
}
