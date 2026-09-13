"use client";
import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShopContext } from "../../../contexts/ShopContext";
import RelatedProducts from "../../../components/RelatedProducts";

export default function Product() {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (!Array.isArray(products)) return;
    const found = products.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.images?.[0] || "");
    }
  }, [productId, products]);

  if (!productData) return <div className="opacity-0 min-h-screen" />;

  return (
    <div className="border-t-2 pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row gap-12">
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col overflow-x-auto gap-2 sm:w-[18.7%] w-full">
            {productData.images?.map((item, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img onClick={() => setImage(item)} src={item} key={index} className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 object-cover cursor-pointer" alt="" />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-[300px] object-cover md:h-[500px]" src={image} alt={productData.name} />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-medium text-4xl mt-2">{productData.name}</h1>
          <p className="text-xl mt-3 font-medium">
            {productData.types?.length === 1 && `${productData.types[0].label}: ${currency}${productData.types[0].price}`}
            {productData.types?.length > 1 && productData.types.map((t) => `${t.label}: ${currency}${t.price}`).join(" | ")}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
          {productData.types?.length > 0 && (
            <div className="flex flex-col gap-4 my-8">
              <p>Select Type</p>
              <div className="flex gap-2">
                {productData.types.map((item, index) => (
                  <button key={index} onClick={() => setType(item)} className={`py-2 px-4 border bg-gray-100 ${type?.label === item.label ? "border-orange-500" : ""}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button disabled={!type} onClick={() => addToCart(productData._id, type.label)} className="bg-black text-white py-3 px-8 disabled:opacity-50">
            ADD
          </button>
          <hr className="mt-8 sm:w-3/5" />
          <div className="flex flex-col mt-8 gap-1 text-sm text-gray-500">
            <p>100% Original product.</p>
            <p>Cash delivery is available on this Product.</p>
          </div>
        </div>
      </div>
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
}