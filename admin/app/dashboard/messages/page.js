"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { PageHeader, StatusBadge, Modal, EmptyState, useToast, Button } from "@/components/ui";
import { getAdminMessages, updateAdminMessageStatus } from "@/lib/api/messages";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeMessage, setActiveMessage] = useState(null);
  const [updating, setUpdating] = useState(false);

  const toast = useToast();

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.message || "Failed to load customer messages", "danger");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleStatusChange = async (messageId, newStatus) => {
    setUpdating(true);
    try {
      const updated = await updateAdminMessageStatus(messageId, newStatus);
      toast(`Message marked as ${newStatus}`, "success");
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status: newStatus } : m))
      );
      if (activeMessage && activeMessage._id === messageId) {
        setActiveMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast(err.message || "Failed to update message status", "danger");
    } finally {
      setUpdating(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (statusFilter !== "all" && msg.status !== statusFilter) return false;
      if (typeFilter !== "all" && msg.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = msg.name?.toLowerCase().includes(q);
        const matchEmail = msg.email?.toLowerCase().includes(q);
        const matchPhone = msg.phone?.toLowerCase().includes(q);
        const matchMsg = msg.message?.toLowerCase().includes(q);
        const matchOrder = msg.orderNumber?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchMsg && !matchOrder) return false;
      }
      return true;
    });
  }, [messages, statusFilter, typeFilter, search]);

  const typeBadgeColors = {
    complaint: { bg: "#FEE2E2", text: "#991B1B", label: "Complaint" },
    suggestion: { bg: "#FEF3C7", text: "#92400E", label: "Suggestion" },
    query: { bg: "#E0E7FF", text: "#3730A3", label: "Query" },
    order_issue: { bg: "#FEF2F2", text: "#B91C1C", label: "Order Issue" },
  };

  const statusBadgeTones = {
    new: "attention",
    read: "neutral",
    resolved: "completed",
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Customer Messages"
        description="Customer complaints, suggestions, and support queries."
        action={
          <Button variant="secondary" onClick={loadMessages} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <label className="search-input" style={{ flex: "1 1 240px", minWidth: 200 }}>
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search messages by name, contact, text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="filter-select">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>

        <label className="filter-select">
          <span>Type</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="complaint">Complaints</option>
            <option value="suggestion">Suggestions</option>
            <option value="query">Queries</option>
            <option value="order_issue">Order Issues</option>
          </select>
        </label>
      </div>

      {/* Messages Table */}
      <section className="surface table-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p className="muted">Loading messages...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer / Contact</th>
                  <th>Type</th>
                  <th>Message Preview</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length ? (
                  filteredMessages.map((item) => {
                    const badge = typeBadgeColors[item.type] || typeBadgeColors.query;
                    const dateFormatted = new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={item._id} style={{ cursor: "pointer" }} onClick={() => setActiveMessage(item)}>
                        <td>
                          <div>
                            <strong>{item.customer?.name || item.name || "Customer"}</strong>
                            <div className="muted" style={{ fontSize: "12px" }}>
                              {item.customer?.email || item.email || item.customer?.phone || item.phone || "No direct contact"}
                            </div>
                            {item.orderNumber && (
                              <div style={{ marginTop: 3 }}>
                                <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>
                                  Order #{item.orderNumber}
                                </span>
                              </div>
                            )}
                            {item.customer && !item.orderNumber && (
                              <span style={{ fontSize: "11px", color: "var(--forest)", fontWeight: 600 }}>
                                Registered Customer
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.text,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{
                              maxWidth: 320,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "13px",
                            }}
                          >
                            {item.message}
                          </div>
                        </td>
                        <td>
                          <span className="muted" style={{ fontSize: "12px" }}>
                            {dateFormatted}
                          </span>
                        </td>
                        <td>
                          <StatusBadge tone={statusBadgeTones[item.status] || "neutral"}>
                            {item.status.toUpperCase()}
                          </StatusBadge>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMessage(item);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="No messages found"
                        description="Customer inquiries and complaints will appear here."
                        compact
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Message Details Modal */}
      {activeMessage && (
        <Modal
          title={`Message from ${activeMessage.name}`}
          onClose={() => setActiveMessage(null)}
        >
          <div className="form-stack">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: (typeBadgeColors[activeMessage.type] || typeBadgeColors.query).bg,
                    color: (typeBadgeColors[activeMessage.type] || typeBadgeColors.query).text,
                    textTransform: "uppercase",
                    marginRight: 8,
                  }}
                >
                  {(typeBadgeColors[activeMessage.type] || typeBadgeColors.query).label}
                </span>
                <StatusBadge tone={statusBadgeTones[activeMessage.status] || "neutral"}>
                  {activeMessage.status.toUpperCase()}
                </StatusBadge>
              </div>
              <span className="muted" style={{ fontSize: "12px" }}>
                {new Date(activeMessage.createdAt).toLocaleString("en-IN")}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 0" }}>
              <div>
                <small className="muted" style={{ display: "block", textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}>
                  Contact Email
                </small>
                <strong>{activeMessage.customer?.email || activeMessage.email || "—"}</strong>
              </div>
              <div>
                <small className="muted" style={{ display: "block", textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}>
                  Contact Phone
                </small>
                <strong>{activeMessage.customer?.phone || activeMessage.phone || "—"}</strong>
              </div>
            </div>

            {(activeMessage.orderNumber || activeMessage.issueType) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: "10px 12px",
                  background: "var(--canvas)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  marginBottom: 8,
                }}
              >
                {activeMessage.orderNumber && (
                  <div>
                    <small className="muted" style={{ display: "block", textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}>
                      Linked Order
                    </small>
                    {activeMessage.order ? (
                      <Link
                        href={`/dashboard/orders/${activeMessage.order}`}
                        style={{ color: "var(--accent)", fontWeight: 700, fontSize: "13px", textDecoration: "underline" }}
                      >
                        #{activeMessage.orderNumber} (View Order)
                      </Link>
                    ) : (
                      <strong>#{activeMessage.orderNumber}</strong>
                    )}
                  </div>
                )}
                {activeMessage.issueType && (
                  <div>
                    <small className="muted" style={{ display: "block", textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}>
                      Issue Category
                    </small>
                    <strong style={{ textTransform: "capitalize", fontSize: "13px" }}>
                      {activeMessage.issueType.replace(/_/g, " ")}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <small className="muted" style={{ display: "block", textTransform: "uppercase", fontSize: "10px", fontWeight: 700, marginBottom: 6 }}>
                Message Content
              </small>
              <div
                style={{
                  background: "var(--canvas)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  color: "var(--foreground)",
                }}
              >
                {activeMessage.message}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              {activeMessage.status === "new" && (
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={updating}
                  onClick={() => handleStatusChange(activeMessage._id, "read")}
                >
                  Mark as Read
                </button>
              )}
              {activeMessage.status !== "resolved" && (
                <button
                  type="button"
                  className="button button-primary"
                  disabled={updating}
                  onClick={() => handleStatusChange(activeMessage._id, "resolved")}
                >
                  Mark as Resolved
                </button>
              )}
              {activeMessage.status === "resolved" && (
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={updating}
                  onClick={() => handleStatusChange(activeMessage._id, "read")}
                >
                  Re-open (Mark as Read)
                </button>
              )}
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setActiveMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}