"use client";

import { useContext, useCallback, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShopContext } from "../../contexts/ShopContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPublicDeliveryZones,
  createOrder,
  createPayment,
  verifyPayment,
  getCustomerAddresses,
} from "../../lib/api";
import { useRazorpay } from "../../hooks/useRazorpay";
import CartTotal from "../../components/CartTotal";
import { toast } from "react-toastify";

const PREDEFINED_INSTRUCTIONS = [
  "Call on arrival",
  "Leave at the gate",
  "Don't ring the bell",
  "Other",
];

export default function PlaceOrder() {
  const router = useRouter();
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const {
    cartItems,
    products,
    getCartAmount,
    clearCart,
  } = useContext(ShopContext);

  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const { openRazorpay } = useRazorpay();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    deliveryInstructions: "Call on arrival",
    deliveryInstructionOther: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const applySavedAddress = useCallback((addr) => {
    if (!addr) return;
    setFormData((prev) => ({
      ...prev,
      firstName: addr.firstName || prev.firstName,
      lastName: addr.lastName || prev.lastName,
      email: addr.email || prev.email || customer?.email || "",
      phone: addr.phone || prev.phone || customer?.phone || "",
      address: addr.address || "",
      area: addr.area || "",
      landmark: addr.landmark || "",
      deliveryInstructions: addr.deliveryInstructions || "Call on arrival",
      deliveryInstructionOther: addr.deliveryInstructionOther || "",
    }));
    if (addr.deliveryZoneId) {
      setSelectedZoneId(addr.deliveryZoneId);
    }
  }, [customer]);

  // Pre-fill authenticated customer details if available
  useEffect(() => {
    if (customer) {
      const parts = (customer.name || "").split(" ");
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
      }));
    }
  }, [customer]);

  // Load saved customer addresses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getCustomerAddresses()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            setSavedAddresses(list);
            const def = list.find((a) => a.isDefault) || list[0];
            if (def) {
              setSelectedAddressId(def._id);
              applySavedAddress(def);
            }
          }
        })
        .catch(() => { });
    }
  }, [isAuthenticated, applySavedAddress]);

  // Load active delivery zones
  useEffect(() => {
    let active = true;
    getPublicDeliveryZones()
      .then((data) => {
        if (active) {
          const zoneList = Array.isArray(data) ? data : [];
          setZones(zoneList);
          if (zoneList.length > 0) {
            setSelectedZoneId(zoneList[0]._id);
          }
          setLoadingZones(false);
        }
      })
      .catch(() => {
        if (active) setLoadingZones(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Group zones by distance tier: 0-3km and 3-5km
  const groupedZones = useMemo(() => {
    const tier1 = [];
    const tier2 = [];
    for (const zone of zones) {
      if (zone.type === "0-3km" || zone.deliveryFee <= 15) {
        tier1.push(zone);
      } else {
        tier2.push(zone);
      }
    }
    return { tier1, tier2 };
  }, [zones]);

  const selectedZone = useMemo(() => {
    return zones.find((z) => z._id === selectedZoneId) || null;
  }, [zones, selectedZoneId]);

  const currentDeliveryFee = selectedZone?.deliveryFee ?? 15;

  const orderItems = useMemo(() => {
    const items = [];
    for (const cartKey in cartItems) {
      const qty = cartItems[cartKey];
      if (qty > 0) {
        const [itemId, variant = "single"] = cartKey.split("__");
        items.push({ menuItem: itemId, variant, quantity: qty });
      }
    }
    return items;
  }, [cartItems]);

  const isCartEmpty = orderItems.length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (orderError) setOrderError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderError("");

    if (!isAuthenticated) {
      setOrderError("Please sign in to place your order.");
      toast.info("Please sign in to continue with checkout.");
      router.push("/login?redirect=/place-order");
      return;
    }

    if (isCartEmpty) {
      setOrderError("Your cart is empty. Please add dishes to order.");
      return;
    }

    if (!selectedZoneId) {
      setOrderError("Please select a delivery area.");
      return;
    }

    if (
      formData.deliveryInstructions === "Other" &&
      !formData.deliveryInstructionOther.trim()
    ) {
      setOrderError("Please specify your delivery instructions.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: orderItems,
        deliveryZoneId: selectedZoneId,
        orderType: "delivery",
        paymentMethod: paymentMethod, // "razorpay" | "cod"
        deliveryAddress: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          landmark: formData.landmark.trim() || undefined,
          area: selectedZone?.name || undefined,
          deliveryZoneId: selectedZoneId,
          deliveryInstructions: formData.deliveryInstructions,
          deliveryInstructionOther:
            formData.deliveryInstructions === "Other"
              ? formData.deliveryInstructionOther.trim()
              : undefined,
        },
      };

      const created = await createOrder(payload);
      const orderId = created?._id || created?.id;

      if (!orderId) {
        throw new Error("Order was placed but no order ID was returned.");
      }

      // 1. Cash on Delivery Flow
      if (paymentMethod === "cod") {
        clearCart();
        toast.success("Order placed successfully with Cash on Delivery!", { autoClose: 3000 });
        router.push(`/my-orders/${orderId}`);
        setSubmitting(false);
        return;
      }

      // 2. Razorpay Online Secured Payment Flow
      try {
        const checkoutConfig = await createPayment(orderId);

        openRazorpay(
          {
            ...checkoutConfig,
            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
            customerEmail: formData.email.trim(),
            customerPhone: formData.phone.trim(),
          },
          {
            onSuccess: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
              try {
                await verifyPayment({
                  razorpayOrderId,
                  razorpayPaymentId,
                  razorpaySignature,
                });
                clearCart();
                toast.success("Payment successful! Your order has been placed.", { autoClose: 4000 });
                router.push(`/my-orders/${orderId}`);
              } catch (vErr) {
                toast.error(
                  vErr?.message || "Payment verification failed. Please check your orders."
                );
                router.push(`/my-orders/${orderId}`);
              } finally {
                setSubmitting(false);
              }
            },
            onFailure: (failErr) => {
              toast.error(failErr?.message || "Payment failed. You can retry from My Orders.");
              router.push(`/my-orders/${orderId}`);
              setSubmitting(false);
            },
            onDismiss: () => {
              toast.info("Payment cancelled. Your order is saved — you can pay anytime from My Orders.");
              router.push(`/my-orders/${orderId}`);
              setSubmitting(false);
            },
          }
        );
      } catch (payErr) {
        toast.warn("Order was placed, but payment window could not open. You can pay anytime from My Orders.");
        router.push(`/my-orders/${orderId}`);
        setSubmitting(false);
      }
    } catch (err) {
      const message =
        err?.message || "Failed to place your order. Please check your details.";
      setOrderError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all";

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Unauthenticated Banner */}
        {!authLoading && !isAuthenticated && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Account Required for Checkout
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Sign in to save your delivery address, track food live, and earn customer rewards.
              </p>
            </div>
            <Link
              href="/login?redirect=/place-order"
              className="self-start sm:self-auto px-5 py-2 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all"
            >
              Sign In / Register
            </Link>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row justify-between gap-8"
        >
          {/* Delivery Details Column */}
          <div className="flex-1 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
            <div className="mb-6 pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
                Step 1 of 2
              </span>
              <h2 className="font-hero text-2xl font-bold text-[#1B3B2B]">
                Delivery Details
              </h2>
            </div>

            {orderError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                {orderError}
              </div>
            )}

            {/* Saved Addresses Quick Selection */}
            {savedAddresses.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-[#1B3B2B] uppercase tracking-wider">
                    Select from Saved Addresses
                  </span>
                  <Link
                    href="/my-profile"
                    className="text-[11px] font-bold text-[#C85A17] hover:underline"
                  >
                    Manage Addresses →
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(addr._id);
                          applySavedAddress(addr);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer flex items-center gap-1.5 border ${isSelected
                          ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-2xs"
                          : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                          }`}
                      >
                        <span className="font-bold">{addr.label || "Address"}:</span>
                        <span className="font-normal truncate max-w-[130px] sm:max-w-[170px]">
                          {addr.address}
                        </span>
                        {addr.isDefault && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${isSelected ? "bg-white/20 text-white" : "bg-[#E3EFE8] text-[#1B3B2B]"
                              }`}
                          >
                            Default
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId("");
                      setFormData((p) => ({
                        ...p,
                        address: "",
                        landmark: "",
                        deliveryInstructions: "Call on arrival",
                        deliveryInstructionOther: "",
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${selectedAddressId === ""
                      ? "bg-[#1B3B2B] text-white border-[#1B3B2B]"
                      : "bg-white text-stone-500 border-dashed border-stone-300 hover:text-stone-800"
                      }`}
                  >
                    + New Address
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    onChange={handleChange}
                    name="firstName"
                    value={formData.firstName}
                    className={inputClass}
                    type="text"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Last Name *
                  </label>
                  <input
                    onChange={handleChange}
                    name="lastName"
                    value={formData.lastName}
                    className={inputClass}
                    type="text"
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    onChange={handleChange}
                    name="email"
                    value={formData.email}
                    className={inputClass}
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    onChange={handleChange}
                    name="phone"
                    value={formData.phone}
                    className={inputClass}
                    type="tel"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              {/* Delivery Area Dropdown grouped by 0-3km and 3-5km */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Delivery Area (Faizabad / Ayodhya) *
                </label>
                {loadingZones ? (
                  <div className="py-2.5 px-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-400">
                    Loading delivery zones...
                  </div>
                ) : (
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    required
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select your delivery area
                    </option>
                    {groupedZones.tier1.length > 0 && (
                      <optgroup label="0–3 KM Zone (₹15 Delivery Fee)">
                        {groupedZones.tier1.map((zone) => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {groupedZones.tier2.length > 0 && (
                      <optgroup label="3–5 KM Zone (₹30 Delivery Fee)">
                        {groupedZones.tier2.map((zone) => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
                <p className="text-[11px] text-stone-400 mt-1">
                  Delivery fee is automatically determined by your selected area.
                </p>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  House / Flat / Street Address *
                </label>
                <input
                  onChange={handleChange}
                  name="address"
                  value={formData.address}
                  className={inputClass}
                  type="text"
                  placeholder="House/Flat No., Building, Street Name"
                  required
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Nearby Landmark (Optional)
                </label>
                <input
                  onChange={handleChange}
                  name="landmark"
                  value={formData.landmark}
                  className={inputClass}
                  type="text"
                  placeholder="Near temple, school, bank, etc."
                />
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Delivery Instructions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREDEFINED_INSTRUCTIONS.map((instruction) => {
                    const isSelected =
                      formData.deliveryInstructions === instruction;
                    return (
                      <div
                        key={instruction}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            deliveryInstructions: instruction,
                          }))
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${isSelected
                          ? "border-[#1B3B2B] bg-[#E3EFE8]/30 shadow-2xs font-semibold text-[#1B3B2B]"
                          : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                          } text-xs`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected
                            ? "border-[#1B3B2B] bg-[#1B3B2B]"
                            : "border-stone-300"
                            }`}
                        >
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span>{instruction}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom instruction input when Other is selected */}
                {formData.deliveryInstructions === "Other" && (
                  <div className="mt-3">
                    <input
                      name="deliveryInstructionOther"
                      value={formData.deliveryInstructionOther}
                      onChange={handleChange}
                      placeholder="Please enter your specific delivery instructions..."
                      required
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billing & Order Summary Column */}
          <div className="w-full lg:w-[420px] space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
              <CartTotal customDeliveryFee={currentDeliveryFee} />
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
              <div className="mb-5 pb-3 border-b border-stone-100">
                <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
                  Step 2 of 2
                </span>
                <h3 className="font-hero text-xl font-bold text-[#1B3B2B]">
                  Payment Method
                </h3>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 mb-6">
                {/* 1. Online Payment Option (Razorpay) */}
                <div
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "razorpay"
                    ? "border-[#1B3B2B] bg-[#E3EFE8]/25 shadow-2xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-none ${paymentMethod === "razorpay"
                          ? "border-[#1B3B2B] bg-[#1B3B2B]"
                          : "border-stone-300 bg-white"
                          }`}
                      >
                        {paymentMethod === "razorpay" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#11261B]">
                            Online Secured Payment
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                          UPI (GPay, PhonePe, Paytm), Cards, Net Banking &amp; Wallets
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex-none">
                      Instant
                    </span>
                  </div>
                </div>

                {/* 2. Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "cod"
                    ? "border-[#1B3B2B] bg-[#E3EFE8]/25 shadow-2xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-none ${paymentMethod === "cod"
                          ? "border-[#1B3B2B] bg-[#1B3B2B]"
                          : "border-stone-300 bg-white"
                          }`}
                      >
                        {paymentMethod === "cod" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#11261B] block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Pay with cash upon food delivery
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex-none">
                      Available
                    </span>
                  </div>
                </div>
              </div>

              <button
                disabled={isCartEmpty || submitting}
                type="submit"
                className={`w-full py-4 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 ${isCartEmpty || submitting
                  ? "bg-stone-300 cursor-not-allowed"
                  : "bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95"
                  }`}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>{paymentMethod === "razorpay" ? "Preparing Payment..." : "Submitting Order..."}</span>
                  </>
                ) : paymentMethod === "razorpay" ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay Online &amp; Place Order
                  </span>
                ) : (
                  <span>Confirm &amp; Place Order (COD)</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
