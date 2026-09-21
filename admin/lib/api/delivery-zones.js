import { apiRequest } from "./client";

export async function getAdminDeliveryZones() {
  const res = await apiRequest("/admin/delivery-zones");
  return res?.data?.zones || [];
}

export async function getAdminDeliveryZoneById(id) {
  const res = await apiRequest(`/admin/delivery-zones/${id}`);
  return res?.data?.zone;
}

export async function createDeliveryZone(data) {
  const res = await apiRequest("/admin/delivery-zones", {
    method: "POST",
    body: data,
  });
  return res?.data?.zone;
}

export async function updateDeliveryZone(id, data) {
  const res = await apiRequest(`/admin/delivery-zones/${id}`, {
    method: "PATCH",
    body: data,
  });
  return res?.data?.zone;
}

export async function deleteDeliveryZone(id) {
  const res = await apiRequest(`/admin/delivery-zones/${id}`, {
    method: "DELETE",
  });
  return res?.data;
}
