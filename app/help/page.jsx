const CONTACT_OPTIONS = [
  {
    id: "call",
    label: "Call Us",
    value: "+91 7905404619",
    description: "Speak directly with the team",
    href: "tel:+917905404619",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    description: "Quick replies, Mon–Sun 11AM–11PM",
    href: "https://wa.me/917905404619",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    id: "email",
    label: "Email Us",
    value: "majedarrestaurant@gmail.com",
    description: "We reply within 24 hours",
    href: "mailto:majedarrestaurant@gmail.com",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

const ORDER_ISSUES = [
  "Wrong item delivered",
  "Order too late or not delivered",
  "Payment deducted but order not placed",
  "Need to cancel an order",
  "Food quality complaint",
];

export default function Help() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-5 border-b border-stone-200">
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">Help &amp; Support</h1>
          <p className="text-xs text-stone-500 mt-1">We are here to help. Reach us through any of the options below.</p>
        </div>

        {/* Contact options */}
        <div className="space-y-3 mb-10">
          {CONTACT_OPTIONS.map((opt) => (
            <a
              key={opt.id}
              href={opt.href}
              target={opt.id !== "call" ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 bg-white border border-stone-200 hover:border-[#1B3B2B] rounded-xl px-4 sm:px-5 py-4 transition-colors group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#E3EFE8] flex items-center justify-center flex-none">
                <svg className="w-5 h-5 text-[#1B3B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={opt.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-0.5">{opt.label}</p>
                <p className="text-sm font-semibold text-[#1B3B2B] group-hover:underline truncate">{opt.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{opt.description}</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-[#1B3B2B] flex-none transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        {/* Issue with order */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-2xs mb-6">
          <h2 className="font-bold text-sm text-[#1B3B2B] mb-1">Have a problem with an order?</h2>
          <p className="text-xs text-stone-500 mb-4">Select the issue below and WhatsApp us directly — we will get it sorted.</p>
          <div className="space-y-2">
            {ORDER_ISSUES.map((issue) => (
              <a
                key={issue}
                href={`https://wa.me/917905404619?text=${encodeURIComponent("Hi, I have an issue: " + issue)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 border border-stone-200 hover:border-stone-400 rounded-lg text-xs font-medium text-stone-700 hover:text-[#1B3B2B] transition-colors bg-[#FAF8F5] group"
              >
                <span>{issue}</span>
                <svg className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#1B3B2B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="text-center py-4 px-6 bg-[#E3EFE8]/50 rounded-xl border border-[#C7DEC8]">
          <p className="text-xs font-bold text-[#1B3B2B] mb-1">Support Hours</p>
          <p className="text-xs text-stone-600">Monday – Sunday &nbsp;&bull;&nbsp; 11:00 AM – 11:30 PM</p>
          <p className="text-xs text-stone-400 mt-0.5">Ram Path, Sahabganj, Faizabad, UP 224001</p>
        </div>
      </div>
    </div>
  );
}