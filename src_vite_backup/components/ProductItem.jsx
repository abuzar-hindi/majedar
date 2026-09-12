import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";

const ProductItem = ({ id, images, name, types }) => {
  const { currency, addToCart } = useContext(ShopContext);
  const [openType, setOpenType] = useState(false);

  const getPriceDisplay = () => {
    if (!types || types.length === 0) return "";

    if (types.length === 1) {
      return `${types[0].label}: ${currency}${types[0].price}`;
    }

    return types.map((t) => `${t.label}: ${currency}${t.price}`).join(" | ");
  };

  return (
    <Link className="text-gray-800 cursor-pointer" to={`/product/${id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-300">
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
            src={images?.[0]}
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{name}</h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{getPriceDisplay()}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">{types?.length || 0} option{types?.length > 1 ? 's' : ''}</div>

            <div className="relative">
              {openType && (
                <div
                  onClick={(e) => e.preventDefault()}
                  className="absolute right-0 bottom-10 z-20 w-max bg-white rounded-xl shadow-md p-2 grid grid-cols-1 gap-2 border"
                >
                  {types.map((item, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(id, item.label);
                        setOpenType(false);
                      }}
                      className="px-4 py-2 rounded-md text-sm bg-gradient-to-r from-gray-800 to-black text-white hover:opacity-90 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenType(!openType);
                }}
                className="inline-flex items-center justify-center rounded-full bg-orange-500 text-white w-9 h-9 shadow-md hover:bg-orange-600 transition"
                aria-label="Add"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ProductItem);
