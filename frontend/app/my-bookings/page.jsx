"use client";

import Link from "next/link";

export default function MyBookings() {
  return (
    <div className="min-h-[75vh] bg-[#FAF8F5] pt-12 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-2xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
          Dine-in Reservations
        </span>
        <h1 className="font-hero text-2xl font-bold text-[#1B3B2B] mb-2">
          Table Bookings
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed mb-6">
          Online table reservations are scheduled for an upcoming release. To reserve a table for dine-in today, please call the restaurant directly.
        </p>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 mb-6 text-xs">
          <p className="text-stone-500 mb-1">Direct Restaurant Line</p>
          <a
            href="tel:+917905404619"
            className="text-base font-extrabold text-[#1B3B2B] hover:underline"
          >
            +91 79054 04619
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/orderanddine"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all"
          >
            Order Food Online
          </Link>
          <Link
            href="/my-orders"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}