"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { ShopContext } from "../contexts/ShopContext";
import { getPublicMenuItem } from "../lib/api";
import RelatedProducts from "./RelatedProducts";
import ImageLightbox from "./ImageLightbox";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

export default function ProductDetailClient({ initialProduct, productId }) {
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(initialProduct || null);
  const [selectedVariant, setSelectedVariant] = useState("full");
  const [loading, setLoading] = useState(!initialProduct);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  useEffect(() => {
    let active = true;

    // If initialProduct was already provided by server, use it
    if (initialProduct) {
      setProductData(initialProduct);
      setLoading(false);
      return;
    }

    // First check in ShopContext products
    if (Array.isArray(products) && products.length > 0) {
      const found = products.find((item) => item._id === productId);
      if (found) {
        setProductData(found);
        setLoading(false);
        return;
      }
    }

    // Otherwise fetch directly from backend API
    if (productId) {
      setLoading(true);
      getPublicMenuItem(productId)
        .then((item) => {
          if (active) {
            setProductData(item);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [productId, products, initialProduct]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-hero text-2xl font-bold text-[#1B3B2B] mb-2">
          Dish Not Found
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          The requested menu item may have been removed or is temporarily unavailable.
        </p>
        <Link
          href="/orderanddine"
          className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  const imageUrl = productData.image?.url || productData.images?.[0] || FALLBACK_IMG;
  const isAvailable = productData.isAvailable !== false;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-4 sm:pt-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
      {/* Navigation Breadcrumb */}
      <div className="mb-3 sm:mb-5">
        <Link
          href="/orderanddine"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#1B3B2B] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Menu</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-12 bg-white p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs">
        {/* Dish Image */}
        <div className="w-full md:w-1/2 flex-none">
          <div
            onClick={() => setShowImageLightbox(true)}
            className="w-full aspect-4/3 sm:aspect-auto sm:h-[400px] lg:h-[450px] rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 border border-stone-100 relative shadow-2xs cursor-zoom-in group"
            title="Click to view full image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
              src={imageUrl}
              alt={`${productData.name} at Majedaar Restaurant`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
            {productData.isVeg !== undefined && (
              <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-white/95 px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-2xs border border-stone-200 pointer-events-none">
                <span className={productData.isVeg ? "text-emerald-700" : "text-rose-700"}>
                  {productData.isVeg ? "Veg" : "Non-Veg"}
                </span>
              </div>
            )}
            {productData.isBestseller && (
              <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 bg-[#C85A17] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-2xs pointer-events-none">
                ★ Bestseller
              </div>
            )}
          </div>
        </div>

        {/* Dish Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C85A17]">
                {typeof productData.category === "object"
                  ? productData.category?.name
                  : productData.category || "Menu Item"}
              </span>
            </div>

            <h1 className="font-hero text-2xl sm:text-3xl lg:text-4xl font-bold text-[#11261B] mb-2 leading-tight">
              {productData.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              {productData.ratingSummary?.reviewCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="text-amber-500">★</span>
                  <span className="font-bold text-[#11261B]">
                    {productData.ratingSummary.averageRating}
                  </span>
                  <span className="text-stone-400">
                    ({productData.ratingSummary.reviewCount} reviews)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <span className="text-stone-300">★</span> New to Menu
                </span>
              )}
            </div>

            {/* Portion Selector & Price */}
            {productData.pricingType === "half-full" ? (
              <div className="mb-4 sm:mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Select Portion
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant("half")}
                    className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      selectedVariant === "half"
                        ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-2xs"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <span>Half Portion</span>
                    <span className="font-extrabold">{currency}{productData.halfPrice}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVariant("full")}
                    className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      selectedVariant === "full"
                        ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-2xs"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <span>Full Portion</span>
                    <span className="font-extrabold">{currency}{productData.fullPrice}</span>
                  </button>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1B3B2B] mt-3 sm:mt-4">
                  {currency}
                  {selectedVariant === "half" ? productData.halfPrice : productData.fullPrice}
                </p>
              </div>
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1B3B2B] mb-4 sm:mb-6">
                {currency}
                {productData.price}
              </p>
            )}

            <div className="border-t border-b border-stone-100 py-3.5 sm:py-4 mb-5 sm:mb-6">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {productData.description || "Prepared fresh with premium ingredients."}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-5 sm:mb-6">
              {isAvailable ? (
                <button
                  type="button"
                  onClick={() =>
                    addToCart(
                      productData._id,
                      productData.pricingType === "half-full" ? selectedVariant : "single"
                    )
                  }
                  className="w-full sm:w-auto min-h-[46px] sm:min-h-[48px] px-8 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Add to Order</span>
                  <span className="text-sm font-bold">+</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto min-h-[46px] px-8 py-3.5 rounded-full bg-stone-200 text-stone-400 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-not-allowed text-center"
                >
                  Currently Unavailable
                </button>
              )}
            </div>

            <div className="text-xs text-stone-500 space-y-1.5">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-none" />
                Freshly prepared upon order
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-none" />
                Fast delivery within Faizabad / Ayodhya zone
              </p>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts
        category={productData.category}
        currentId={productData._id}
      />

      {/* Image Lightbox Viewer */}
      {showImageLightbox && (
        <ImageLightbox
          item={{
            ...productData,
            image: { url: imageUrl },
          }}
          onClose={() => setShowImageLightbox(false)}
        />
      )}
    </div>
  );
}
