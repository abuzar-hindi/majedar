"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  PageHeader,
  StatusBadge,
  Table,
  EmptyState,
  SearchInput,
  Button,
  Modal,
  useToast,
} from "@/components/ui";
import { getAdminPayments, initiateRefund } from "@/lib/api/payments";

const STATUS_LABELS = {
  created: "Created",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_TONES = {
  paid: "paid",
  failed: "cancelled",
  refunded: "refunded",
  pending: "pending",
  created: "neutral",
};

export default function PaymentsPage() {
  const [result, setResult] = useState({ attempts: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Selected payment for Details Modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Refund dialog state
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmountRupees, setRefundAmountRupees] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const toast = useToast();

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (methodFilter !== "all") {
        params.method = methodFilter;
      }

      const data = await getAdminPayments(params);
      setResult(data || { attempts: [], total: 0, page: 1, limit: pageSize });
    } catch (err) {
      toast(err?.message || "Failed to load payment records", "danger");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, methodFilter, toast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const attempts = useMemo(() => result.attempts || [], [result.attempts]);

  // Client-side search filtering across order #, customer, IDs
  const filteredAttempts = useMemo(() => {
    if (!searchQuery.trim()) return attempts;
    const q = searchQuery.trim().toLowerCase();
    return attempts.filter((a) => {
      const orderNum = (a.order?.orderNumber || "").toLowerCase();
      const custName = (a.customer?.name || "").toLowerCase();
      const custEmail = (a.customer?.email || "").toLowerCase();
      const custPhone = (a.customer?.phone || "").toLowerCase();
      const rzpPayId = (a.razorpayPaymentId || "").toLowerCase();
      const rzpOrdId = (a.razorpayOrderId || "").toLowerCase();
      const payId = (a._id || "").toLowerCase();

      return (
        orderNum.includes(q) ||
        custName.includes(q) ||
        custEmail.includes(q) ||
        custPhone.includes(q) ||
        rzpPayId.includes(q) ||
        rzpOrdId.includes(q) ||
        payId.includes(q)
      );
    });
  }, [attempts, searchQuery]);

  const totalPages = Math.ceil((result.total || 0) / pageSize) || 1;

  // Open Details Modal
  const handleOpenDetails = (attempt) => {
    setSelectedPayment(attempt);
    setShowRefundForm(false);
    setRefundAmountRupees(attempt.amount ? (attempt.amount / 100).toFixed(2) : "");
    setRefundReason("");
  };

  // Submit refund
  const handleInitiateRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment?._id) return;

    const amountInRupees = parseFloat(refundAmountRupees);
    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      toast("Please enter a valid refund amount", "danger");
      return;
    }

    const maxRupees = selectedPayment.amount / 100;
    if (amountInRupees > maxRupees) {
      toast(`Refund amount cannot exceed original payment (₹${maxRupees.toFixed(2)})`, "danger");
      return;
    }

    const amountInPaise = Math.round(amountInRupees * 100);

    setRefunding(true);
    try {
      const updated = await initiateRefund(selectedPayment._id, amountInPaise);
      toast("Refund initiated successfully via Razorpay", "success");
      setSelectedPayment(updated || { ...selectedPayment, status: "refunded", refundAmount: amountInPaise });
      setShowRefundForm(false);
      loadPayments();
    } catch (err) {
      toast(err?.message || "Failed to process refund", "danger");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Payments"
        description={`Authoritative transaction attempts and payment history. Each row is an individual payment attempt. Total records: ${result.total}`}
      />

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 240px", maxWidth: "340px" }}>
          <SearchInput
            placeholder="Search Order #, Customer, Rzp ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <label className="filter-select">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="created">Created</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>

        <label className="filter-select">
          <span>Method</span>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Methods</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallet</option>
          </select>
        </label>
      </div>

      {/* Main Table Surface */}
      <section className="surface data-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading payment records from backend...
          </div>
        ) : filteredAttempts.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="Payment attempt records will appear here as customers place and process orders."
          />
        ) : (
          <Table
            columns={[
              "Payment / Razorpay ID",
              "Order #",
              "Customer",
              "Amount",
              "Method",
              "Status",
              "Date & Time",
              "Actions",
            ]}
            rows={filteredAttempts}
            renderRow={(attempt) => {
              const customerName = attempt.customer?.name || "Customer";
              const orderNumber = attempt.order?.orderNumber || "—";
              const orderId = attempt.order?._id || attempt.order;
              const amountRupees = attempt.amount ? (attempt.amount / 100).toFixed(2) : "0.00";

              const formattedDate = attempt.createdAt
                ? new Date(attempt.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              const statusTone = STATUS_TONES[attempt.status] || "neutral";

              return (
                <tr key={attempt._id}>
                  <td>
                    <code style={{ fontSize: "11.5px", fontWeight: 600 }}>
                      {attempt.razorpayPaymentId || attempt._id?.slice(-8) || "—"}
                    </code>
                    {attempt.razorpayOrderId && (
                      <small className="muted" style={{ display: "block", fontSize: "10.5px" }}>
                        Order: {attempt.razorpayOrderId}
                      </small>
                    )}
                  </td>
                  <td>
                    <strong>{orderNumber}</strong>
                    {attempt.refundId && (
                      <small className="muted" style={{ display: "block", fontSize: "10px", color: "var(--purple, #7c3aed)" }}>
                        Refund: {attempt.refundId}
                      </small>
                    )}
                  </td>
                  <td>
                    <strong>{customerName}</strong>
                    {attempt.customer?.phone && (
                      <small className="muted" style={{ display: "block", fontSize: "11px" }}>
                        {attempt.customer.phone}
                      </small>
                    )}
                  </td>
                  <td>
                    <strong style={{ fontSize: "13px" }}>₹{amountRupees}</strong>
                    {attempt.refundAmount && (
                      <small className="muted" style={{ display: "block", fontSize: "10px", color: "var(--purple, #7c3aed)" }}>
                        Refunded: ₹{(attempt.refundAmount / 100).toFixed(2)}
                      </small>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        textTransform: "uppercase",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {attempt.method || "ONLINE"}
                    </span>
                  </td>
                  <td>
                    <StatusBadge tone={statusTone}>
                      {STATUS_LABELS[attempt.status] || attempt.status}
                    </StatusBadge>
                    {attempt.failureReason && (
                      <small
                        style={{
                          display: "block",
                          color: "var(--danger, #dc2626)",
                          fontSize: "10px",
                          marginTop: "2px",
                          maxWidth: "140px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={attempt.failureReason}
                      >
                        {attempt.failureReason}
                      </small>
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: "11.5px" }}>
                    {formattedDate}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="row-action"
                        onClick={() => handleOpenDetails(attempt)}
                        style={{ cursor: "pointer" }}
                      >
                        Details
                      </button>
                      {orderId && (
                        <Link className="row-action" href={`/dashboard/orders/${orderId}`}>
                          Order
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
              borderTop: "1px solid var(--line-soft)",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            <span>
              Showing Page {currentPage} of {totalPages} ({result.total} total records)
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="button button-secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                style={{ padding: "4px 12px", fontSize: "11px" }}
              >
                Previous
              </button>
              <button
                type="button"
                className="button button-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                style={{ padding: "4px 12px", fontSize: "11px" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Summary Stats Footer */}
      {!loading && attempts.length > 0 && (
        <section className="surface" style={{ marginTop: "16px" }}>
          <div style={{ padding: "16px 20px", display: "flex", gap: "28px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "2px" }}>
                Total Records
              </div>
              <strong>{result.total}</strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "2px" }}>
                Paid Attempts
              </div>
              <strong style={{ color: "var(--forest-mid, #16a34a)" }}>
                {attempts.filter((a) => a.status === "paid").length}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "2px" }}>
                Failed Attempts
              </div>
              <strong style={{ color: "var(--danger, #dc2626)" }}>
                {attempts.filter((a) => a.status === "failed").length}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "2px" }}>
                Verified Paid Revenue (This Page)
              </div>
              <strong style={{ color: "var(--forest-mid, #16a34a)" }}>
                ₹{(
                  attempts
                    .filter((a) => a.status === "paid")
                    .reduce((sum, a) => sum + (a.amount || 0), 0) / 100
                ).toFixed(2)}
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Modal
          title={`Payment Attempt Details`}
          onClose={() => {
            setSelectedPayment(null);
            setShowRefundForm(false);
          }}
        >
          <div className="form-stack" style={{ gap: "14px" }}>
            {/* Header info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
                padding: "12px",
                background: "var(--bg-subtle, #faf8f5)",
                borderRadius: "8px",
                border: "1px solid var(--line-soft)",
              }}
            >
              <div>
                <span className="detail-label" style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Restaurant Order
                </span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "13px" }}>
                  {selectedPayment.order?.orderNumber || "—"}
                </p>
                {selectedPayment.order?._id && (
                  <Link
                    href={`/dashboard/orders/${selectedPayment.order._id}`}
                    style={{ fontSize: "11px", color: "var(--forest-mid)", textDecoration: "underline" }}
                  >
                    Open Order Details →
                  </Link>
                )}
              </div>
              <div>
                <span className="detail-label" style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Payment Status
                </span>
                <div>
                  <StatusBadge tone={STATUS_TONES[selectedPayment.status] || "neutral"}>
                    {STATUS_LABELS[selectedPayment.status] || selectedPayment.status}
                  </StatusBadge>
                </div>
              </div>
            </div>

            {/* Technical Identifiers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
              <div className="delivery-field">
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Razorpay Payment ID</span>
                <code style={{ fontSize: "12px" }}>{selectedPayment.razorpayPaymentId || "Not initiated / Pending"}</code>
              </div>
              <div className="delivery-field">
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Razorpay Order ID</span>
                <code style={{ fontSize: "12px" }}>{selectedPayment.razorpayOrderId || "—"}</code>
              </div>
              <div className="delivery-field">
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Attempt Internal ID</span>
                <code style={{ fontSize: "11px" }}>{selectedPayment._id}</code>
              </div>
            </div>

            {/* Customer & Amount */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
                borderTop: "1px solid var(--line-soft)",
                paddingTop: "12px",
              }}
            >
              <div>
                <span className="detail-label" style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Customer
                </span>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "12.5px" }}>
                  {selectedPayment.customer?.name || "Customer"}
                </p>
                <small className="muted" style={{ display: "block", fontSize: "11px" }}>
                  {selectedPayment.customer?.email || ""}
                </small>
                <small className="muted" style={{ display: "block", fontSize: "11px" }}>
                  {selectedPayment.customer?.phone || ""}
                </small>
              </div>

              <div>
                <span className="detail-label" style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Authoritative Amount
                </span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "var(--forest-dark)" }}>
                  ₹{selectedPayment.amount ? (selectedPayment.amount / 100).toFixed(2) : "0.00"}{" "}
                  <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>
                    ({selectedPayment.currency || "INR"})
                  </span>
                </p>
                <small className="muted" style={{ display: "block", fontSize: "11px", textTransform: "uppercase" }}>
                  Method: {selectedPayment.method || "Online"}
                </small>
              </div>
            </div>

            {/* Failure Reason if any */}
            {selectedPayment.failureReason && (
              <div
                style={{
                  padding: "10px",
                  background: "var(--danger-subtle, #fef2f2)",
                  border: "1px solid var(--danger-border, #fecaca)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--danger, #dc2626)",
                }}
              >
                <strong>Failure Reason: </strong> {selectedPayment.failureReason}
              </div>
            )}

            {/* Timestamps */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
                fontSize: "11.5px",
                color: "var(--muted)",
                borderTop: "1px solid var(--line-soft)",
                paddingTop: "10px",
              }}
            >
              <div>
                <span>Created: </span>
                <strong>
                  {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString("en-IN") : "—"}
                </strong>
              </div>
              <div>
                <span>Updated: </span>
                <strong>
                  {selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString("en-IN") : "—"}
                </strong>
              </div>
            </div>

            {/* Refund Information */}
            {selectedPayment.refundId ? (
              <div
                style={{
                  padding: "12px",
                  background: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                <strong style={{ color: "#6d28d9", display: "block", marginBottom: "4px" }}>
                  Refund Information
                </strong>
                <div>Refund ID: <code>{selectedPayment.refundId}</code></div>
                <div>
                  Refunded Amount: <strong>₹{selectedPayment.refundAmount ? (selectedPayment.refundAmount / 100).toFixed(2) : "0.00"}</strong>
                </div>
                <div>Status: <span style={{ textTransform: "capitalize" }}>{selectedPayment.refundStatus || "processed"}</span></div>
              </div>
            ) : selectedPayment.status === "paid" ? (
              /* Initiate Refund section */
              <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: "12px" }}>
                {!showRefundForm ? (
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowRefundForm(true)}
                    style={{ width: "100%", justifyContent: "center", color: "var(--danger, #dc2626)" }}
                  >
                    Initiate Refund via Razorpay
                  </Button>
                ) : (
                  <form onSubmit={handleInitiateRefund} className="form-stack" style={{ gap: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "12.5px", color: "var(--danger, #dc2626)" }}>
                      Confirm Razorpay Refund
                    </h4>
                    <label className="form-field">
                      <span>Refund Amount (₹)</span>
                      <input
                        type="number"
                        step="0.01"
                        max={selectedPayment.amount / 100}
                        min="1"
                        value={refundAmountRupees}
                        onChange={(e) => setRefundAmountRupees(e.target.value)}
                        required
                        disabled={refunding}
                      />
                    </label>
                    <label className="form-field">
                      <span>Reason (Optional)</span>
                      <input
                        type="text"
                        placeholder="e.g. Customer requested cancellation"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        disabled={refunding}
                      />
                    </label>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setShowRefundForm(false)}
                        disabled={refunding}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={refunding}>
                        {refunding ? "Processing Refund..." : "Confirm Refund"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Button variant="secondary" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}