export const metadata = {
  title: "Frequently Asked Questions | Ordering & Delivery in Ayodhya",
  description:
    "Get answers to common questions about online food ordering, delivery fees, payment options, dine-in reservations, and cancellations at Majedaar Restaurant in Ayodhya.",
  alternates: {
    canonical: "/faqs",
  },
  openGraph: {
    title: "FAQs | Majedaar Restaurant Ayodhya",
    description:
      "Frequently asked questions about online food ordering, delivery zones, cancellations, and payments at Majedaar Restaurant in Ayodhya.",
    url: "/faqs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs | Majedaar Restaurant Ayodhya",
    description:
      "Frequently asked questions about online food ordering, delivery zones, cancellations, and payments at Majedaar Restaurant in Ayodhya.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I place an order at Majedaar Restaurant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visit the Order & Dine page, browse the menu, add items to your cart, and proceed to checkout. You can pay online securely or choose Cash on Delivery.",
      },
    },
    {
      "@type": "Question",
      name: "Can I order food for home delivery in Ayodhya?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Select Home Delivery at checkout, fill in your address, and confirm the order. We deliver within city limits in Ayodhya and Faizabad.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept all major online payment methods via Razorpay — UPI (Google Pay, PhonePe, Paytm), Debit Cards, Credit Cards, Net Banking, and Wallets. Cash on Delivery (COD) is also available for home delivery orders.",
      },
    },
    {
      "@type": "Question",
      name: "How long does delivery take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typical delivery time is 30–50 minutes depending on your location and order volume. You will be notified once your order is out for delivery.",
      },
    },
    {
      "@type": "Question",
      name: "What is the delivery charge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our delivery fee is ₹15 for 0–3 KM and ₹30 for 3–5 KM. The fee is automatically calculated based on your selected delivery area at checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can cancel your order directly from the order details page before the kitchen starts preparing it (while order status is Placed). Full refunds are automatically initiated via Razorpay for online paid orders.",
      },
    },
  ],
};

export default function FAQsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
