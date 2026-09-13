"use client";

import { useState } from "react";
import Link from "next/link";
import { orders, drivers } from "@/lib/mock-data";
import { Button, Modal, PageHeader, StatusBadge } from "@/components/ui";

function TruckIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
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

export default function OrderDetailPage({ params }) {
  const id = params?.id || "";
  const order = orders.find((item) => item.id.replace("#", "") === id) || orders[0];

  const [status, setStatus] = useState(order.status);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const ORDER_STATUSES = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"];

  const buildWhatsAppMessage = () => {
    const driver = assignedDriver || { name: "[Driver Name]", phone: "[Driver Phone]" };
    const itemLines = order.itemList
      .map((it) => `  ${it.name} (${it.variant}) x${it.qty} — ₹${it.total}`)
      .join("\n");

    return `Majedaar Restaurant — Delivery

Order: ${order.id}

Customer:
${order.customer}

Phone:
${order.phone}

Delivery Address:
${order.address}

Order:
${itemLines}

Subtotal: ₹${order.subtotal}
Delivery: ₹${order.deliveryFee}
Total: ₹${order.total}

Please deliver this order to the customer.`;
  };

  const handleAssignDriver = () => {
    if (!selectedDriver) return;
    const driver = drivers.find((d) => d.id === selectedDriver);
    if (driver) setAssignedDriver(driver);
  };

  return (
    <>
      <PageHeader
        eyebrow={order.id}
        title="Order Details"
        description={`${order.date} · ${order.time}`}
        action={
          <>
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
          {/* Customer + order summary */}
          <article className="surface detail-card">
            <div className="detail-card-head">
              <div>
                <h3>{order.customer}</h3>
                <p className="muted">{order.phone}</p>
              </div>
              <StatusBadge>{status}</StatusBadge>
            </div>
            <div className="detail-grid">
              <div>
                <span className="detail-label">Delivery Type</span>
                <span className="detail-value">{order.deliveryType}</span>
              </div>
              <div>
                <span className="detail-label">Order Placed</span>
                <span className="detail-value">{order.date} at {order.time}</span>
              </div>
              <div>
                <span className="detail-label">Payment Status</span>
                <span className="detail-value"><StatusBadge>{order.payment}</StatusBadge></span>
              </div>
              <div>
                <span className="detail-label">Payment Method</span>
                <span className="detail-value">{order.paymentMethod || "—"}</span>
              </div>
              {order.paymentId && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <span className="detail-label">Payment ID</span>
                  <span className="detail-value" style={{ fontFamily: "monospace", fontSize: "11.5px" }}>{order.paymentId}</span>
                </div>
              )}
            </div>
          </article>

          {/* Ordered items */}
          <article className="surface detail-card">
            <p className="detail-section-title">Ordered Items</p>
            <div className="order-items">
              {order.itemList.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <div style={{ flex: 1 }}>
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-variant">{item.variant}</div>
                  </div>
                  <div className="order-item-qty">×{item.qty}</div>
                  <div className="order-item-total">₹{item.total}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--line-soft)" }}>
              <div className="totals-row">
                <span>Subtotal</span>
                <strong>₹{order.subtotal}</strong>
              </div>
              {order.deliveryFee > 0 && (
                <div className="totals-row">
                  <span>Delivery fee</span>
                  <strong>₹{order.deliveryFee}</strong>
                </div>
              )}
              <div className="totals-row grand">
                <span>Total</span>
                <strong>₹{order.total}</strong>
              </div>
            </div>
          </article>
        </div>

        {/* Right column */}
        <div className="form-stack">
          {/* Delivery panel */}
          <article className="surface delivery-panel">
            <h3>Delivery</h3>
            <div className="delivery-info">
              <div className="delivery-field">
                <span>Customer</span>
                <p>{order.customer}</p>
              </div>
              <div className="delivery-field">
                <span>Phone</span>
                <p>{order.phone}</p>
              </div>
              <div className="delivery-field">
                <span>Delivery Address</span>
                <p>{order.address}</p>
              </div>
            </div>

            {/* Driver assign */}
            {order.deliveryType === "Home Delivery" && (
              <div className="driver-assign">
                <p className="detail-label">Assign Driver</p>
                {assignedDriver ? (
                  <div className="assigned-driver">
                    <strong>{assignedDriver.name}</strong>
                    <small>{assignedDriver.phone}</small>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      aria-label="Select driver"
                    >
                      <option value="">Select driver</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} · {d.phone}
                        </option>
                      ))}
                    </select>
                    <button
                      className="button button-secondary"
                      onClick={handleAssignDriver}
                      disabled={!selectedDriver}
                      style={{ width: "100%" }}
                    >
                      Assign Driver
                    </button>
                  </>
                )}

                {/* Share with driver */}
                <button
                  className="button button-primary"
                  onClick={() => setShowShareModal(true)}
                  style={{ width: "100%", gap: 8, justifyContent: "center" }}
                >
                  <TruckIcon />
                  Share with Driver
                </button>
              </div>
            )}
          </article>

          {/* Timeline */}
          <article className="surface detail-card">
            <p className="detail-section-title">Order Timeline</p>
            <div className="timeline">
              <div className="timeline-item">
                <strong>Order placed</strong>
                <small>{order.date} · {order.time}</small>
              </div>
              <div className="timeline-item">
                <strong>Payment {order.payment.toLowerCase()}</strong>
                <small>{order.paymentMethod} · {order.paymentId || "—"}</small>
              </div>
              <div className="timeline-item">
                <strong>Status: {status}</strong>
                <small>Update using the button above</small>
              </div>
            </div>
            <div className="detail-actions">
              <Link href="/dashboard/orders" className="button button-secondary" style={{ width: "100%", justifyContent: "center" }}>
                Back to Orders
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <Modal title="Update Order Status" onClose={() => setShowStatusModal(false)}>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "18px" }}>
            Select the new status for order {order.id}.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px" }}>
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setShowStatusModal(false); }}
                style={{
                  background: status === s ? "var(--forest-soft)" : "transparent",
                  border: `1px solid ${status === s ? "var(--forest-mid)" : "var(--line)"}`,
                  color: status === s ? "var(--forest-deep)" : "var(--ink-mid)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "12.5px",
                  fontWeight: status === s ? 700 : 500,
                  padding: "10px 14px",
                  textAlign: "left",
                  transition: "all .15s",
                  width: "100%",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Share with Driver Modal */}
      {showShareModal && (
        <Modal title="Share with Driver" onClose={() => setShowShareModal(false)}>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "4px" }}>
            Review the delivery information before sharing.
            {!assignedDriver && (
              <span style={{ color: "var(--gold)", fontWeight: 600 }}> (Assign a driver first to pre-fill their details.)</span>
            )}
          </p>
          <pre className="whatsapp-preview">{buildWhatsAppMessage()}</pre>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button className="button button-secondary" onClick={() => setShowShareModal(false)}>Cancel</button>
            <button
              className="button button-primary"
              style={{ gap: 8 }}
              onClick={() => {
                // Future: window.open(`https://wa.me/${assignedDriver?.phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`)
                setShowShareModal(false);
                alert("WhatsApp sharing will be enabled when backend is connected.");
              }}
            >
              <TruckIcon /> Send via WhatsApp
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}