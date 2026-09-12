import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";

import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [type, setType] = useState("");

  const fetchProductData = () => {
    if (!Array.isArray(products)) return;

    const found = products.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.images?.[0] || "");
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);
  {
    /* The effect (fetchProductData) will only run when either productId or products changes. */
  }

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* ------------------------- Product Data -------------------------  */}
      <div className="flex flex-col sm:flex-row gap-12 sm:gap-12">
        {/* ------------------------- Product Image -------------------------  */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3 ">
          <div className="flex sm:flex-col overflow-x-auto  gap-2 sm:w-[18.7%] w-full">
            {productData.images?.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 object-cover cursor-pointer"
                alt=""
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img className="w-full h-[300px] object-cover md:h-[500px]" src={image} alt="" />
          </div>
        </div>

        {/* ------------------------- Product Info -------------------------  */}
        <div className="flex-1">
          <h1 className="font-medium text-4xl mt-2">{productData.name}</h1>

          <p className="text-xl md:text-xl mt-3 font-medium">
            {productData.types?.length === 1 &&
              `${productData.types[0].label}: ${currency}${productData.types[0].price}`}

            {productData.types?.length > 1 &&
              productData.types
                .map((t) => `${t.label}: ${currency}${t.price}`)
                .join(" | ")}
          </p>

          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>

          {productData.types?.length > 0 && (
            <div className="flex flex-col gap-4 my-8">
              <p>Select Type</p>

              <div className="flex gap-2">
                {productData.types.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setType(item)}
                    className={`py-2 px-4 border bg-gray-100 ${
                      type?.label === item.label ? "border-orange-500" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={!type}
            onClick={() => addToCart(productData._id, type.label)}
            className="bg-black text-white py-3 px-8 disabled:opacity-50"
          >
            ADD
          </button>

          <hr className="mt-8 sm:w-3/5" />

          <div className="flex flex-col mt-8 gap-1 text-sm text-gray-500">
            <p>100% Original product.</p>
            <p>Cash delivery is availableon this Product.</p>
            <p>Easy return & exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ----------------------- Description and Review Section ----------------------- */}

      <div className="mt-20">
        <div className="flex">
          <b className="border text-sm px-5 py-3">Description</b>
          <p className="border text-sm px-5 py-3">Reviews (122)</p>
        </div>
        <div className="flex flex-col border px-6 py-6 gap-4 text-sm text-gray-500">
          <p>
            Discover a rich variety of delicious dishes prepared with fresh ingredients and authentic flavors. From classic favorites to chef’s special recipes, every item on our menu is crafted to deliver great taste and quality. Whether you’re dining in, ordering for takeaway, or choosing home delivery, we ensure a satisfying food experience every time.
          </p>
          <p>
            Enjoy hygienic preparation, quick service, and a warm dining atmosphere. Perfect for family meals, casual outings, and special gatherings.
          </p>
        </div>
      </div>

      {/* ----------------------- Display Related Products ----------------------- */}

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
