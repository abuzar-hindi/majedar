import { useContext, useState } from "react";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../contexts/ShopContext";
import QRCode from "qrcode";
import { assets } from "../assets/assets";

const PlaceOrder = () => {
  const [method, setMethod] = useState("gpay");

  const { cartItems, getCartAmount, deliveryFee, products } =
    useContext(ShopContext);
  const isCartEmpty = Object.keys(cartItems).length === 0;
  const orderType = localStorage.getItem("orderType") || "Home Delivery";
  const [showQR, setShowQR] = useState(false);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const UPI_ID = "hs3495550@okhdfcbank";
  const MERCHANT_NAME = "Sheikh Hamza";
  const generateOrderId = () =>
    "MD-" + Math.floor(100000 + Math.random() * 900000);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("formData");
    return savedData
      ? JSON.parse(savedData)
      : {
          firstName: "",
          lastName: "",
          email: "",
          street: "",
          city: "",
          state: "",
          zipcode: "",
          country: "",
          phone: "",
        };
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

    message += `🛒 *Items:*\n`;

    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;

      for (const typeLabel in cartItems[productId]) {
        const qty = cartItems[productId][typeLabel];
        const typeObj = product.types?.find((t) => t.label === typeLabel);

        if (qty > 0 && typeObj) {
          message += `• ${product.name} (${typeLabel}) x${qty} – ₹${
            typeObj.price * qty
          }\n`;
        }
      }
    }

    message += `\n💰 *Total: ₹${getCartAmount() + deliveryFee}*`;

    const phoneNumber = "917905404619"; // Merchant's WhatsApp number
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappURL, "_blank");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const orderId = generateOrderId();
    setCurrentOrderId(orderId);

    const totalAmount = getCartAmount() + deliveryFee;

    // UPI methods
    if (method === "gpay" || method === "phonepe") {
      if (isMobile) {
        // 📱 Mobile → direct UPI intent
        window.location.href = getUpiLink(totalAmount, orderId);

        setTimeout(() => {
          sendWhatsAppOrder(orderId, "UPI Paid");
        }, 1200);
      } else {
        // 💻 Desktop → generate dynamic QR
        await generateQrForPayment(totalAmount, orderId);
      }
      return;
    }

    // COD
    sendWhatsAppOrder(orderId, "Cash on Delivery");
  };

  const generateQrForPayment = async (amount, orderId) => {
    const upiUrl = getUpiLink(amount, orderId);

    try {
      const qr = await QRCode.toDataURL(upiUrl);
      setQrDataUrl(qr); // 👈 dynamic QR image
      setShowQR(true); // 👈 open popup
    } catch (err) {
      console.error("QR generation failed", err);
    }
  };

  const getUpiLink = (amount, orderId) =>
    `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
      MERCHANT_NAME
    )}&am=${amount}&cu=INR&tn=Order%20${orderId}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={onSubmitHandler}
        className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between gap-8"
      >
        {/* ------------------------ Left Side: Delivery Information ------------------------  */}
        <div className="flex-1 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
          <div className="mb-6 pb-3 border-b border-stone-100">
            <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
              Step 1 of 2
            </span>
            <h2 className="font-hero text-2xl font-bold text-[#1B3B2B]">
              Delivery Details
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                onChange={onChangeHandler}
                name="firstName"
                value={formData.firstName}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
                type="text"
                placeholder="First Name"
                required
              />
              <input
                onChange={onChangeHandler}
                name="lastName"
                value={formData.lastName}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
                type="text"
                placeholder="Last Name"
                required
              />
            </div>

            <input
              onChange={onChangeHandler}
              name="email"
              value={formData.email}
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
              type="email"
              placeholder="Email Address"
              required
            />

            <input
              onChange={onChangeHandler}
              name="street"
              value={formData.street}
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
              type="text"
              placeholder="Street Address"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                onChange={onChangeHandler}
                name="city"
                value={formData.city}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
                type="text"
                placeholder="City"
                required
              />
              <input
                onChange={onChangeHandler}
                name="state"
                value={formData.state}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
                type="text"
                placeholder="State"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                onChange={onChangeHandler}
                name="zipcode"
                value={formData.zipcode}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
                type="number"
                placeholder="Zipcode"
                required
              />
              <input
                onChange={onChangeHandler}
                name="country"
                value={formData.country}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
                type="text"
                placeholder="Country"
                required
              />
            </div>

            <input
              onChange={onChangeHandler}
              name="phone"
              value={formData.phone}
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
              type="number"
              placeholder="Phone Number"
              required
            />
          </div>
        </div>

        {/* ------------------------ Right Side: Order Summary & Payment Methods ------------------------  */}
        <div className="w-full lg:w-[420px] space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
            <CartTotal />
          </div>

          {/* Payment Method Selection Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
                Step 2 of 2
              </span>
              <h3 className="font-hero text-xl font-bold text-[#1B3B2B]">
                Payment Method
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              {/* Button for GPay */}
              <div
                onClick={() => setMethod("gpay")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  method === "gpay"
                    ? "border-[#1B3B2B] bg-[#E3EFE8]/30 shadow-2xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      method === "gpay"
                        ? "border-[#1B3B2B] bg-[#1B3B2B]"
                        : "border-stone-300"
                    }`}
                  >
                    {method === "gpay" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Google Pay
                  </span>
                </div>
                <img className="h-6 object-contain" src={assets.google_pay} alt="GPay" />
              </div>

              {/* Button for PhonePe */}
              <div
                onClick={() => setMethod("phonepe")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  method === "phonepe"
                    ? "border-[#1B3B2B] bg-[#E3EFE8]/30 shadow-2xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      method === "phonepe"
                        ? "border-[#1B3B2B] bg-[#1B3B2B]"
                        : "border-stone-300"
                    }`}
                  >
                    {method === "phonepe" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    PhonePe UPI
                  </span>
                </div>
                <img className="h-6 object-contain" src={assets.PhonePe} alt="PhonePe" />
              </div>

              {/* Button for Cash on Delivery */}
              <div
                onClick={() => setMethod("cod")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  method === "cod"
                    ? "border-[#1B3B2B] bg-[#E3EFE8]/30 shadow-2xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      method === "cod"
                        ? "border-[#1B3B2B] bg-[#1B3B2B]"
                        : "border-stone-300"
                    }`}
                  >
                    {method === "cod" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Cash on Delivery
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Pay at Door
                </span>
              </div>
            </div>

            {/* Modal for QR Code */}
            {showQR && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-xl border border-stone-200">
                  <h3 className="text-base font-bold text-[#1B3B2B] mb-1">
                    Scan & Pay with UPI
                  </h3>
                  <p className="text-xs text-stone-500 mb-3">
                    Order ID: <b className="text-stone-800">{currentOrderId}</b>
                  </p>

                  {qrDataUrl && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block mb-3">
                      <img
                        src={qrDataUrl}
                        alt="UPI QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  )}

                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    Scan using GPay, PhonePe, or any UPI app to complete payment.
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQR(false);
                        sendWhatsAppOrder(currentOrderId, "UPI Paid (QR)");
                      }}
                      className="w-full py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all"
                    >
                      I’ve Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQR(false)}
                      className="w-full py-2 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Place Order Submit CTA Button */}
            <button
              disabled={isCartEmpty}
              type="submit"
              className={`w-full py-3.5 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs ${
                isCartEmpty
                  ? "bg-stone-300 cursor-not-allowed"
                  : "bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95"
              }`}
            >
              Place Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
