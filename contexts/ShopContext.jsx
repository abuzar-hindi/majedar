"use client";

import { createContext, useEffect, useState } from "react";
import { products as productsFromAssets } from "../lib/data/assets";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "\u20b9";
  const deliveryFee = 100;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");

  const router = useRouter();

  // Navigate helper — mirrors Vite version API so all components work unchanged
  const navigate = (path) => router.push(path);

  const addToCart = (itemId, type) => {
    if (!type) {
      toast.error("Select type!");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][type] = (cartData[itemId][type] || 0) + 1;
    } else {
      cartData[itemId] = { [type]: 1 };
    }

    setCartItems(cartData);
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    try {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        const productName = product.name || product.title || "Item";
        toast(`${productName} added to order`, {
          icon: false,
          autoClose: 1800,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      // ignore toast errors
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const getCartCounts = () => {
    let totalCounts = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCounts += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCounts;
  };

  const updateQuantity = (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity <= 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
      }
    } else {
      if (!cartData[itemId]) cartData[itemId] = {};
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);
    localStorage.setItem("cartItems", JSON.stringify(cartData));
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product || !product.types) continue;

      for (const typeLabel in cartItems[productId]) {
        const quantity = cartItems[productId][typeLabel];
        if (quantity <= 0) continue;

        const typeObj = product.types.find((t) => t.label === typeLabel);
        if (typeObj) {
          totalAmount += typeObj.price * quantity;
        }
      }
    }

    return totalAmount;
  };

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const [products] = useState(productsFromAssets);

  const value = {
    products,
    currency,
    deliveryFee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCounts,
    updateQuantity,
    getCartAmount,
    setCartItems,
    navigate,
    token,
    setToken,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

