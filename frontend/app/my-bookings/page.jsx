"use client";
import Link from "next/link";

const DEMO_BOOKINGS = [
  {
    id: "BK-00412",
    date: "14 Sep 2026",
    time: "7:30 PM",
    guests: 4,
    name: "Hamza Sheikh",
    note: "Anniversary dinner",
    status: "Confirmed",
  },
  {
    id: "BK-00389",
    date: "5 Sep 2026",
    time: "1:00 PM",
    guests: 2,
    name: "Hamza Sheikh",
    note: "",
    status: "Completed",
  },
  {
    id: "BK-00351",
    date: "18 Aug 2026",
    time: "8:00 PM",
    guests: 6,
    name: "Hamza Sheikh",
    note: "Family gathering",
    status: "Completed",
  },
];

const statusColors = {
  Confirmed: "text-[#1B3B2B] bg-[#E3EFE8] border-[#C7DEC8]",
  Completed: "text-stone-600 bg-stone-100 border-stone-200",
  Cancelled: "text-rose-700 bg-rose-50 border-rose-200",
  Pending: "text-amber-700 bg-amber-50 border-amber-200",
};

export default function MyBookings() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">My Bookings</h1>
            <p className="text-xs text-stone-500 mt-1">Your table reservation history</p>
          </div>
          <Link
            href="/reserve-table"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#11261B] transition-all"
          >
            + New Booking
          </Link>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {DEMO_BOOKINGS.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-[#1B3B2B] font-mono">{booking.id}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{booking.date}</span>
                </div>
                <span className={`self-start sm:self-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[booking.status] || "text-stone-500 bg-stone-50 border-stone-200"}`}>
                  {booking.status}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs mb-3">
                <div>
                  <p className="text-stone-400 font-medium mb-0.5">Time</p>
                  <p className="font-semibold text-stone-800">{booking.time}</p>
                </div>
                <div>
                  <p className="text-stone-400 font-medium mb-0.5">Guests</p>
                  <p className="font-semibold text-stone-800">{booking.guests} {booking.guests === 1 ? "person" : "people"}</p>
                </div>
                <div>
                  <p className="text-stone-400 font-medium mb-0.5">Name</p>
                  <p className="font-semibold text-stone-800">{booking.name}</p>
                </div>
                {booking.note && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-stone-400 font-medium mb-0.5">Note</p>
                    <p className="text-stone-600 italic">{booking.note}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button className="text-xs font-semibold text-[#1B3B2B] border border-stone-300 hover:border-[#1B3B2B] px-4 py-1.5 rounded-full transition-colors bg-white">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          Showing demo data. Live booking history will be available once you sign in.
        </p>
      </div>
    </div>
  );
}