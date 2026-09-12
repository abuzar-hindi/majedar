import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    setCartItems,
    navigate,
  } = useContext(ShopContext);
  const [cardData, setCardData] = useState([]);

  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
  };

  useEffect(() => {
    const tempData = [];

    if (products.length > 0) {
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item]) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCardData(tempData);
    }
  }, [cartItems, products]);

  const getImg = (productData) =>
    productData?.images?.[0] ||
    assets.placeholder_food ||
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="min-h-[80vh] bg-[#FAF8F5] pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200">
          <div>
            <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B]">
              Your Cart
            </h1>
          </div>

          {cardData.length > 0 && (
            <button
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3.5 py-1.5 rounded-full border border-stone-300 bg-white transition-colors"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Item Cards */}
        {cardData.length > 0 ? (
          <div className="space-y-3.5 mb-10">
            {cardData.map((item, index) => {
              const productData = products.find(
                (product) => product._id === item._id
              );
              if (!productData) return null;

              const typeObj = productData.types?.find(
                (t) => t.label === item.size
              );
              const price = typeObj?.price || productData.price || 0;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 flex-none border border-stone-100">
                      <img
                        className="w-full h-full object-cover"
                        src={getImg(productData)}
                        alt={productData.name}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#11261B]">
                        {productData.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-extrabold text-[#1B3B2B]">
                          {currency}{price}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                          {item.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                    <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-stone-200 rounded-full px-2 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.size, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-full bg-white text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold text-sm border border-stone-200 transition-colors shadow-2xs"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-[#1B3B2B] min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.size, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-full bg-[#1B3B2B] text-white hover:bg-[#11261B] flex items-center justify-center font-bold text-sm transition-colors shadow-2xs"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm sm:text-base text-[#1B3B2B]">
                        {currency}{price * item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                        className="p-2 text-stone-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center my-6">
            <svg className="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="font-bold text-base text-stone-700 mb-1">Your cart is empty</h3>
            <p className="text-xs text-stone-400 mb-6">Explore our menu and add delicious dishes to get started.</p>
            <button
              onClick={() => navigate("/orderanddine")}
              className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all"
            >
              Browse Menu
            </button>
          </div>
        )}

        {/* Order Summary & Checkout Action */}
        {cardData.length > 0 && (
          <div className="flex justify-end">
            <div className="w-full sm:w-[420px] bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs">
              <CartTotal />
              <div className="mt-6 pt-4 border-t border-stone-100">
                <button
                  onClick={() => navigate("/place-order")}
                  className="w-full py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
