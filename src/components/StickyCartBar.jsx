import React, { useContext } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { useLocation } from "react-router-dom";

const StickyCartBar = () => {
  const { getCartCounts, getCartAmount, currency, deliveryFee, navigate } =
    useContext(ShopContext);
  const location = useLocation();

  const cartCount = getCartCounts();
  const cartSubtotal = getCartAmount();

  // Hide sticky bar if cart is empty or if user is already on cart / checkout pages
  if (
    cartCount === 0 ||
    location.pathname === "/cart" ||
    location.pathname === "/place-order"
  ) {
    return null;
  }

  const totalAmount = cartSubtotal + (cartSubtotal > 0 ? deliveryFee : 0);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none transition-all duration-300">
      <div className="max-w-xl mx-auto pointer-events-auto bg-[#1B3B2B] text-white rounded-full shadow-lg p-2 sm:p-2.5 pl-5 pr-2.5 flex items-center justify-between border border-stone-700/40">
        {/* Left: Item Count & Total Amount */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide">
          <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-white font-bold text-xs">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-white font-extrabold text-sm sm:text-base">
            {currency}{totalAmount}
          </span>
        </div>

        {/* Right: View Cart Action */}
        <button
          onClick={() => navigate("/cart")}
          className="px-5 py-2 rounded-full bg-[#C85A17] hover:bg-[#B04B0F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
        >
          <span>View Cart</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StickyCartBar;
