import assert from "node:assert/strict";
import {
  cleanString,
  formatOrderForWhatsApp,
  getWhatsAppShareUrl,
} from "./whatsapp.js";

console.log("Starting WhatsApp Order Sharing Test Suite (Clean & Emoji-free)...\n");

// ── Test 1: User's exact prompt specification test ───────────────────────────
{
  const order = {
    orderNumber: "MD-260919-B06841",
    customer: { name: "Abuzar Hindi", phone: "7525899794" },
    deliveryAddress: {
      address: "gjhb, Niyawan",
      landmark: "gjhgj",
      deliveryInstructions: "Call on arrival",
    },
    total: 177.0,
    paymentMethod: "online",
    paymentStatus: "paid",
  };

  const msg = formatOrderForWhatsApp(order);
  const expected = [
    "MAJEDAAR RESTAURANT\n--------------------",
    "Order: #MD-260919-B06841",
    "Customer: Abuzar Hindi\nPhone: 7525899794",
    "Delivery Address: gjhb, Niyawan\nLandmark: gjhgj\nDelivery: Call on arrival",
    "Amount: ₹177.00\nPayment: Online - Paid",
    "--------------------\nPlease deliver this order to the customer.",
  ].join("\n\n");

  assert.equal(msg, expected, "Message must match user's exact professional specification");
  console.log("✓ Test 1 Passed: Exact user specification match");
}

// ── Test 2: Clean text and strictly zero emojis or icons ──────────────────────
{
  const order = {
    orderNumber: "MD-100",
    customer: { name: "Ramesh Sharma", phone: "9876543210" },
    deliveryAddress: {
      address: "House 12, Civil Lines",
      area: "Ayodhya",
      landmark: "Near Temple",
      deliveryInstructions: "Leave at door",
    },
    total: 450,
    paymentMethod: "cod",
    paymentStatus: "pending",
  };

  const msg = formatOrderForWhatsApp(order);

  // Assert no emojis or old symbols
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
  assert.equal(emojiRegex.test(msg), false, "Message must not contain any emoji characters");
  assert.ok(!msg.includes("💳"), "No card emoji");
  assert.ok(!msg.includes("💰"), "No money emoji");
  assert.ok(!msg.includes("📝"), "No memo emoji");
  assert.ok(!msg.includes("📌"), "No pin emoji");
  assert.ok(!msg.includes("🛵"), "No scooter emoji");
  assert.ok(!msg.includes("\uFFFD"), "No replacement character");

  assert.ok(msg.includes("Payment: COD - Pending"));
  assert.ok(msg.includes("Amount: ₹450.00"));
  console.log("✓ Test 2 Passed: Strictly zero emojis or icons");
}

// ── Test 3: COD order paid (COD - Paid) ───────────────────────────────────────
{
  const codPaidOrder = {
    orderNumber: "MD-200",
    customer: { name: "Pooja Singh", phone: "9870000000" },
    deliveryAddress: { address: "Lane 4, Civil Lines" },
    total: 350.5,
    paymentMethod: "cod",
    paymentStatus: "paid",
  };

  const msg = formatOrderForWhatsApp(codPaidOrder);
  assert.ok(msg.includes("Payment: COD - Paid"));
  assert.ok(msg.includes("Amount: ₹350.50"));
  console.log("✓ Test 3 Passed: COD paid formatting");
}

// ── Test 4: Missing optional fields (landmark & delivery instructions) ────────
{
  const minimalOrder = {
    orderNumber: "MD-300",
    customer: { name: "Sneha Patel", phone: "9123456780" },
    deliveryAddress: {
      address: "Flat 402, Sunshine Apts",
      landmark: null,
      deliveryInstructions: "",
      deliveryInstructionOther: "null",
    },
    total: 320,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
  };

  const msg = formatOrderForWhatsApp(minimalOrder);
  assert.ok(!msg.includes("Landmark:"), "Landmark line must be cleanly omitted when null");
  assert.ok(!msg.includes("Delivery:"), "Delivery line must be cleanly omitted when instructions empty");
  assert.ok(!msg.includes("undefined") && !msg.includes("null") && !msg.includes("N/A"));
  assert.ok(msg.includes("Payment: Online - Paid"));
  console.log("✓ Test 4 Passed: Missing optional fields cleanly omitted");
}

