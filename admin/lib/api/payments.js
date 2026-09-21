import { apiRequest } from "./client";

/**
 * Admin payment management API calls.
 * All endpoints require admin authentication.
 */

/**
 * Get all PaymentAttempts with optional filters.
 * Each row is an individual attempt — multiple attempts per order shown separately.
 *
 * @param {Object} params - { status, method, page, limit }
 */
export async function getAdminPayments(params = {}) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      query.set(k, String(v));
    }
  }
  const queryString = query.toString();
  const endpoint = `/admin/payments${queryString ? `?${queryString}` : ""}`;
  const res = await apiRequest(endpoint);
  return res?.data || { attempts: [], total: 0, page: 1, limit: 50 };
}

/**
 * Get all payment attempts for a specific order.
 * Shows full retry history: Attempt 1 → failed, Attempt 2 → paid, etc.
 *
 * @param {string} orderId
 */
export async function getOrderPaymentAttempts(orderId) {
  const res = await apiRequest(`/admin/payments/order/${orderId}`);
  return res?.data?.attempts || [];
}

/**
 * Initiate a refund for a specific PaymentAttempt.
 * Amount is in paise (integer).
 *
 * @param {string} attemptId - PaymentAttempt ID
 * @param {number} amountInPaise - Integer paise amount
 */
export async function initiateRefund(attemptId, amountInPaise) {
  const res = await apiRequest(`/admin/payments/${attemptId}/refund`, {
    method: "POST",
    body: { amountInPaise },
  });
  return res?.data?.attempt;
}
