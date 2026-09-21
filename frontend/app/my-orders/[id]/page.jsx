"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getMyOrderById,
  submitRating,
  retryPayment,
  verifyPayment,
  cancelMyOrder,
  reportOrderIssue,
} from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useRazorpay } from "../../../hooks/useRazorpay";

const STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    step: 1,
    classes: "text-blue-800 bg-blue-50 border-blue-200",
  },
  preparing: {
    label: "Kitchen Preparing",
    step: 2,
    classes: "text-amber-800 bg-amber-50 border-amber-200",
  },
  completed: {
    label: "Completed",
    step: 3,
    classes: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    step: 0,
    classes: "text-rose-800 bg-rose-50 border-rose-200",
  },
};

const PAYMENT_STATUS_LABEL = {
  pending: { label: "Payment Pending", classes: "text-amber-700 bg-amber-50 border-amber-200" },
  paid: { label: "Paid", classes: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  failed: { label: "Payment Failed", classes: "text-rose-700 bg-rose-50 border-rose-200" },
  refunded: { label: "Refunded", classes: "text-purple-700 bg-purple-50 border-purple-200" },
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, customer } = useAuth();
  const { openRazorpay, scriptLoaded } = useRazorpay();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [retrying, setRetrying] = useState(false);

  // Track ratings given per menu item in this order: { [menuItemId]: number }
  const [ratingsState, setRatingsState] = useState({});
  const [ratingSubmitting, setRatingSubmitting] = useState({});

  // Order cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Order issue reporting state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState("wrong_item");
  const [issueDesc, setIssueDesc] = useState("");
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getMyOrderById(id);
      setOrder(data);
    } catch (err) {
      setErrorMsg(err?.message || "Unable to find order details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.replace(`/login?redirect=/my-orders/${id}`);
      return;
    }
    if (!authLoading && isAuthenticated) {
      loadOrder();
    }
  }, [id, isAuthenticated, authLoading, router, loadOrder]);

  /**
   * Retry payment flow — creates a new PaymentAttempt + Razorpay Order.
   * Old failed attempts are preserved on the backend.
   */
  const handleRetryPayment = async () => {
    if (!order?._id) return;
    setPaymentError("");
    setRetrying(true);

    let checkoutConfig;
    try {
      checkoutConfig = await retryPayment(order._id);
    } catch (err) {
      const rawMsg = err?.message || "";
      const isInternalOrConfig =
        rawMsg.toLowerCase().includes("key") ||
        rawMsg.toLowerCase().includes("secret") ||
        rawMsg.toLowerCase().includes("config") ||
        rawMsg.toLowerCase().includes("500") ||
        rawMsg.toLowerCase().includes("internal") ||
        rawMsg.toLowerCase().includes("unavailable");

      const friendlyMsg = isInternalOrConfig
        ? "Online payment is temporarily unavailable. Please try again later or pay with Cash on Delivery."
        : rawMsg || "Online payment is temporarily unavailable. Please try again later.";

      setPaymentError(friendlyMsg);
      toast.error(friendlyMsg);
      setRetrying(false);
      return;
    }

    openRazorpay(
      {
        ...checkoutConfig,
        customerName: customer?.name || "",
        customerEmail: order.deliveryAddress?.email || "",
        customerPhone: order.deliveryAddress?.phone || "",
      },
      {
        onSuccess: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
          try {
            await verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
            toast.success("Payment successful! Your order has been updated to Paid.", { autoClose: 4000 });
            // Reload order to fetch authoritative state from backend
            await loadOrder();
          } catch (err) {
            const msg = err?.message || "Payment verification failed. Please contact support.";
            setPaymentError(msg);
            toast.error(msg);
          } finally {
            setRetrying(false);
          }
        },

        onFailure: () => {
          const failMsg = "Payment was not completed. You can try again or pay with cash upon delivery.";
          setPaymentError(failMsg);
          toast.error(failMsg);
          setRetrying(false);
        },

        onDismiss: () => {
          const dismissMsg = "Payment window closed. Your order remains safely as Cash on Delivery.";
          setPaymentError(dismissMsg);
          toast.info(dismissMsg);
          setRetrying(false);
        },
      }
    );
    // Note: retrying stays true until a callback fires
  };

  const handleRateItem = async (menuItemId, starValue) => {
    if (ratingsState[menuItemId] || ratingSubmitting[menuItemId]) return;

    setRatingSubmitting((prev) => ({ ...prev, [menuItemId]: true }));
    try {
      await submitRating({
        orderId: order._id,
        menuItemId,
        rating: starValue,
      });

      setRatingsState((prev) => ({ ...prev, [menuItemId]: starValue }));
      toast.success(`Thank you for rating ${starValue} star${starValue > 1 ? "s" : ""}!`, {
        autoClose: 2500,
      });
    } catch (err) {
      const msg = err?.message || "Failed to submit rating. Please try again.";
      toast.error(msg);
    } finally {
      setRatingSubmitting((prev) => ({ ...prev, [menuItemId]: false }));
    }
  };

  const handleCancelOrder = async () => {
    if (!order?._id || cancelling) return;
    setCancelling(true);
    try {
      const updatedOrder = await cancelMyOrder(order._id);
      setOrder(updatedOrder);
      setShowCancelModal(false);
      if (order.paymentMethod === "razorpay" && order.paymentStatus === "paid") {
        toast.success("Order cancelled. A refund has been initiated to your original payment method.");
      } else {
        toast.success("Order cancelled successfully.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleReportIssue = async (e) => {
    e?.preventDefault();
    if (!order?._id || submittingIssue || !isDelivered) return;
    if (!issueDesc.trim() || issueDesc.trim().length < 5) {
      toast.error("Please describe your issue (at least 5 characters).");
      return;
    }
    setSubmittingIssue(true);
    try {
      await reportOrderIssue(order._id, {
        issueType,
        description: issueDesc.trim(),
      });
      toast.success("Your issue has been reported. Our team will review and contact you shortly.");
      setIssueDesc("");
      setShowIssueModal(false);
    } catch (err) {
      toast.error(err?.message || "Failed to submit issue report.");
    } finally {
      setSubmittingIssue(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-stone-500">Loading order details...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-[70vh] max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="font-hero text-2xl font-bold text-[#1B3B2B] mb-2">
          Order Not Found
        </h2>
        <p className="text-xs text-stone-500 mb-6">{errorMsg || "Unable to locate this order."}</p>
        <Link
          href="/my-orders"
          className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider"
        >
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
  const isCompleted = order.orderStatus === "completed" || order.orderStatus === "delivered";
  const isDelivered = isCompleted;
  const isCancelled = order.orderStatus === "cancelled";
  const isCancellable = order.orderStatus === "placed";
  const isRazorpay = order.paymentMethod === "razorpay";
  const isCOD = order.paymentMethod === "cod";
  const isPaymentPending = order.paymentStatus === "pending";
  const isPaymentFailed = order.paymentStatus === "failed";
  const isAlreadyPaid = order.paymentStatus === "paid";

  // Eligible to pay online: active unpaid order (placed / preparing), either Razorpay or COD
  const canPayOnline =
    !isAlreadyPaid &&
    !isCancelled &&
    !isCompleted &&
    (isRazorpay || (isCOD && isPaymentPending));

  const paymentStatusConfig = PAYMENT_STATUS_LABEL[order.paymentStatus] || PAYMENT_STATUS_LABEL.pending;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/my-orders" className="hover:text-[#1B3B2B] transition-colors">
            My Orders
          </Link>
          <span>/</span>
          <span className="font-bold text-stone-800">{order.orderNumber || order._id}</span>
        </div>

        {/* ── Payment Action Banner (Pay Online / Pay Now / Confirmed) ── */}
        {(canPayOnline || isAlreadyPaid || (isRazorpay && isCancelled)) && (
          <div className={`rounded-2xl p-5 border ${isAlreadyPaid
              ? "bg-emerald-50 border-emerald-200"
              : isCancelled
                ? "bg-stone-50 border-stone-200"
                : isCOD
                  ? "bg-[#E3EFE8]/50 border-[#1B3B2B]/20"
                  : "bg-amber-50 border-amber-200"
            }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className={`text-xs font-bold block mb-1 ${isAlreadyPaid
                    ? "text-emerald-800"
                    : isCancelled
                      ? "text-stone-600"
                      : isCOD
                        ? "text-[#1B3B2B]"
                        : "text-amber-800"
                  }`}>
                  {isAlreadyPaid
                    ? "✓ Payment Confirmed"
                    : isCancelled
                      ? "Order Cancelled"
                      : isCOD
                        ? "Pay Online Available (Cash on Delivery)"
                        : isPaymentFailed
                          ? "Payment Failed"
                          : "Payment Required"}
                </span>
                <p className={`text-[11px] leading-relaxed ${isAlreadyPaid
                    ? "text-emerald-700"
                    : isCancelled
                      ? "text-stone-500"
                      : isCOD
                        ? "text-stone-600"
                        : "text-amber-700"
                  }`}>
                  {isAlreadyPaid
                    ? "Your payment was successfully received and verified."
                    : isCancelled
                      ? "This order was cancelled. No payment required."
                      : isCompleted
                        ? "This order is completed."
                        : isCOD
                          ? "You can also pay online right now via UPI, Cards, or Net Banking for instant contactless confirmation."
                          : isPaymentFailed
                            ? "Your previous payment attempt failed. You can try again to complete online payment."
                            : "Your payment is pending. Complete payment to confirm your order."}
                </p>
                {paymentError && (
                  <p className="text-[11px] text-rose-700 font-semibold mt-2">{paymentError}</p>
                )}
              </div>

              {/* Pay Online / Retry button */}
              {canPayOnline && (
                <button
                  id="pay-online-btn"
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className={`shrink-0 px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${retrying
                      ? "bg-stone-300 cursor-not-allowed"
                      : isCOD
                        ? "bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95"
                        : "bg-[#0F4C81] hover:bg-[#0a3a63] active:scale-95"
                    } flex items-center gap-2`}
                >
                  {retrying ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Opening Payment...</span>
                    </>
                  ) : (
                    <span>
                      {isCOD
                        ? "Pay Online →"
                        : isPaymentFailed
                          ? "Try Again →"
                          : "Pay Now →"}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C85A17] block mb-1">
                Order Receipt
              </span>
              <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B]">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex sm:flex-col items-start sm:items-end gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.classes}`}>
                {statusCfg.label}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${paymentStatusConfig.classes}`}>
                {paymentStatusConfig.label}
              </span>
              <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
              </span>
            </div>
          </div>

          {/* Timeline tracker */}
          {!isCancelled && (
            <div className="pt-6">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: "1. Placed", step: 1 },
                  { label: "2. Preparing", step: 2 },
                  { label: "3. Completed", step: 3 },
                ].map((s) => {
                  const isDone = statusCfg.step >= s.step;
                  const isCurrent = statusCfg.step === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${isDone
                            ? "bg-[#1B3B2B] text-white"
                            : "bg-stone-100 text-stone-400 border border-stone-200"
                          } ${isCurrent ? "ring-4 ring-[#1B3B2B]/20" : ""}`}
                      >
                        {isDone ? "✓" : s.step}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${isDone ? "text-[#11261B]" : "text-stone-400"
                          }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row: Cancel Order (when cancellable) & Report Issue */}
          <div className="pt-5 mt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              {isCancellable && (
                <button
                  type="button"
                  id="cancel-order-btn"
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel Order</span>
                </button>
              )}
            </div>

            <button
              type="button"
              id="report-issue-btn"
              disabled={!isDelivered}
              onClick={() => isDelivered && setShowIssueModal(true)}
              title={
                isDelivered
                  ? "Report an issue with your delivered order"
                  : "Report an issue will be available once your order is delivered"
              }
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all ${
                isDelivered
                  ? "text-stone-700 bg-stone-100 hover:bg-stone-200 active:scale-95 cursor-pointer shadow-2xs"
                  : "text-stone-400 bg-stone-100/60 border border-stone-200/50 cursor-not-allowed opacity-60"
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${isDelivered ? "text-stone-500" : "text-stone-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Report an Issue</span>
            </button>
          </div>
        </div>

        {/* Ordered Items List & Star Ratings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
          <h2 className="font-hero text-xl font-bold text-[#1B3B2B] mb-4">
            Items Ordered
          </h2>

          <div className="divide-y divide-stone-100">
            {order.items?.map((item, idx) => {
              const menuItemId = item.menuItem?._id || item.menuItem;
              const currentRating = ratingsState[menuItemId];
              const isSubmittingRating = ratingSubmitting[menuItemId];

              return (
                <div
                  key={idx}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-100 flex-none"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#11261B]">
                          {item.name}
                        </h3>
                        {item.variant && item.variant !== "single" && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            {item.variant}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Quantity: <span className="font-semibold">{item.quantity}</span> × ₹{item.unitPrice || item.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className="font-extrabold text-sm text-[#1B3B2B]">
                      ₹{item.subtotal || item.price * item.quantity}
                    </span>

                    {/* Star rating widget for completed orders */}
                    {isCompleted && menuItemId && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[11px] text-stone-500 font-medium mr-1">
                          {currentRating ? "Your rating:" : "Rate:"}
                        </span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            disabled={Boolean(currentRating) || isSubmittingRating}
                            onClick={() => handleRateItem(menuItemId, star)}
                            className={`text-base transition-transform ${(currentRating || 0) >= star
                                ? "text-amber-500 scale-110"
                                : "text-stone-300 hover:text-amber-400 hover:scale-110"
                              } ${currentRating ? "cursor-default" : "cursor-pointer"}`}
                            title={`Rate ${star} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isCompleted && !isCancelled && (
            <p className="text-[11px] text-stone-400 italic mt-3 pt-3 border-t border-stone-100">
              * Star ratings will become available once your food is delivered and order completed.
            </p>
          )}
        </div>

        {/* Financial & Delivery Details Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs">
            <h3 className="font-hero text-lg font-bold text-[#1B3B2B] mb-3">
              Delivery Address
            </h3>
            {order.deliveryAddress ? (
              <div className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                <p className="font-bold text-stone-800 text-sm">
                  {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
                </p>
                <p>📞 {order.deliveryAddress.phone}</p>
                <p>✉️ {order.deliveryAddress.email}</p>
                <div className="pt-2 border-t border-stone-100 mt-2">
                  <p className="font-semibold text-stone-700">
                    {order.deliveryAddress.address}
                  </p>
                  {order.deliveryAddress.area && (
                    <p className="text-[#1B3B2B] font-semibold">
                      Area: {order.deliveryAddress.area}
                    </p>
                  )}
                  {order.deliveryAddress.landmark && (
                    <p className="text-stone-500">
                      Landmark: {order.deliveryAddress.landmark}
                    </p>
                  )}
                  {order.deliveryAddress.deliveryInstructions && (
                    <p className="text-[#C85A17] font-semibold pt-1">
                      Instructions: {order.deliveryAddress.deliveryInstructions}
                      {order.deliveryAddress.deliveryInstructionOther &&
                        ` (${order.deliveryAddress.deliveryInstructionOther})`}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400">No address details provided.</p>
            )}
          </div>

          {/* Payment & Charges Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs">
            <h3 className="font-hero text-lg font-bold text-[#1B3B2B] mb-3">
              Charges Breakdown
            </h3>
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>5% GST (Items)</span>
                <span className="font-semibold text-stone-800">₹{order.gst}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-stone-800">₹{order.deliveryFee}</span>
              </div>
              <hr className="border-stone-100 my-2" />
              <div className="flex justify-between text-base font-extrabold text-[#11261B]">
                <span>Total Amount</span>
                <span className="text-[#1B3B2B]">₹{order.total}</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500">
                <span>Payment Status:</span>
                <span className={`font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border text-[10px] ${paymentStatusConfig.classes}`}>
                  {paymentStatusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/my-orders"
            className="text-xs font-semibold text-stone-600 hover:text-[#1B3B2B] transition-colors"
          >
            ← Return to All Orders
          </Link>
        </div>
      </div>

      {/* ── Cancel Order Confirmation Modal ── */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="font-hero text-xl font-bold text-[#11261B] mb-2">
              Cancel Order #{order.orderNumber}?
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              {order.paymentMethod === "razorpay" && order.paymentStatus === "paid"
                ? `Are you sure you want to cancel this order? Since you paid online, a full refund of ₹${order.total} will be automatically initiated to your original payment method.`
                : "Are you sure you want to cancel this order? Once cancelled, the restaurant kitchen will not prepare it."}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancelling ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Order Issue Modal ── */}
      {showIssueModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !submittingIssue && setShowIssueModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C85A17] block">
                  Support Desk
                </span>
                <h3 className="font-hero text-xl font-bold text-[#11261B]">
                  Report an Issue with Order #{order.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !submittingIssue && setShowIssueModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#11261B] mb-1.5">
                  Issue Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                >
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="missing_item">Missing Item(s)</option>
                  <option value="damaged_spilled">Damaged / Spilled Food</option>
                  <option value="payment_issue">Payment or Refund Issue</option>
                  <option value="delivery_issue">Delivery Delay / Rider Issue</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11261B] mb-1.5">
                  Explain What Happened <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  rows={4}
                  placeholder="Please describe what went wrong with your order in detail (at least 5 characters)..."
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3.5 font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B] resize-none"
                  minLength={5}
                  maxLength={2000}
                  required
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  {issueDesc.length}/2000 characters
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={submittingIssue}
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIssue || issueDesc.trim().length < 5}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95 transition-all shadow-xs disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingIssue ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
