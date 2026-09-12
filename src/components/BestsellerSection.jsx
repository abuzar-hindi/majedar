import React, { useContext, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../assets/assets";

const BestsellerSection = () => {
  const { products, currency, addToCart } = useContext(ShopContext);
  const [selectedTypeMap, setSelectedTypeMap] = useState({});

  // 4–6 Bestseller items from structured data
  const bestsellers = Array.isArray(products)
    ? products.filter((p) => p.bestseller || p.isFeatured).slice(0, 6)
    : [];

  const getImg = (item) =>
    item.images?.[0] ||
    assets.placeholder_food ||
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80";

  return (
    <section className="w-full bg-[#FAF8F5] py-10 sm:py-14 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-[0.2em] block mb-1">
            Customer Favorites
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B] tracking-tight">
            What people love
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 font-normal">
            Our most-loved dishes.
          </p>
        </div>

        {/* Horizontal Bestsellers Carousel (Clean Partial Card Peek on Mobile) */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {bestsellers.map((item) => {
            const defaultType =
              selectedTypeMap[item._id] ||
              (item.types && item.types[0]?.label) ||
              "Full";
            const selectedTypeObj = item.types?.find((t) => t.label === defaultType);
            const displayPrice = selectedTypeObj ? selectedTypeObj.price : (item.price || 0);

            return (
              <div
                key={item._id}
                className="flex-none w-[210px] sm:w-[240px] md:w-[250px] snap-start bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs hover:border-stone-300 transition-all flex flex-col items-center text-center justify-between group"
              >
                {/* Compact Circular Food Image (Clean, No Overlay Icon) */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 border-2 border-stone-100 shadow-2xs bg-stone-50 group-hover:scale-105 transition-transform duration-300 flex-none">
                  <img
                    src={getImg(item)}
                    alt={`${item.name} at Majedaar Restaurant`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Small Bestseller Label */}
                <span className="text-[10px] font-bold text-[#C85A17] bg-[#FDF2EC] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 flex-none">
                  Bestseller
                </span>

                {/* Food Name */}
                <h3 className="font-bold text-xs sm:text-sm text-[#11261B] line-clamp-1 mb-1 text-center w-full">
                  {item.name}
                </h3>

                {/* Short Description (Clean 1-2 lines, uniform height) */}
                <p className="text-stone-500 text-[11px] sm:text-xs line-clamp-2 leading-snug mb-3.5 text-center min-h-[2rem]">
                  {item.description}
                </p>

                {/* Price & ADD Action (Pinned at Bottom) */}
                <div className="w-full pt-2.5 border-t border-stone-100 flex items-center justify-between mt-auto flex-none">
                  <span className="text-xs sm:text-sm font-extrabold text-[#1B3B2B]">
                    {currency}{displayPrice}
                  </span>

                  <button
                    onClick={() => addToCart(item._id, defaultType)}
                    className="px-3.5 py-1.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>ADD</span>
                    <span className="text-xs leading-none">+</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BestsellerSection;
