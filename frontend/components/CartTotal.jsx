"use client";

import { useContext } from "react";
import { ShopContext } from "../contexts/ShopContext";
import Title from "./Title";

const CartTotal = ({ customDeliveryFee = null }) => {
  const { currency, deliveryFee, selectedDeliveryTier, getCartAmount } =
    useContext(ShopContext);

  const subtotal = getCartAmount();
  const gst = subtotal > 0 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const effectiveDeliveryFee =
    typeof customDeliveryFee === "number"
      ? customDeliveryFee
      : subtotal > 0
        ? deliveryFee
        : 0;
  const grandTotal = subtotal > 0 ? subtotal + gst + effectiveDeliveryFee : 0;

  const tierLabel = selectedDeliveryTier?.label
    ? ` (${selectedDeliveryTier.label})`
    : "";

  return (
    <div className="w-full">
      <div className="text-xl sm:text-2xl font-bold">
        <Title text1={"BILLING"} text2={"SUMMARY"} />
      </div>
      <div className="flex flex-col gap-2.5 mt-3 text-xs sm:text-sm">
        <div className="flex justify-between text-stone-600">
          <p>Items Subtotal</p>
          <p className="font-semibold text-stone-800">
            {currency}{subtotal.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between text-stone-600">
          <p>GST (5% on items)</p>
          <p className="font-semibold text-stone-800">
            {currency}{gst.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between text-stone-600">
          <p>Delivery Fee{tierLabel}</p>
          <p className="font-semibold text-stone-800">
            {currency}{effectiveDeliveryFee.toFixed(2)}
          </p>
        </div>
        <hr className="border-stone-100 my-1" />
        <div className="flex justify-between font-bold text-sm sm:text-base text-[#11261B]">
          <p>Estimated Total</p>
          <p className="text-[#1B3B2B] font-extrabold text-base sm:text-lg">
            {currency}{grandTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
