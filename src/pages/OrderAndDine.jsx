import React, { useContext, useState, useMemo } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../assets/assets";

const CATEGORIES = [
  "All",
  "Breakfast",
  "South Indian",
  "Tea & Coffee",
  "Momos",
  "Maggi",
  "Chinese",
  "Pasta",
  "Rice & Biryani",
  "Burgers",
  "Sweets",
  "Dal",
  "Main Course",
  "Roti & Papad",
  "Pizza",
  "Thali",
];

const OrderAndDine = () => {
  const { products, currency, addToCart, search, setSearch } = useContext(ShopContext);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTypeMap, setSelectedTypeMap] = useState({});

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((item) => {
      // Search filter
      if (search && search.trim() !== "") {
        const query = search.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }

      // Category filter
      if (activeCategory === "All") return true;

      const catLower = activeCategory.toLowerCase().trim();
      const itemCatLower = (item.category || "").toLowerCase().trim();

      return itemCatLower.includes(catLower) || catLower.includes(itemCatLower);
    });
  }, [products, activeCategory, search]);

  const getImg = (item) =>
    item.images?.[0] ||
    assets.placeholder_food ||
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* 1. Header Title & Top Search */}
      <div className="bg-white border-b border-stone-200/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
            Majedaar Restaurant
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B]">
            Full Restaurant Menu
          </h1>
        </div>

        {/* Compact Toast-style Search Bar */}
        <div className="max-w-md mx-auto relative">
          <svg
            className="w-4 h-4 absolute left-3.5 top-3 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes, cuisines..."
            className="w-full pl-10 pr-8 py-2.5 bg-[#FAF8F5] text-stone-800 text-xs sm:text-sm placeholder-stone-400 border border-stone-200/90 rounded-full focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sticky Horizontal Category Navigation Bar */}
      <div className="sticky top-[65px] z-30 bg-white border-b border-stone-200/90 py-3 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                  isActive
                    ? "bg-[#1B3B2B] text-white shadow-2xs"
                    : "text-stone-600 hover:text-[#1B3B2B] hover:bg-stone-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Menu Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B3B2B]">
            {activeCategory === "All" ? "All Dishes" : activeCategory}
          </h2>
          <span className="text-xs font-semibold text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
            {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Compact Scannable List Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((item) => {
            const defaultType =
              selectedTypeMap[item._id] ||
              (item.types && item.types[0]?.label) ||
              "Full";
            const selectedTypeObj = item.types?.find((t) => t.label === defaultType);
            const displayPrice = selectedTypeObj ? selectedTypeObj.price : (item.price || 0);

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-stone-200/80 p-3.5 hover:border-stone-300 transition-all flex gap-3.5 items-center justify-between shadow-2xs"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-none bg-stone-100 border border-stone-100 relative">
                  <img
                    src={getImg(item)}
                    alt={`${item.name} at Majedaar Restaurant`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-1 left-1 bg-white/95 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                    <span className={item.isVeg ? "text-emerald-700" : "text-rose-700"}>
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#11261B] truncate mb-0.5">
                      {item.name}
                    </h3>
                    <p className="text-stone-400 text-[11px] line-clamp-2 mb-2 leading-tight">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs sm:text-sm font-extrabold text-[#1B3B2B]">
                      {currency}{displayPrice}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.types && item.types.length > 1 && (
                        <select
                          value={defaultType}
                          onChange={(e) =>
                            setSelectedTypeMap({
                              ...selectedTypeMap,
                              [item._id]: e.target.value,
                            })
                          }
                          className="text-[11px] bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-700 focus:outline-none"
                        >
                          {item.types.map((t) => (
                            <option key={t.label} value={t.label}>
                              {t.label} (₹{t.price})
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        onClick={() => addToCart(item._id, defaultType)}
                        className="px-3.5 py-1.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <span>ADD</span>
                        <span className="text-xs leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderAndDine;
