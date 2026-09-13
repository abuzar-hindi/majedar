/*
 * Responsibility: Isolate Razorpay order creation and provider API communication.
 * Future work: Create provider orders, normalize provider responses, and support future refund operations
 * without leaking provider details into controllers.
 * Integration: payment.controller.js and order.service.js call this service; configuration comes from env.js
 * and payment records are managed through the Payment model.
 */
