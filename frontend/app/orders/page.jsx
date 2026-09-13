"use client";
import { useContext } from "react";
import { ShopContext } from "../../contexts/ShopContext";
import Title from "../../components/Title";

export default function Orders() {
  const { currency } = useContext(ShopContext);

  return (
    <div className="border-t pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      <div className="mt-6 text-stone-500 text-sm">
        <p>Order history will be available once the backend is connected.</p>
      </div>
    </div>
  );
}
