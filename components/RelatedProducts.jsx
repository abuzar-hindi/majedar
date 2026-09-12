"use client";
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";

const RelatedProducts = ({ category }) => {
  const { products, currency, addToCart } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (Array.isArray(products) && category) {
      setRelated(
        products.filter((item) => item.category === category).slice(0, 5)
      );
    }
  }, [products, category]);

  if (!related.length) return null;

  return (
    <div className="mt-20">
      <h3 className="font-bold text-lg mb-4">Related Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {related.map((item) => (
          <div key={item._id} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.images?.[0]} alt={item.name} className="w-full h-24 object-cover rounded-lg mb-2" />
            <p className="text-xs font-bold truncate">{item.name}</p>
            <p className="text-xs text-[#1B3B2B] font-bold">{currency}{item.types?.[0]?.price || item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
