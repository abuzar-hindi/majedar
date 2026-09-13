"use client";
import { useContext, useState, useEffect } from "react";
import CartTotal from "../../components/CartTotal";
import { ShopContext } from "../../contexts/ShopContext";
import QRCode from "qrcode";
import { assets } from "../../lib/data/assets";

export default function PlaceOrder() {
  const [method, setMethod] = useState("gpay");
  const { cartItems, getCartAmount, deliveryFee, products } = useContext(ShopContext);
  const isCartEmpty = Object.keys(cartItems).length === 0;

  // Fix: navigator.userAgent is browser-only; use state + useEffect to avoid SSR crash
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const [orderType, setOrderType] = useState("Home Delivery");
  useEffect(() => {
    setOrderType(localStorage.getItem("orderType") || "Home Delivery");
  }, []);

  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const UPI_ID = "hs3495550@okhdfcbank";
  const MERCHANT_NAME = "Sheikh Hamza";
  const generateOrderId = () => "MD-" + Math.floor(100000 + Math.random() * 900000);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("formData");
      if (savedData) return JSON.parse(savedData);
    }
    return { firstName: "", lastName: "", email: "", street: "", city: "", state: "", zipcode: "", country: "", phone: "" };
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      localStorage.setItem("formData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const sendWhatsAppOrder = (orderId, paymentStatus) => {
    let message = `*New Order*\n\n`;
    message += `*Order ID:* ${orderId}\n`;
    message += `*Order Type:* ${orderType}\n`;
    message += `Payment: ${paymentStatus}\n\n`;
    message += `*Name:* ${formData.firstName} ${formData.lastName}\n`;
    message += `*Phone:* ${formData.phone}\n`;
    message += `*Address:* ${formData.street}, ${formData.city}, ${formData.state}\n\n`;
    message += `*Items:*\n`;
    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;
      for (const typeLabel in cartItems[productId]) {
        const qty = cartItems[productId][typeLabel];
        const typeObj = product.types?.find((t) => t.label === typeLabel);
        if (qty > 0 && typeObj) {
          message += `- ${product.name} (${typeLabel}) x${qty} - Rs.${typeObj.price * qty}\n`;
        }
      }
    }
    message += `\n*Total: Rs.${getCartAmount() + deliveryFee}*`;
    const phoneNumber = "917905404619";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  const getUpiLink = (amount, orderId) =>
    `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=Order%20${orderId}`;

  const generateQrForPayment = async (amount, orderId) => {
    const upiUrl = getUpiLink(amount, orderId);
    try {
      const qr = await QRCode.toDataURL(upiUrl);
      setQrDataUrl(qr);
      setShowQR(true);
    } catch (err) {
      console.error("QR generation failed", err);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const orderId = generateOrderId();
    setCurrentOrderId(orderId);
    const totalAmount = getCartAmount() + deliveryFee;
    if (method === "gpay" || method === "phonepe") {
      if (isMobile) {
        window.location.href = getUpiLink(totalAmount, orderId);
        setTimeout(() => sendWhatsAppOrder(orderId, "UPI Paid"), 1200);
      } else {
        await generateQrForPayment(totalAmount, orderId);
      }
      return;
    }
    sendWhatsAppOrder(orderId, "Cash on Delivery");
  };

  const inputClass = "w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all";

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <form onSubmit={onSubmitHandler} className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between gap-8">
        {/* Delivery Info */}
        <div className="flex-1 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
          <div className="mb-6 pb-3 border-b border-stone-100">
            <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">Step 1 of 2</span>
            <h2 className="font-hero text-2xl font-bold text-[#1B3B2B]">Delivery Details</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input onChange={onChangeHandler} name="firstName" value={formData.firstName} className={inputClass} type="text" placeholder="First Name" required />
              <input onChange={onChangeHandler} name="lastName" value={formData.lastName} className={inputClass} type="text" placeholder="Last Name" required />
            </div>
            <input onChange={onChangeHandler} name="email" value={formData.email} className={inputClass} type="email" placeholder="Email Address" required />
            <input onChange={onChangeHandler} name="street" value={formData.street} className={inputClass} type="text" placeholder="Street Address" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input onChange={onChangeHandler} name="city" value={formData.city} className={inputClass} type="text" placeholder="City" required />
              <input onChange={onChangeHandler} name="state" value={formData.state} className={inputClass} type="text" placeholder="State" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input onChange={onChangeHandler} name="zipcode" value={formData.zipcode} className={inputClass} type="number" placeholder="Zipcode" required />
              <input onChange={onChangeHandler} name="country" value={formData.country} className={inputClass} type="text" placeholder="Country" required />
            </div>
            <input onChange={onChangeHandler} name="phone" value={formData.phone} className={inputClass} type="number" placeholder="Phone Number" required />
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="w-full lg:w-[420px] space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
            <CartTotal />
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">Step 2 of 2</span>
              <h3 className="font-hero text-xl font-bold text-[#1B3B2B]">Payment Method</h3>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { id: "gpay", label: "Google Pay", img: assets.google_pay },
                { id: "phonepe", label: "PhonePe UPI", img: assets.PhonePe },
              ].map(({ id, label, img }) => (
                <div key={id} onClick={() => setMethod(id)} className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${method === id ? "border-[#1B3B2B] bg-[#E3EFE8]/30 shadow-2xs" : "border-stone-200 hover:border-stone-300 bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === id ? "border-[#1B3B2B] bg-[#1B3B2B]" : "border-stone-300"}`}>
                      {method === id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <span className="text-xs font-bold text-stone-800">{label}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="h-6 object-contain" src={img} alt={label} />
                </div>
              ))}
              <div onClick={() => setMethod("cod")} className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${method === "cod" ? "border-[#1B3B2B] bg-[#E3EFE8]/30 shadow-2xs" : "border-stone-200 hover:border-stone-300 bg-white"}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === "cod" ? "border-[#1B3B2B] bg-[#1B3B2B]" : "border-stone-300"}`}>
                    {method === "cod" && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </span>
                  <span className="text-xs font-bold text-stone-800">Cash on Delivery</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Pay at Door</span>
              </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-xl border border-stone-200">
                  <h3 className="text-base font-bold text-[#1B3B2B] mb-1">Scan &amp; Pay with UPI</h3>
                  <p className="text-xs text-stone-500 mb-3">Order ID: <b className="text-stone-800">{currentOrderId}</b></p>
                  {qrDataUrl && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                  )}
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">Scan using GPay, PhonePe, or any UPI app to complete payment.</p>
                  <div className="space-y-2">
                    <button type="button" onClick={() => { setShowQR(false); sendWhatsAppOrder(currentOrderId, "UPI Paid (QR)"); }} className="w-full py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all">
                      I&apos;ve Paid
                    </button>
                    <button type="button" onClick={() => setShowQR(false)} className="w-full py-2 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              disabled={isCartEmpty}
              type="submit"
              className={`w-full py-3.5 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs ${isCartEmpty ? "bg-stone-300 cursor-not-allowed" : "bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95"}`}
            >
              Place Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
