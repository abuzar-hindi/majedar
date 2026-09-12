"use client";
import { useContext, useState } from "react";
import Link from "next/link";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../lib/data/assets";

const MenuPreview = ({ selectedCategory = "All" }) => {
  const { products, currency, addToCart, search } = useContext(ShopContext);
  const [selectedTypeMap, setSelectedTypeMap] = useState({});

  const previewProducts = Array.isArray(products)
    ? products
        .filter((item) => {
          if (search && search.trim() !== "") {
            const q = search.toLowerCase().trim();
            return (
              item.name?.toLowerCase().includes(q) ||
              item.category?.toLowerCase().includes(q)
            );
          }
          if (!selectedCategory || selectedCategory === "All") return true;
          return (item.category || "").toLowerCase().includes(selectedCategory.toLowerCase());
        })
        .slice(0, 6)
    : [];

  const getImg = (item) =>
    item.images?.[0] ||
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80";

  return (
    <section className="w-full bg-[#FAF8F5] py-10 sm:py-16 border-b border-stone-200/60" id="homepage-menu-preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200/80">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B] tracking-tight">
              Explore Our Menu
            </h2>
          </div>
          <Link
            href="/orderanddine"
            className="text-xs font-bold text-[#1B3B2B] hover:text-[#C85A17] uppercase tracking-wider flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
          >
            <span>View Full Menu</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {previewProducts.map((item) => {
            const defaultType =
              selectedTypeMap[item._id] || (item.types && item.types[0]?.label) || "Full";
            const displayPrice = item.types?.[0]?.price || item.price || 0;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 hover:border-stone-300 transition-all flex items-center gap-4 justify-between min-h-[110px]"
              >
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden flex-none bg-stone-100 border border-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImg(item)}
                    alt={`${item.name} at Majedar Restaurant`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-bold text-sm text-[#11261B] truncate mb-0.5">{item.name}</h3>
                    <p className="text-stone-400 text-xs line-clamp-1 mb-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-extrabold text-[#1B3B2B]">{currency}{displayPrice}</span>
                    <button
                      onClick={() => addToCart(item._id, defaultType)}
                      className="px-3.5 py-1.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                    >
                      <span>ADD</span>
                      <span className="text-xs">+</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link href="/orderanddine">
            <button className="px-8 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs inline-flex items-center gap-2">
              <span>View Full Menu &amp; Order</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MenuPreview;
