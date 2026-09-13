/*
 * Responsibility: Receive payment-related HTTP requests and provider callbacks.
 * Future work: Delegate Razorpay order creation, verification, webhook processing, and refund workflows
 * to payment services; signature checks must happen server-side before state changes.
 * Integration: payment.routes.js calls this layer; services update Payment and Order models.
 */
