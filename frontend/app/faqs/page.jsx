"use client";
import { useState } from "react";

const FAQS = [
  {
    category: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: "Visit the Order & Dine page, browse the menu, add items to your cart, and proceed to checkout. You can confirm your order via WhatsApp or UPI payment.",
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
        a: "We accept Google Pay, PhonePe, and all UPI-based payments. Cash on delivery is also available for home delivery orders.",
      },
      {
        q: "Is online payment safe?",
        a: "Yes. Payments are processed directly via your UPI app (GPay, PhonePe) through a secure UPI link or QR code. We do not store any card or payment data.",
      },
      {
        q: "What if my payment was deducted but the order was not placed?",
        a: "Please WhatsApp us immediately with your UPI transaction reference. We will verify and confirm your order within 30 minutes.",
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
        a: "A delivery fee of ₹100 is applied to all home delivery orders. This is shown clearly at checkout before you confirm.",
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
        a: "Orders can be cancelled within 5 minutes of placing them. After that, the food preparation has typically begun and cancellations may not be possible. Contact us immediately via WhatsApp.",
      },
      {
        q: "Do you offer refunds?",
        a: "If an order is cancelled within the allowed window, refunds are processed back to your original payment method within 3–5 business days.",
      },
    ],
  },
  {
    category: "Restaurant Timings",
    items: [
      {
        q: "What are your opening hours?",
        a: "Majedaar Restaurant is open daily from 11:00 AM to 11:30 PM, including weekends and public holidays.",
      },
      {
        q: "Can I order close to closing time?",
        a: "We accept orders up to 11:00 PM. Last kitchen orders are taken at 10:45 PM.",
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
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">Frequently Asked Questions</h1>
          <p className="text-xs text-stone-500 mt-1">Common questions about ordering, delivery, payment and dine-in</p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3 px-1">{section.category}</h2>
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
                        <span className="text-sm font-semibold text-stone-800 leading-snug">{item.q}</span>
                        <svg
                          className={`w-4 h-4 text-stone-400 flex-none mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                          <p className="pt-3">{item.a}</p>
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
          <p className="text-xs text-stone-400 mb-4">Our team is happy to help during restaurant hours.</p>
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