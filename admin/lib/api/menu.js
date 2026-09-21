import { apiRequest } from "./client";

export async function getAdminMenu(params = {}) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      query.set(k, String(v));
    }
  }
  const queryString = query.toString();
  const endpoint = `/admin/menu${queryString ? `?${queryString}` : ""}`;
  const res = await apiRequest(endpoint);
  return res?.data?.menu || [];
}

export async function getAdminMenuItem(id) {
  const res = await apiRequest(`/admin/menu/${id}`);
  return res?.data?.item;
}

export async function createMenuItem(data) {
  const res = await apiRequest("/admin/menu", {
    method: "POST",
    body: data,
  });
  return res?.data?.item;
}

export async function updateMenuItem(id, data) {
  const res = await apiRequest(`/admin/menu/${id}`, {
    method: "PATCH",
    body: data,
  });
  return res?.data?.item;
}

export async function deleteMenuItem(id) {
  const res = await apiRequest(`/admin/menu/${id}`, {
    method: "DELETE",
  });
  return res?.data;
}
