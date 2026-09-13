/*
 * Responsibility: Own order business rules outside HTTP handling.
 * Future work: Build guest/customer orders, calculate trusted totals from menu data, manage status
 * transitions, and coordinate payment state and order numbers.
 * Integration: order.controller.js calls this service; it coordinates Order, MenuItem, Payment, and customer data.
 */
