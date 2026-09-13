"use client";

const DEMO_ORDERS = [
  {
    id: "MD-104823",
    date: "12 Sep 2026",
    items: ["Shahi Paneer (Full) x1", "Zeera Rice x1", "Laccha Paratha x2"],
    total: 380,
    payment: "UPI Paid",
    status: "Delivered",
  },
  {
    id: "MD-104687",
    date: "9 Sep 2026",
    items: ["Chicken Biryani (Full) x1", "Dal Tadka (Half) x1"],
    total: 350,
    payment: "Cash on Delivery",
    status: "Delivered",
  },
  {
    id: "MD-104512",
    date: "5 Sep 2026",
    items: ["Steam Momos x2", "Cold Coffee x1", "Veg Burger x1"],
    total: 280,
    payment: "UPI Paid",
    status: "Delivered",
  },
  {
    id: "MD-104301",
    date: "1 Sep 2026",
    items: ["Super Deluxe Thali x1"],
    total: 350,
    payment: "UPI Paid",
    status: "Delivered",
  },
];

const statusColors = {
  Delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Pending: "text-amber-700 bg-amber-50 border-amber-200",
  Cancelled: "text-rose-700 bg-rose-50 border-rose-200",
};

const paymentColors = {
  "UPI Paid": "text-[#1B3B2B]",
  "Cash on Delivery": "text-stone-500",
};

export default function MyOrders() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-5 border-b border-stone-200">
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">My Orders</h1>
          <p className="text-xs text-stone-500 mt-1">Your recent order history from Majedaar Restaurant</p>
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {DEMO_ORDERS.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-[#1B3B2B] font-mono tracking-wide">{order.id}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{order.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || "text-stone-500 bg-stone-50 border-stone-200"}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <ul className="space-y-0.5 mb-3">
                {order.items.map((item, i) => (
                  <li key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                    <span className="text-stone-300 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-extrabold text-stone-800">&#8377;{order.total}</span>
                  <span className="text-stone-300">•</span>
                  <span className={`font-medium ${paymentColors[order.payment] || "text-stone-500"}`}>{order.payment}</span>
                </div>
                <button className="self-start sm:self-auto text-xs font-semibold text-[#1B3B2B] border border-stone-300 hover:border-[#1B3B2B] px-4 py-1.5 rounded-full transition-colors bg-white">
                  View Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state notice */}
        <p className="text-center text-xs text-stone-400 mt-8">
          Showing demo data. Live order history will be available once you sign in.
        </p>
      </div>
    </div>
  );
}