"use client";

import { useContext, useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShopContext } from "../../contexts/ShopContext";
import ImageLightbox from "../../components/ImageLightbox";

const DEFAULT_CATEGORIES = [
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

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

function OrderAndDineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const { products, categories, currency, addToCart, search, setSearch, loading } =
    useContext(ShopContext);

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVariants, setSelectedVariants] = useState({});
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const setItemVariant = (itemId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: variant }));
  };

  const categoryList = useMemo(() => {
    if (categories && categories.length > 0) {
      return ["All", ...categories.map((c) => c.name)];
    }
    return DEFAULT_CATEGORIES;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((item) => {
      const catName = typeof item.category === "object" ? item.category?.name : item.category;

      if (search && search.trim() !== "") {
        const query = search.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = (catName || "").toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }

      if (activeCategory === "All") return true;

      const catLower = activeCategory.toLowerCase().trim();
      const itemCatLower = (catName || "").toLowerCase().trim();
      return itemCatLower === catLower || itemCatLower.includes(catLower);
    });
  }, [products, activeCategory, search]);

  const getImg = (item) => item.image?.url || item.images?.[0] || FALLBACK_IMG;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Header Title & Search */}
      <div className="bg-white border-b border-stone-200/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <h1 className="font-hero text-3xl sm:text-4xl font-extrabold text-[#1B3B2B]">
            Majedaar Menu
          </h1>
        </div>
        <div className="max-w-md mx-auto relative">
          <svg
            className="w-4 h-4 absolute left-3.5 top-3 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Category Bar */}
      <div
        id="ordering-menu"
        className="sticky top-[65px] z-30 bg-white border-b border-stone-200/90 py-3 px-4 sm:px-6 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categoryList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
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

      {/* Menu Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
          <h2 className="font-hero text-xl sm:text-2xl font-bold text-[#1B3B2B]">
            {activeCategory === "All" ? "All Dishes" : activeCategory}
          </h2>
          <span className="text-xs font-semibold text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
            {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-stone-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Loading delicious dishes...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center my-6">
            <svg
              className="w-12 h-12 text-stone-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="font-bold text-base text-stone-700 mb-1">
              No dishes found
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Try selecting another category or clearing your search.
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-5 py-2 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((item) => {
              const isAvailable = item.isAvailable !== false;
              const isHalfFull = item.pricingType === "half-full";
              const currentVariant = isHalfFull
                ? selectedVariants[item._id] || "full"
                : "single";

              const displayPrice = isHalfFull
                ? currentVariant === "half"
                  ? item.halfPrice
                  : item.fullPrice
                : item.price || 0;

              return (
                <div
                  key={item._id}
                  onClick={() => router.push(`/product/${item._id}`)}
                  className="bg-white rounded-2xl border border-stone-200/80 p-3.5 sm:p-4 hover:border-stone-300 transition-all flex gap-4 items-center justify-between shadow-2xs group min-h-[136px] sm:min-h-[160px] cursor-pointer"
                >
                  {/* Food image (Click to enlarge in clean lightbox only - stops navigation) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxItem(item);
                    }}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden flex-none bg-stone-100 border border-stone-100 relative shadow-2xs block cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/40"
                    aria-label={`Enlarge photo of ${item.name}`}
                    title="Click to view larger image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImg(item)}
                      alt={`${item.name} at Majedaar Restaurant`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5 bg-white/95 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shadow-2xs pointer-events-none">
                      <span
                        className={
                          item.isVeg ? "text-emerald-700" : "text-rose-700"
                        }
                      >
                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                    {item.isBestseller && (
                      <div className="absolute bottom-1.5 left-1.5 bg-[#C85A17] text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs pointer-events-none">
                        ★ Bestseller
                      </div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#11261B] truncate mb-0.5">
                        <span className="group-hover:text-[#C85A17] transition-colors">
                          {item.name}
                        </span>
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] mb-1">
                        {item.ratingSummary?.reviewCount > 0 ? (
                          <>
                            <span className="text-amber-500">★</span>
                            <span className="font-bold text-[#11261B]">
                              {item.ratingSummary.averageRating}
                            </span>
                            <span className="text-stone-400">
                              · {item.ratingSummary.reviewCount}
                            </span>
                          </>
                        ) : (
                          <span className="text-stone-400 flex items-center gap-1 text-[10px]">
                            <span className="text-stone-300">★</span> New
                          </span>
                        )}
                      </div>
                      <p className="text-stone-400 text-[11px] sm:text-xs line-clamp-2 mb-2 leading-snug">
                        {item.description}
                      </p>

                      {/* Half / Full Variant Selector */}
                      {isHalfFull && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemVariant(item._id, "half");
                            }}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                              currentVariant === "half"
                                ? "bg-[#1B3B2B] text-white border-[#1B3B2B]"
                                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            Half: {currency}{item.halfPrice}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemVariant(item._id, "full");
                            }}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                              currentVariant === "full"
                                ? "bg-[#1B3B2B] text-white border-[#1B3B2B]"
                                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            Full: {currency}{item.fullPrice}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs sm:text-sm font-extrabold text-[#1B3B2B]">
                        {currency}
                        {displayPrice}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item._id, currentVariant);
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>ADD</span>
                            <span className="text-xs leading-none">+</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Image Lightbox Modal */}
      {lightboxItem && (
        <ImageLightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </div>
  );
}

export default function OrderAndDine() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full" />
        </div>
      }
    >
      <OrderAndDineContent />
    </Suspense>
  );
}
