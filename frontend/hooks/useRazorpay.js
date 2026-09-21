"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to load the Razorpay Checkout script and open the payment modal.
 *
 * Security notes:
 *  - Only NEXT_PUBLIC_RAZORPAY_KEY_ID is used here (public key — safe to expose)
 *  - RAZORPAY_KEY_SECRET is never present in frontend code
 *  - Amount is backend-provided and never computed here
 *  - Cart is NOT cleared here — only cleared after backend payment verification succeeds
 *
 * Usage:
 *   const { openRazorpay, scriptLoaded } = useRazorpay();
 *   openRazorpay({ razorpayOrderId, amount, currency, orderNumber, ... }, { onSuccess, onFailure, onDismiss })
 */
export function useRazorpay() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const rzpRef = useRef(null);

  // Dynamically load Razorpay checkout.js script once
  useEffect(() => {
    // Avoid loading twice
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup: don't remove the script — it may be needed by other pages
    };
  }, []);

  /**
   * Open Razorpay Standard Checkout.
   *
   * @param {Object} checkoutConfig - From backend: { razorpayKeyId, razorpayOrderId, amount, currency, orderNumber }
   * @param {Object} handlers - { onSuccess, onFailure, onDismiss }
   *   onSuccess(response) - called with { razorpayOrderId, razorpayPaymentId, razorpaySignature }
   *   onFailure(error)    - called when payment fails
   *   onDismiss()         - called when user closes the modal without paying
   */
  const openRazorpay = useCallback(
    (checkoutConfig, { onSuccess, onFailure, onDismiss } = {}) => {
      if (!scriptLoaded || !window.Razorpay) {
        onFailure?.({ message: "Payment service not available. Please refresh and try again." });
        return;
      }

      const {
        razorpayKeyId,
        razorpayOrderId,
        amount,
        currency,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
      } = checkoutConfig;

      const options = {
        key: razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // in paise — provided by backend, never computed here
        currency: currency || "INR",
        name: "Majedaar Restaurant",
        description: `Order ${orderNumber || ""}`,
        order_id: razorpayOrderId, // backend-generated Razorpay Order ID
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        theme: {
          color: "#1B3B2B",
        },
        modal: {
          ondismiss: () => {
            // Customer closed the modal without paying
            // DO NOT mark order as paid. DO NOT clear cart.
            onDismiss?.();
          },
        },
        handler: (response) => {
          // Razorpay calls this after payment is ATTEMPTED (not necessarily verified).
          // We must send these to the backend for cryptographic signature verification.
          // DO NOT mark anything as paid here — backend verifies first.
          onSuccess?.({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
      };

      // Destroy previous instance if any
      if (rzpRef.current) {
        try {
          rzpRef.current.close();
        } catch {}
      }

      const rzp = new window.Razorpay(options);
      rzpRef.current = rzp;

      rzp.on("payment.failed", (response) => {
        // Payment failed during checkout
        onFailure?.({
          message: "Payment failed. Please try again.",
          code: response?.error?.code,
        });
      });

      rzp.open();
    },
    [scriptLoaded]
  );

  return {
    scriptLoaded,
    scriptError,
    openRazorpay,
  };
}
