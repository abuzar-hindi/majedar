import { apiRequest } from "./client";

/**
 * Payment API calls for Razorpay integration.
 * Frontend NEVER sends amounts — backend computes all financial values.
 */

/**
 * Create a Razorpay Order for an existing application Order.
 * Returns Razorpay checkout config (razorpayKeyId, razorpayOrderId, amount, currency).
 *
 * @param {string} orderId - Application Order ID
 */
export async function createPayment(orderId) {
  const response = await apiRequest("/payments/razorpay/create", {
    method: "POST",
    body: { orderId },
  });
  return response?.data;
}

/**
 * Verify Razorpay payment after checkout completes.
 * Backend verifies the HMAC signature before marking order as paid.
 *
 * @param {{ razorpayOrderId, razorpayPaymentId, razorpaySignature }} payload
 */
export async function verifyPayment(payload) {
  const response = await apiRequest("/payments/razorpay/verify", {
    method: "POST",
    body: payload,
  });
  return response?.data;
}

/**
 * Retry payment for an existing unpaid application Order.
 * Creates a new PaymentAttempt + Razorpay Order.
 * Old failed attempts are preserved on the backend.
 *
 * @param {string} orderId - Application Order ID
 */
export async function retryPayment(orderId) {
  const response = await apiRequest(`/payments/razorpay/retry/${orderId}`, {
    method: "POST",
  });
  return response?.data;
}
