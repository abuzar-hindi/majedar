"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getPublicMenu, getCategories } from "../lib/api";

export const ShopContext = createContext();

export const DELIVERY_TIERS = [
  { id: "tier1", label: "0–3 km", fee: 15 },
  { id: "tier2", label: "3–5 km", fee: 30 },
];

const ShopContextProvider = (props) => {
  const currency = "\u20b9";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDeliveryTier, setSelectedDeliveryTier] = useState(DELIVERY_TIERS[0]);
  const deliveryFee = selectedDeliveryTier?.fee || 15;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});

  // Navigate helper — matches existing component usage
  const navigate = (path) => router.push(path);

  // Fetch real menu and categories from backend
  const fetchShopData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menuData, categoryData] = await Promise.all([
        getPublicMenu(),
        getCategories(),
      ]);
      setProducts(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      setError("Failed to load menu. Please refresh the page.");
      toast.error("Unable to load latest menu items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  // Load and sanitize cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const normalized = {};

        // Migrate from legacy nested format { id: { Full: 1 } } to { id: 1 } if needed
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === "number" && value > 0) {
            normalized[key] = value;
          } else if (typeof value === "object" && value !== null) {
            const sum = Object.values(value).reduce((acc, q) => acc + (Number(q) || 0), 0);
            if (sum > 0) normalized[key] = sum;
          }
        }
        setCartItems(normalized);
      }
    } catch {
      setCartItems({});
    }
  }, []);

  const saveCart = (newCart) => {
    setCartItems(newCart);
    try {
      localStorage.setItem("cartItems", JSON.stringify(newCart));
    } catch {
      // ignore storage errors
    }
  };

  const addToCart = (itemId, variantOrQty = "single", quantity = 1) => {
    const product = products.find((p) => p._id === itemId);

    // Prevent adding unavailable items
    if (product && product.isAvailable === false) {
      toast.error(`"${product.name}" is currently unavailable.`);
      return;
    }

    let variant = "single";
    let addQty = 1;

    if (typeof variantOrQty === "string") {
      variant = variantOrQty;
      addQty = typeof quantity === "number" ? Math.max(1, quantity) : 1;
    } else if (typeof variantOrQty === "number") {
      addQty = Math.max(1, variantOrQty);
      if (typeof quantity === "string") {
        variant = quantity;
      }
    }

    // Enforce variant validity against pricingType
    if (product?.pricingType === "half-full") {
      if (variant !== "half" && variant !== "full") {
        variant = "half";
      }
    } else {
      variant = "single";
    }

    const cartKey = `${itemId}__${variant}`;
    const updated = { ...cartItems };
    updated[cartKey] = (updated[cartKey] || 0) + addQty;

    saveCart(updated);

    if (product) {
      const variantLabel = variant !== "single" ? ` (${variant.toUpperCase()})` : "";
      toast(`${product.name}${variantLabel} added to order`, {
        icon: false,
        autoClose: 1800,
        hideProgressBar: true,
      });
    }
  };

  const updateQuantity = (keyOrId, param2, param3) => {
    let newQty = 0;
    if (typeof param2 === "number") {
      newQty = param2;
    } else if (typeof param3 === "number") {
      newQty = param3;
    }

    const updated = { ...cartItems };
    let targetKey = keyOrId;
    if (updated[targetKey] === undefined && updated[`${keyOrId}__single`] !== undefined) {
      targetKey = `${keyOrId}__single`;
    }

    if (newQty <= 0) {
      delete updated[targetKey];
      delete updated[keyOrId];
    } else {
      updated[targetKey] = newQty;
    }

    saveCart(updated);
  };

  const getCartCounts = () => {
    let total = 0;
    for (const key in cartItems) {
      if (typeof cartItems[key] === "number" && cartItems[key] > 0) {
        total += cartItems[key];
      }
    }
    return total;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const key in cartItems) {
      const qty = cartItems[key];
      if (qty > 0) {
        const [id, variant = "single"] = key.split("__");
        const product = products.find((p) => p._id === id);
        if (product) {
          let unitPrice = 0;
          if (product.pricingType === "half-full") {
            unitPrice = variant === "half" ? (product.halfPrice || 0) : (product.fullPrice || 0);
          } else {
            unitPrice = product.price || 0;
          }
          totalAmount += unitPrice * qty;
        }
      }
    }
    return totalAmount;
  };

  const clearCart = () => {
    setCartItems({});
    try {
      localStorage.removeItem("cartItems");
    } catch {}
  };

  const value = {
    products,
    categories,
    loading,
    error,
    refreshMenu: fetchShopData,
    currency,
    deliveryFee,
    selectedDeliveryTier,
    setSelectedDeliveryTier,
    deliveryTiers: DELIVERY_TIERS,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCounts,
    updateQuantity,
    getCartAmount,
    setCartItems: saveCart,
    clearCart,
    navigate,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
