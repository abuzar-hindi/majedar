/**
 * Majedaar Restaurant - WhatsApp Order Sharing Utilities
 * Pure helper functions for formatting order delivery notifications.
 * Clean, professional, emoji-free text with proper UTF-8 encoding.
 */

/**
 * Clean and normalize string values, discarding empty or placeholder values.
 * Returns null if the value represents an undefined, null, or N/A placeholder.
 *
 * @param {any} val
 * @returns {string|null}
 */
export function cleanString(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;

  const lower = str.toLowerCase();
  if (
    lower === "undefined" ||
    lower === "null" ||
    lower === "n/a" ||
    lower === "na" ||
    lower === "—" ||
    lower === "-"
  ) {
    return null;
  }
  return str;
}

/**
 * Format order information into a clean, professional, delivery-focused WhatsApp message.
 * Pure function: does not modify input, make API calls, or calculate totals.
 * Completely free of emojis/icons to avoid encoding/rendering issues across platforms.
 *
 * @param {Object} order - Authoritative backend order object
 * @returns {string} Formatted WhatsApp message
 */
export function formatOrderForWhatsApp(order) {
  if (!order || typeof order !== "object") {
    return "";
  }

  // 1. Order Identifier
  const rawId =
    cleanString(order.orderNumber) ||
    cleanString(order._id) ||
    cleanString(order.id) ||
    "";
  const cleanId = rawId.replace(/^#/, "");
  const orderLine = cleanId ? `Order: #${cleanId}` : "Order";

  // 2. Customer details
  const customerName =
    cleanString(order.customer?.name) ||
    cleanString(
      [order.deliveryAddress?.firstName, order.deliveryAddress?.lastName]
        .filter(Boolean)
        .join(" ")
    ) ||
    "Customer";

  const customerPhone =
    cleanString(order.deliveryAddress?.phone) ||
    cleanString(order.customer?.phone) ||
    "";

  const customerLines = [`Customer: ${customerName}`];
  if (customerPhone) {
    customerLines.push(`Phone: ${customerPhone}`);
  }
  const customerBlock = customerLines.join("\n");

  // 3. Delivery address
  let address = cleanString(order.deliveryAddress?.address);
  if (!address && typeof order.deliveryAddress === "string") {
    address = cleanString(order.deliveryAddress);
  }
  const area = cleanString(order.deliveryAddress?.area);

  if (address && area && !address.toLowerCase().includes(area.toLowerCase())) {
    address = `${address}, ${area}`;
  } else if (!address && area) {
    address = area;
  }
  const addressLine = `Delivery Address: ${address || "Address not provided"}`;

  // 4. Optional Landmark & Delivery instructions
  const landmark = cleanString(order.deliveryAddress?.landmark);
  const instructions = cleanString(order.deliveryAddress?.deliveryInstructions);
  const instructionsOther = cleanString(
    order.deliveryAddress?.deliveryInstructionOther
  );

  let finalInstructions = null;
  if (instructions && instructions.toLowerCase() === "other") {
    finalInstructions = instructionsOther || null;
  } else if (instructions && instructionsOther) {
    finalInstructions = `${instructions} (${instructionsOther})`;
  } else if (instructions) {
    finalInstructions = instructions;
  } else if (instructionsOther) {
    finalInstructions = instructionsOther;
  }

  const deliveryLines = [addressLine];
  if (landmark) {
    deliveryLines.push(`Landmark: ${landmark}`);
  }
  if (finalInstructions) {
    deliveryLines.push(`Delivery: ${finalInstructions}`);
  }
  const deliveryBlock = deliveryLines.join("\n");

  // 5. Backend Authoritative Total
  const totalAmount =
    order.total !== null &&
    order.total !== undefined &&
    !isNaN(Number(order.total))
      ? Number(order.total).toFixed(2)
      : "0.00";
  const amountLine = `Amount: ₹${totalAmount}`;

  // 6. Payment Information
  let paymentMethod = "COD";
  const rawMethod = (order.paymentMethod || "").toLowerCase();
  if (rawMethod === "razorpay" || rawMethod === "online") {
    paymentMethod = "Online";
  } else if (rawMethod === "cod") {
    paymentMethod = "COD";
  } else if (rawMethod) {
    paymentMethod = rawMethod.toUpperCase();
  }

  const paymentStatusMap = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
    created: "Pending",
  };
  const rawStatus = (order.paymentStatus || "").toLowerCase();
  const paymentStatus =
    paymentStatusMap[rawStatus] ||
    (rawStatus
      ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)
      : "Pending");

  const paymentLine = `Payment: ${paymentMethod} - ${paymentStatus}`;
  const financeBlock = `${amountLine}\n${paymentLine}`;

  // 7. Assemble Complete Message
  const separator = "--------------------";
  const headerBlock = `MAJEDAAR RESTAURANT\n${separator}`;
  const footerBlock = `${separator}\nPlease deliver this order to the customer.`;

  return [
    headerBlock,
    orderLine,
    customerBlock,
    deliveryBlock,
    financeBlock,
    footerBlock,
  ].join("\n\n");
}

/**
 * Generate standard WhatsApp share URL using proper UTF-8 URI encoding.
 * Desktop opens WhatsApp Web; mobile opens WhatsApp application.
 *
 * @param {Object} order - Authoritative backend order object
 * @returns {string} WhatsApp URL with properly encoded message
 */
export function getWhatsAppShareUrl(order) {
  const message = formatOrderForWhatsApp(order);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
