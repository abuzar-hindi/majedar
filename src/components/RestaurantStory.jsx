import React from "react";
import { Link } from "react-router-dom";

const RestaurantStory = () => {
  return (
    <section className="w-full bg-[#F2F7F4] py-14 sm:py-20 border-b border-stone-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-[0.2em] block mb-2">
          Our Heritage & Flavor
        </span>

        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B] tracking-tight mb-6">
          Authentic Cooking, Prepared Fresh Daily
        </h2>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
          At Majedaar Restaurant, every dish is crafted with carefully sourced spices, fresh ingredients, and time-honored recipes. From our aromatic dum biryanis to charcoal-grilled tandoori specialties, we take pride in serving genuine flavors straight to your table or doorstep.
        </p>

        <div className="flex justify-center gap-6 text-xs sm:text-sm font-semibold text-[#1B3B2B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C85A17]"></span>
            <span>Quality Ingredients</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C85A17]"></span>
            <span>No Artificial Additives</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C85A17]"></span>
            <span>Direct Kitchen Ordering</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantStory;
