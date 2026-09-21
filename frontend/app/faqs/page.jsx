"use client";
import { useState } from "react";

// ── Payment method badge icons ──────────────────────────────
// Shown inline inside the "What payment methods do you accept?" answer
const PAYMENT_METHODS = [
  {
    label: "UPI",
    sub: "GPay · PhonePe · Paytm",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        <circle cx="12" cy="12" r="9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Debit Card",
    sub: "Visa · Mastercard · RuPay",
    color: "bg-sky-50 border-sky-200 text-sky-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M2 10h20" />
      </svg>
    ),
  },
  {
    label: "Credit Card",
    sub: "Visa · Mastercard · Amex",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M2 10h20M6 15h3" />
      </svg>
    ),
  },
  {
    label: "Net Banking",
    sub: "All major banks",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-8 9 8M4 10v9a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    label: "Wallets",
    sub: "Mobikwik · Freecharge",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12V8a4 4 0 00-8 0v4" />
      </svg>
    ),
  },
  {
    label: "Cash on Delivery",
    sub: "Pay when food arrives",
    color: "bg-stone-50 border-stone-200 text-stone-700",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 11H4L5 9z" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    category: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: "Visit the Order & Dine page, browse the menu, add items to your cart, and proceed to checkout. You can pay online securely or choose Cash on Delivery.",
      },
      {
        q: "Can I order food for home delivery?",
        a: "Yes. Select Home Delivery at checkout, fill in your address, and confirm the order. We deliver within Faizabad city limits.",
      },
      {
        q: "Can I place a bulk or catering order?",
        a: "Absolutely. Call us on +91 7905404619 or WhatsApp us to discuss bulk orders, catering requirements, and special pricing.",
      },
    ],
  },
  {
    category: "Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major online payment methods via Razorpay — UPI (Google Pay, PhonePe, Paytm), Debit Cards, Credit Cards, Net Banking, and Wallets. Cash on Delivery (COD) is also available for home delivery orders.",
        // Special key to trigger the visual payment grid
        richKey: "payment-methods",
      },
      {
        q: "Is online payment safe?",
        a: "Yes. All online payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details, UPI PIN, or any sensitive payment information on our servers.",
      },
      {
        q: "What if my payment was deducted but the order was not confirmed?",
        a: "This is handled automatically. If your payment succeeds but order confirmation fails, the amount is refunded within 5–7 business days. You can also check your order status on the My Orders page and retry payment from there. Contact us on WhatsApp if you need immediate help.",
      },
      {
        q: "Can I pay after placing the order?",
        a: "Yes. If you choose online payment but close the payment screen, your order is saved in a pending state. You can pay later by visiting My Orders and tapping the Pay Now button on the order.",
      },
    ],
  },
  {
    category: "Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Typical delivery time is 30–50 minutes depending on your location and order volume. You will be notified once your order is out for delivery.",
      },
      {
        q: "What is the delivery charge?",
        a: "Our delivery fee is ₹15 for 0–3 KM and ₹30 for 3–5 KM within Faizabad. The fee is automatically calculated based on your selected delivery area at checkout.",
      },
      {
        q: "Do you deliver outside Faizabad?",
        a: "Currently we deliver within Faizabad city limits. For orders outside the area, please call us to check availability.",
      },
    ],
  },
  {
    category: "Dine-in & Table Booking",
    items: [
      {
        q: "Do you need a reservation for dine-in?",
        a: "Walk-ins are welcome. However, for groups of 5 or more, we recommend reserving a table via the Reserve a Table page.",
      },
      {
        q: "How do I cancel a table reservation?",
        a: "To cancel a booking, please call us or WhatsApp us at least 2 hours before your reservation time at +91 7905404619.",
      },
    ],
  },
  {
    category: "Cancellation & Refunds",
    items: [
      {
        q: "Can I cancel my order?",
        a: "Yes. You can cancel your order directly from your order details page before the kitchen starts preparing it (while order status is 'Placed'). For online paid orders, a full refund is automatically initiated to your original payment method via Razorpay.",
      },
      {
        q: "Do you offer refunds for cancelled orders?",
        a: "Yes. For online paid orders that are cancelled before kitchen preparation, a full refund is automatically initiated via Razorpay to your original payment method.",
      },
    ],
  },
];

export default function FAQs() {
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => setOpenKey(openKey === key ? null : key);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-5 border-b border-stone-200">
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Common questions about ordering, delivery, payment and dine-in
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3 px-1">
                {section.category}
              </h2>
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-stone-100">
                {section.items.map((item, idx) => {
                  const key = `${section.category}-${idx}`;
                  const isOpen = openKey === key;
                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-4 text-left transition-colors hover:bg-stone-50/80"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold text-stone-800 leading-snug">
                          {item.q}
                        </span>
                        <svg
                          className={`w-4 h-4 text-stone-400 flex-none mt-0.5 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                          <p className="pt-3">{item.a}</p>

                          {/* ── Rich: Payment Method Grid ── */}
                          {item.richKey === "payment-methods" && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                                Accepted payment methods
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map((pm) => (
                                  <div
                                    key={pm.label}
                                    className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 ${pm.color}`}
                                  >
                                    <span className="flex-none opacity-80">{pm.icon}</span>
                                    <div>
                                      <span className="text-xs font-bold block leading-tight">
                                        {pm.label}
                                      </span>
                                      <span className="text-[10px] opacity-70 leading-tight">
                                        {pm.sub}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-200/80">
                                <svg className="w-3.5 h-3.5 text-blue-500 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-[11px] text-blue-700 font-medium">
                                  Secured by Razorpay — PCI-DSS compliant
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-10 text-center border border-stone-200 rounded-xl py-6 px-5 bg-white shadow-2xs">
          <p className="text-sm font-semibold text-stone-700 mb-1">Still have a question?</p>
          <p className="text-xs text-stone-400 mb-4">
            Our team is always happy to help you with any questions or assistance.
          </p>
          <a
            href="https://wa.me/917905404619"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#11261B] transition-all"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}