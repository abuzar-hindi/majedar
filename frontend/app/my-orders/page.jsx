"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { getMyOrders } from "../../lib/api";

const STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    classes: "text-blue-800 bg-blue-50 border-blue-200",
  },
  preparing: {
    label: "In Kitchen (Preparing)",
    classes: "text-amber-800 bg-amber-50 border-amber-200",
  },
  completed: {
    label: "Completed",
    classes: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    classes: "text-rose-800 bg-rose-50 border-rose-200",
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  paid: "text-emerald-700 bg-emerald-50 border-emerald-200",
  failed: "text-rose-700 bg-rose-50 border-rose-200",
  refunded: "text-purple-700 bg-purple-50 border-purple-200",
};

export default function MyOrders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setLoading(false);
      return;
    }

    let active = true;
    getMyOrders()
      .then((data) => {
        if (active) {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setErrorMsg(err?.message || "Failed to load order history.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, authLoading]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-5 border-b border-stone-200 flex items-end justify-between">
          <div>
            <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">
              My Orders
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Your real-time order history and delivery progress
            </p>
          </div>
          <Link
            href="/orderanddine"
            className="text-xs font-bold text-[#1B3B2B] hover:text-[#C85A17] uppercase tracking-wider"
          >
            Order More &rarr;
          </Link>
        </div>

        {/* Auth Check */}
        {!authLoading && !isAuthenticated ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center shadow-2xs">
            <svg
              className="w-12 h-12 text-stone-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="font-bold text-base text-stone-800 mb-1">
              Sign In to View Orders
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Please log in to your Majedaar account to check past and active orders.
            </p>
            <Link
              href="/login?redirect=/my-orders"
              className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all inline-block"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-stone-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Loading your orders...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
            {errorMsg}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-2xs">
            <svg
              className="w-12 h-12 text-stone-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="font-bold text-base text-stone-800 mb-1">
              No orders placed yet
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              You haven&apos;t ordered any food yet. Browse our menu to treat yourself!
            </p>
            <Link
              href="/orderanddine"
              className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-all inline-block"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg =
                STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
              const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs transition-all hover:border-stone-300"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold text-[#1B3B2B] font-mono tracking-wide">
                        {order.orderNumber || order._id}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.classes}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          PAYMENT_STATUS_CONFIG[order.paymentStatus] ||
                          "text-stone-600 bg-stone-50 border-stone-200"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <ul className="space-y-1.5 mb-4">
                    {order.items?.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-stone-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                          <span className="font-semibold">{item.name}</span>
                          {item.variant && item.variant !== "single" && (
                            <span className="text-[10px] font-bold text-[#C85A17] bg-[#FFF5EE] px-1.5 py-0.2 rounded border border-[#FED7AA] uppercase">
                              {item.variant}
                            </span>
                          )}
                          <span className="text-stone-400">× {item.quantity}</span>
                        </div>
                        <span className="font-semibold text-stone-600">
                          ₹{item.subtotal || item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Address Summary */}
                  {order.deliveryAddress && (
                    <div className="text-[11px] text-stone-500 mb-4 bg-stone-50 p-3 rounded-xl">
                      <span className="font-semibold text-stone-700">Delivery To: </span>
                      {order.deliveryAddress.address}
                      {order.deliveryAddress.area && `, ${order.deliveryAddress.area}`}
                    </div>
                  )}

                  {/* Bottom Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-extrabold text-base text-[#1B3B2B]">
                        ₹{order.total}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500 uppercase text-[11px] font-semibold">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Pay Online / Pay Now button for eligible unpaid orders */}
                      {order.paymentStatus !== "paid" &&
                        order.orderStatus !== "cancelled" &&
                        order.orderStatus !== "completed" && (
                          <Link
                            href={`/my-orders/${order._id}`}
                            className={`self-start sm:self-auto text-xs font-bold text-white px-4 py-1.5 rounded-full transition-colors ${
                              order.paymentMethod === "cod"
                                ? "bg-[#1B3B2B] hover:bg-[#11261B]"
                                : "bg-[#0F4C81] hover:bg-[#0a3a63]"
                            }`}
                          >
                            {order.paymentMethod === "cod" ? "Pay Online →" : "Pay Now →"}
                          </Link>
                        )}
                      <Link
                        href={`/my-orders/${order._id}`}
                        className="self-start sm:self-auto text-xs font-bold text-[#1B3B2B] border border-stone-300 hover:border-[#1B3B2B] px-4 py-1.5 rounded-full transition-colors bg-white hover:bg-stone-50"
                      >
                        View Details &amp; Rate →
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}