import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToMenu = () => {
    const element = document.getElementById("homepage-menu-preview");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-[#FAF8F5] pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-stone-200/60 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* 1. Opening Status Badge */}
          <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E3EFE8] text-[#1B3B2B] text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B3B2B]"></span>
            <span>Open today • 11:00 AM – 11:30 PM</span>
          </div>

          {/* 2. Main Title (Cinzel - Bold, Tall, Regal, Zero Clipping) */}
          <h1 className="font-hero font-bold text-[clamp(1.75rem,5.2vw,4.5rem)] text-[#11261B] tracking-wider uppercase leading-tight py-1.5 mb-3 text-center overflow-visible">
            MAJEDAAR RESTAURANT
          </h1>

          {/* 3. Sub-heading */}
          <p className="text-[#C85A17] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mb-5">
            Restaurant in Ayodhya
          </p>

          {/* 4. Short Description */}
          <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-normal mb-8">
            Freshly prepared food, simple ordering, straight from our kitchen.
          </p>

          {/* 5. CTA Actions */}
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link to="/orderanddine">
              <button className="px-8 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs">
                Order Now
              </button>
            </Link>
            <button
              onClick={scrollToMenu}
              className="px-7 py-3.5 rounded-full bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-2xs"
            >
              Explore Menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
