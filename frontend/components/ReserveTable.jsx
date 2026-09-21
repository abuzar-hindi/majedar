"use client";

import Link from "next/link";
import Title from "./Title";

const ReserveTable = () => {
  return (
    <div className="min-h-[75vh] bg-[#FAF8F5] pt-12 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-2xs text-center">
        <div className="mb-2">
          <Title text1="RESERVE" text2="A TABLE" />
        </div>
        <p className="text-xs text-stone-500 leading-relaxed mb-6 mt-2">
          Online table reservations will be available soon. To book a table for dine-in today, please call the restaurant directly.
        </p>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 mb-6 text-xs">
          <p className="text-stone-500 mb-1">Direct Restaurant Phone</p>
          <a
            href="tel:+917905404619"
            className="text-base font-extrabold text-[#1B3B2B] hover:underline"
          >
            +91 79054 04619
          </a>
        </div>

        <Link
          href="/orderanddine"
          className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all inline-block"
        >
          Explore Menu &amp; Order
        </Link>
      </div>
    </div>
  );
};

export default ReserveTable;