// ── Test 5: Fallback customer name from firstName / lastName ─────────────────
{
  const nameFallbackOrder = {
    orderNumber: "MD-400",
    deliveryAddress: {
      firstName: "Mohd",
      lastName: "Zaid",
      phone: "9988776655",
      address: "Chowk Bazar",
    },
    total: 210,
    paymentMethod: "cod",
    paymentStatus: "pending",
  };

  const msg = formatOrderForWhatsApp(nameFallbackOrder);
  assert.ok(msg.includes("Customer: Mohd Zaid"));
  assert.ok(msg.includes("Phone: 9988776655"));
  console.log("✓ Test 5 Passed: Customer name fallback from delivery address");
}

// ── Test 6: Special characters and UTF-8 URL encoding ─────────────────────────
{
  const specialCharsOrder = {
    orderNumber: "MD-#500&spec",
    customer: { name: "John & Jane Doe / O'Connor <VIP>", phone: "+91-98765-43210" },
    deliveryAddress: {
      address: "Flat #12-B, 5th Floor @ \"Green Towers\" & Co.",
      landmark: "Near St. Mary's & Cafe #9",
      deliveryInstructions: "Knock 2 times & don't call!",
    },
    total: 999.99,
    paymentMethod: "online",
    paymentStatus: "paid",
  };

  const msg = formatOrderForWhatsApp(specialCharsOrder);
  assert.ok(msg.includes("Customer: John & Jane Doe / O'Connor <VIP>"));
  assert.ok(msg.includes("Delivery Address: Flat #12-B, 5th Floor @ \"Green Towers\" & Co."));

  const shareUrl = getWhatsAppShareUrl(specialCharsOrder);
  assert.ok(shareUrl.startsWith("https://wa.me/?text="));
  assert.ok(!shareUrl.includes("\uFFFD"), "URL must not contain unicode replacement character");

  // Verify URL decoding matches the original UTF-8 message
  const decoded = decodeURIComponent(shareUrl.replace("https://wa.me/?text=", ""));
  assert.equal(decoded, msg, "Decoded URL text must exactly match the formatted message");
  // Verify ₹ symbol is encoded as %E2%82%B9 in URL
  assert.ok(shareUrl.includes("%E2%82%B9"), "Rupee symbol ₹ must be safely percent-encoded as %E2%82%B9");
  console.log("✓ Test 6 Passed: UTF-8 encoding and URL generation verified");
}

// ── Test 7: Items and breakdown strictly excluded ─────────────────────────────
{
  const fullOrderWithItems = {
    orderNumber: "MD-600",
    customer: { name: "Pooja Gupta", phone: "9871234560" },
    deliveryAddress: { address: "74 Station Road" },
    items: [
      { name: "Paneer Butter Masala", variant: "full", quantity: 2, price: 250, subtotal: 500 },
      { name: "Butter Naan", variant: "single", quantity: 4, price: 40, subtotal: 160 },
    ],
    subtotal: 660,
    gst: 33,
    deliveryFee: 40,
    total: 733,
    paymentMethod: "cod",
    paymentStatus: "pending",
  };

  const msg = formatOrderForWhatsApp(fullOrderWithItems);
  assert.ok(!msg.includes("Paneer Butter Masala"), "No food items allowed");
  assert.ok(!msg.includes("Butter Naan"), "No food items allowed");
  assert.ok(!msg.includes("Subtotal"), "No subtotal allowed");
  assert.ok(!msg.includes("GST"), "No GST allowed");
  assert.ok(!msg.includes("Delivery Fee"), "No delivery fee allowed");
  assert.ok(msg.includes("Amount: ₹733.00"), "Only authoritative final total allowed");
  console.log("✓ Test 7 Passed: Item details and fee breakdowns strictly excluded");
}

// ── Test 8: cleanString utility edge cases ───────────────────────────────────
{
  assert.equal(cleanString(null), null);
  assert.equal(cleanString(undefined), null);
  assert.equal(cleanString(""), null);
  assert.equal(cleanString("   "), null);
  assert.equal(cleanString("N/A"), null);
  assert.equal(cleanString("null"), null);
  assert.equal(cleanString("undefined"), null);
  assert.equal(cleanString("—"), null);
  assert.equal(cleanString("-"), null);
  assert.equal(cleanString("Valid String"), "Valid String");
  console.log("✓ Test 8 Passed: cleanString utility functions properly");
}

console.log("\nAll 8 WhatsApp tests passed successfully! Clean & Emoji-Free verified.\n");
