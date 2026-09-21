"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShopContext } from "../contexts/ShopContext";
import ImageLightbox from "./ImageLightbox";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const RelatedProducts = ({ category, currentId }) => {
  const router = useRouter();
  const { products, currency } = useContext(ShopContext);
  const [related, setRelated] = useState([]);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    if (Array.isArray(products) && category) {
      const catId = typeof category === "object" ? category._id || category.name : category;
      setRelated(
        products
          .filter((item) => {
            if (currentId && item._id === currentId) return false;
            const itemCat = typeof item.category === "object" ? item.category?._id || item.category?.name : item.category;
            return itemCat === catId;
          })
          .slice(0, 5)
      );
    }
  }, [products, category, currentId]);

  if (!related.length) return null;

  return (
    <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-stone-200">
      <h3 className="font-hero font-bold text-lg sm:text-xl text-[#1B3B2B] mb-4 sm:mb-6">
        You May Also Like
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {related.map((item) => {
          const isVeg = item.isVeg;
          const imgUrl = item.image?.url || item.images?.[0] || FALLBACK_IMG;

          return (
            <div
              key={item._id}
              onClick={() => router.push(`/product/${item._id}`)}
              className="bg-white rounded-2xl border border-stone-200/80 p-2.5 sm:p-3 text-center group hover:border-stone-300 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
            >
              {/* Image thumbnail button - opens clean lightbox only */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxItem(item);
                }}
                className="w-full h-24 sm:h-28 overflow-hidden rounded-xl bg-stone-100 mb-2 block relative cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/40"
                aria-label={`Enlarge photo of ${item.name}`}
                title="Click to view larger image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                {isVeg !== undefined && (
                  <div className="absolute top-1.5 left-1.5 bg-white/95 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shadow-2xs pointer-events-none">
                    <span className={isVeg ? "text-emerald-700" : "text-rose-700"}>
                      {isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>
                )}
              </button>

              <div>
                <p className="text-xs font-bold text-stone-800 truncate mb-1 group-hover:text-[#C85A17] transition-colors">
                  {item.name}
                </p>
                <p className="text-xs font-extrabold text-[#1B3B2B]">
                  {item.pricingType === "half-full"
                    ? `${currency}${item.halfPrice} - ${currency}${item.fullPrice}`
                    : `${currency}${item.price}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Food Image Lightbox */}
      {lightboxItem && (
        <ImageLightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </div>
  );
};

export default RelatedProducts;
