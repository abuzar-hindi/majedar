"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button, Modal, PageHeader, StatusBadge, useToast } from "@/components/ui";
import { getAdminOrderById, updateAdminOrderStatus } from "@/lib/api/orders";
import { getOrderPaymentAttempts } from "@/lib/api/payments";
import { getWhatsAppShareUrl } from "@/lib/whatsapp";

const STATUS_LABELS = {
  placed: "Placed",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const PAYMENT_TONES = {
  paid: "paid",
  failed: "cancelled",
  refunded: "refunded",
  pending: "pending",
  created: "neutral",
};

function WhatsAppIcon({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

export default function OrderDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [paymentAttempts, setPaymentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState("placed");
  const [newPaymentStatus, setNewPaymentStatus] = useState("pending");
  const [updating, setUpdating] = useState(false);

  const toast = useToast();

  const handleShareOnWhatsApp = () => {
    try {
      if (!order) {
        toast("Order data is not loaded yet", "danger");
        return;
      }
      const url = getWhatsAppShareUrl(order);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.assign(url);
      }
    } catch {
      toast("Failed to open WhatsApp. Please try again.", "danger");
    }
  };

  useEffect(() => {
    async function fetchOrderData() {
      setLoading(true);
      try {
        const [orderData, attemptsData] = await Promise.all([
          getAdminOrderById(id),
          getOrderPaymentAttempts(id).catch(() => []),
        ]);
        setOrder(orderData);
        setPaymentAttempts(Array.isArray(attemptsData) ? attemptsData : []);
        if (orderData) {
          setNewOrderStatus(orderData.orderStatus || "placed");
          setNewPaymentStatus(orderData.paymentStatus || "pending");
        }
      } catch (err) {
        toast(err?.message || "Failed to load order details", "danger");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchOrderData();
    }
  }, [id, toast]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const payload = {
        orderStatus: newOrderStatus,
      };

      // Only allow sending paymentStatus for COD orders (online payments are webhook-driven)
      if (order.paymentMethod === "cod") {
        payload.paymentStatus = newPaymentStatus;
      }

      const updated = await updateAdminOrderStatus(id, payload);
      setOrder(updated);
      toast("Order status updated successfully", "success");
      setShowStatusModal(false);
    } catch (err) {
      toast(err?.message || "Failed to update order status", "danger");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>
        Loading order details and payment history...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2>Order Not Found</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          The requested order ID does not exist or has been removed.
        </p>
        <Link href="/dashboard/orders" className="button button-secondary" style={{ marginTop: 16 }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const customerName =
    order.customer?.name ||
    `${order.deliveryAddress?.firstName || ""} ${order.deliveryAddress?.lastName || ""}`.trim() ||
    "Customer";

  const customerPhone = order.customer?.phone || order.deliveryAddress?.phone || "—";
  const customerEmail = order.customer?.email || order.deliveryAddress?.email || "—";

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const isTerminalState = order.orderStatus === "completed" || order.orderStatus === "cancelled";
  const isOnlinePayment = order.paymentMethod === "razorpay";

  return (
    <>
      <PageHeader
        eyebrow={`Order ${order.orderNumber}`}
        title="Order Details"
        description={`Placed on ${formattedDate}`}
        action={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={handleShareOnWhatsApp}
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 11px",
                color: "#16a34a",
                borderColor: "#bbf7d0",
                background: "#f0fdf4",
              }}
            >
              <WhatsAppIcon size={17} />
            </Button>
            <Button variant="secondary" type="button" onClick={() => window.print()}>
              <PrintIcon /> Print Order
            </Button>
            <Button type="button" onClick={() => setShowStatusModal(true)}>
              Update Status
            </Button>
          </>
        }
      />

      <div className="detail-layout">
        {/* Left column */}
        <div className="form-stack">
          {/* Summary */}
          <article className="surface detail-card">
            <div className="detail-card-head">
              <div>
                <h3>{customerName}</h3>
                <p className="muted">{customerPhone}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <StatusBadge>{STATUS_LABELS[order.orderStatus] || order.orderStatus}</StatusBadge>
                <StatusBadge tone={PAYMENT_TONES[order.paymentStatus] || "neutral"}>
                  {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                </StatusBadge>
              </div>
            </div>

            <div className="detail-grid">
              <div>
                <span className="detail-label">Order Type</span>
                <span className="detail-value" style={{ textTransform: "capitalize" }}>
                  {order.orderType?.replace("_", " ") || "Delivery"}
                </span>
              </div>
              <div>
                <span className="detail-label">Payment Method</span>
                <span className="detail-value" style={{ textTransform: "uppercase", fontWeight: 700 }}>
                  {isOnlinePayment ? "Online (Razorpay)" : "Cash on Delivery (COD)"}
                </span>
              </div>
              <div>
                <span className="detail-label">Payment Status</span>
                <span className="detail-value" style={{ fontWeight: 600 }}>
                  {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                </span>
              </div>
              <div>
                <span className="detail-label">Order Status</span>
                <span className="detail-value">
                  {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </span>
              </div>
            </div>
          </article>

          {/* Payment & Transaction History Card */}
          <article className="surface detail-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p className="detail-section-title" style={{ margin: 0 }}>
                Payment &amp; Transaction History
              </p>
              <StatusBadge tone={PAYMENT_TONES[order.paymentStatus] || "neutral"}>
                {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
              </StatusBadge>
            </div>

            <div style={{ padding: "10px 12px", background: "var(--bg-subtle, #faf8f5)", borderRadius: "8px", border: "1px solid var(--line-soft)", marginBottom: "14px", fontSize: "12px" }}>
              {isOnlinePayment ? (
                <span>
                  <strong>Online Secured Payment (Razorpay):</strong> Status is authoritatively validated by Razorpay cryptographic HMAC signatures &amp; webhooks. Manual status manipulation is disabled for financial integrity.
                </span>
              ) : (
                <span>
                  <strong>Cash on Delivery (COD):</strong> Payment collected in cash or UPI QR at the customer&apos;s doorstep upon food delivery.
                </span>
              )}
            </div>

            {/* Payment attempts list */}
            {isOnlinePayment && (
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Payment Attempts ({paymentAttempts.length})
                </span>

                {paymentAttempts.length === 0 ? (
                  <p className="muted" style={{ fontSize: "12px", fontStyle: "italic", margin: 0 }}>
                    No payment attempt recorded yet (customer has not initiated checkout).
                  </p>
                ) : (
                  <div className="order-items" style={{ gap: "8px" }}>
                    {paymentAttempts.map((attempt, index) => {
                      const amountRupees = attempt.amount ? (attempt.amount / 100).toFixed(2) : "0.00";
                      const attemptDate = attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("en-IN") : "—";
                      const isAttemptPaid = attempt.status === "paid";
                      const isAttemptFailed = attempt.status === "failed";

                      return (
                        <div
                          key={attempt._id || index}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: `1px solid ${isAttemptPaid ? "var(--forest-mid, #16a34a)" : isAttemptFailed ? "var(--danger-border, #fecaca)" : "var(--line-soft)"}`,
                            background: isAttemptPaid ? "#f0fdf4" : isAttemptFailed ? "#fef2f2" : "#ffffff",
                            fontSize: "12px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                            <div>
                              <strong style={{ fontSize: "12.5px" }}>Attempt {index + 1}</strong>
                              <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--muted)" }}>
                                {attemptDate}
                              </span>
                            </div>
                            <StatusBadge tone={PAYMENT_TONES[attempt.status] || "neutral"}>
                              {attempt.status?.toUpperCase()}
                            </StatusBadge>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", fontSize: "11.5px", marginTop: "6px" }}>
                            <div>
                              <span className="muted">Amount: </span>
                              <strong>₹{amountRupees}</strong>
                            </div>
                            <div>
                              <span className="muted">Method: </span>
                              <strong style={{ textTransform: "uppercase" }}>{attempt.method || "ONLINE"}</strong>
                            </div>
                            <div>
                              <span className="muted">Rzp Order ID: </span>
                              <code>{attempt.razorpayOrderId || "—"}</code>
                            </div>
                            <div>
                              <span className="muted">Rzp Payment ID: </span>
                              <code>{attempt.razorpayPaymentId || "—"}</code>
                            </div>
                          </div>

                          {attempt.failureReason && (
                            <div style={{ marginTop: "6px", color: "var(--danger, #dc2626)", fontSize: "11px" }}>
                              <strong>Failure Reason: </strong> {attempt.failureReason}
                            </div>
                          )}

                          {attempt.refundId && (
                            <div style={{ marginTop: "6px", color: "#6d28d9", fontSize: "11px" }}>
                              <strong>Refund: </strong> {attempt.refundId} (₹{attempt.refundAmount ? (attempt.refundAmount / 100).toFixed(2) : "0.00"})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </article>

          {/* Ordered items */}
          <article className="surface detail-card">
            <p className="detail-section-title">Ordered Items</p>
            <div className="order-items">
              {order.items?.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <div style={{ flex: 1 }}>
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-variant" style={{ color: "var(--muted)", fontSize: "11px" }}>
                      Unit price: ₹{item.price}
                    </div>
                  </div>
                  <div className="order-item-qty">×{item.quantity}</div>
                  <div className="order-item-total">₹{item.subtotal}</div>
                </div>
              ))}
            </div>

            {/* Authoritative Financial Breakdown */}
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--line-soft)" }}>
              <div className="totals-row">
                <span>Items Subtotal</span>
                <strong>₹{Number(order.subtotal || 0).toFixed(2)}</strong>
              </div>
              <div className="totals-row">
                <span>GST (5% on items)</span>
                <strong>₹{Number(order.gst || 0).toFixed(2)}</strong>
              </div>
              <div className="totals-row">
                <span>Delivery Fee</span>
                <strong>₹{Number(order.deliveryFee || 0).toFixed(2)}</strong>
              </div>
              <div className="totals-row grand">
                <span>Authoritative Total</span>
                <strong>₹{Number(order.total || 0).toFixed(2)}</strong>
              </div>
            </div>
          </article>
        </div>

        {/* Right column */}
        <div className="form-stack">
          {/* Customer & Delivery address */}
          <article className="surface delivery-panel">
            <h3>Customer &amp; Delivery Details</h3>
            <div className="delivery-info">
              <div className="delivery-field">
                <span>Customer Name</span>
                <p>{customerName}</p>
              </div>
              <div className="delivery-field">
                <span>Contact</span>
                <p>{customerPhone}</p>
                {customerEmail && customerEmail !== "—" && (
                  <p className="muted" style={{ fontSize: "11.5px" }}>{customerEmail}</p>
                )}
              </div>
              <div className="delivery-field">
                <span>Delivery Address</span>
                <p>{order.deliveryAddress?.address || "—"}</p>
                {order.deliveryAddress?.landmark && (
                  <p className="muted" style={{ fontSize: "11.5px" }}>
                    Landmark: {order.deliveryAddress.landmark}
                  </p>
                )}
                {order.deliveryAddress?.area && (
                  <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--forest-mid)" }}>
                    Selected Area: {order.deliveryAddress.area}
                  </p>
                )}
              </div>
              {order.deliveryAddress?.deliveryInstructions && (
                <div className="delivery-field">
                  <span>Delivery Instructions</span>
                  <p>{order.deliveryAddress.deliveryInstructions}</p>
                  {order.deliveryAddress.deliveryInstructionOther && (
                    <p className="muted" style={{ fontSize: "11.5px" }}>
                      Note: {order.deliveryAddress.deliveryInstructionOther}
                    </p>
                  )}
                </div>
              )}
            </div>
          </article>

          {/* Timeline & Actions */}
          <article className="surface detail-card">
            <p className="detail-section-title">Order Timeline</p>
            <div className="timeline">
              <div className="timeline-item">
                <strong>Order placed</strong>
                <small>{formattedDate}</small>
              </div>
              <div className="timeline-item">
                <strong>Payment: {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}</strong>
                <small>{isOnlinePayment ? "Razorpay online verification" : "Cash on Delivery"}</small>
              </div>
              <div className="timeline-item">
                <strong>Current Status: {STATUS_LABELS[order.orderStatus] || order.orderStatus}</strong>
                <small>Authoritative state in restaurant system</small>
              </div>
            </div>

            <div className="detail-actions" style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: "8px" }}>
              <Button
                variant="secondary"
                type="button"
                onClick={handleShareOnWhatsApp}
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#16a34a",
                  borderColor: "#bbf7d0",
                  background: "#f0fdf4",
                  padding: "8px 12px",
                }}
              >
                <WhatsAppIcon size={17} />
              </Button>
              <Link
                href="/dashboard/orders"
                className="button button-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Back to Orders
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <Modal
          title={`Update Order ${order.orderNumber}`}
          onClose={() => !updating && setShowStatusModal(false)}
        >
          <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "18px" }}>
            Authoritative state transitions governed by restaurant workflow rules.
          </p>

          <div className="form-stack">
            {/* Order Status */}
            <label className="form-field">
              <span>Order Status</span>
              {isTerminalState ? (
                <div style={{ padding: "8px 12px", background: "var(--bg-subtle)", borderRadius: "6px", fontSize: "12px" }}>
                  <strong>{STATUS_LABELS[order.orderStatus] || order.orderStatus}</strong>
                  <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "11px" }}>
                    This order is in a terminal state ({order.orderStatus}) and cannot be transitioned further.
                  </p>
                </div>
              ) : (
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  disabled={updating}
                >
                  {order.orderStatus === "placed" && (
                    <>
                      <option value="placed">Placed — Order received</option>
                      <option value="preparing">Preparing — In kitchen</option>
                      <option value="cancelled">Cancelled — Order voided</option>
                    </>
                  )}
                  {order.orderStatus === "preparing" && (
                    <>
                      <option value="preparing">Preparing — In kitchen</option>
                      <option value="completed">Completed — Fulfilled</option>
                      <option value="cancelled">Cancelled — Order voided</option>
                    </>
                  )}
                </select>
              )}
            </label>

            {/* Payment Status */}
            <label className="form-field">
              <span>Payment Status</span>
              {isOnlinePayment ? (
                <div style={{ padding: "8px 12px", background: "var(--bg-subtle)", borderRadius: "6px", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <StatusBadge tone={PAYMENT_TONES[order.paymentStatus] || "neutral"}>
                      {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                    </StatusBadge>
                  </div>
                  <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "11px" }}>
                    Online payment status is cryptographically synchronized with Razorpay webhooks and cannot be manually modified by admin.
                  </p>
                </div>
              ) : (
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  disabled={updating}
                >
                  <option value="pending">Pending — Not yet collected</option>
                  <option value="paid">Paid — Cash collected at doorstep</option>
                  <option value="failed">Failed — Delivery rejected / uncollected</option>
                </select>
              )}
            </label>

            <div className="form-footer" style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updating || (isTerminalState && isOnlinePayment)}
              >
                {updating ? "Updating..." : "Save Status"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}