import { apiRequest } from "./client";

export async function getAdminOrders(params = {}) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      query.set(k, String(v));
    }
  }
  const queryString = query.toString();
  const endpoint = `/admin/orders${queryString ? `?${queryString}` : ""}`;
  const res = await apiRequest(endpoint);
  return res?.data?.orders || [];
}

export async function getAdminOrderById(id) {
  const res = await apiRequest(`/admin/orders/${id}`);
  return res?.data?.order;
}

export async function updateAdminOrderStatus(id, updates = {}) {
  const res = await apiRequest(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: updates,
  });
  return res?.data?.order;
}
