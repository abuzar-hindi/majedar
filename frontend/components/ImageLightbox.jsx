"use client";

import { useEffect } from "react";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

export default function ImageLightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const imageUrl =
    item.image?.url ||
    (Array.isArray(item.images) ? item.images[0] : null) ||
    (typeof item.image === "string" ? item.image : null) ||
    FALLBACK_IMG;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name || "Food"} photo viewer`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] flex flex-col bg-[#11261B] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900/90 text-white border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0 pr-3">
            {item.isVeg !== undefined && (
              <span
                className={`w-2.5 h-2.5 rounded-full flex-none ${
                  item.isVeg ? "bg-emerald-400" : "bg-rose-500"
                }`}
                title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
              />
            )}
            <h3 className="font-bold text-sm sm:text-base text-stone-100 truncate">
              {item.name || "Dish Photo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-none p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            aria-label="Close image popup"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Clean Image Viewer Container */}
        <div className="relative flex items-center justify-center bg-black/95 p-2 sm:p-4 min-h-[220px] max-h-[72vh] sm:max-h-[75vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={item.name ? `${item.name} at Majedaar Restaurant` : "Food item"}
            className="max-h-[68vh] sm:max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-lg select-none"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        </div>
      </div>
    </div>
  );
}
