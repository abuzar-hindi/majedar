/*
 * Responsibility: Receive order HTTP requests and return consistent responses.
 * Future work: Validate guest or customer order input and delegate lifecycle operations to
 * order.service.js, including order numbers, totals, statuses, and payment references.
 * Integration: order.routes.js calls this layer; the service coordinates Order, MenuItem, and Payment models.
 */
