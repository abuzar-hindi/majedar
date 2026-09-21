import { apiRequest } from "./client";

export async function getAdminReviews(params = {}) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      query.set(k, String(v));
    }
  }
  const queryString = query.toString();
  const endpoint = `/admin/reviews${queryString ? `?${queryString}` : ""}`;
  const res = await apiRequest(endpoint);
  return res?.data?.reviews || [];
}

export async function deleteAdminReview(id) {
  const res = await apiRequest(`/admin/reviews/${id}`, {
    method: "DELETE",
  });
  return res?.data;
}
