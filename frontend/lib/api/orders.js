import { apiRequest } from "./client";

/**
 * Customer order management API calls
 */

export async function createOrder(orderData) {
  const response = await apiRequest("/orders", {
    method: "POST",
    body: orderData,
  });
  return response?.data?.order || response?.data;
}

export async function getMyOrders() {
  const response = await apiRequest("/orders/my", {
    method: "GET",
  });
  return response?.data?.orders || [];
}

export async function getMyOrderById(id) {
  const response = await apiRequest(`/orders/${id}`, {
    method: "GET",
  });
  return response?.data?.order || null;
}

export async function cancelMyOrder(id) {
  const response = await apiRequest(`/orders/${id}/cancel`, {
    method: "POST",
  });
  return response?.data?.order || response?.data;
}

export async function reportOrderIssue(id, { issueType, description }) {
  const response = await apiRequest(`/orders/${id}/report-issue`, {
    method: "POST",
    body: { issueType, description },
  });
  return response?.data?.message || response?.data;
}
