"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader, StatusBadge, Table, useToast } from "@/components/ui";
import { getAdminOrders } from "@/lib/api/orders";
import { getWhatsAppShareUrl } from "@/lib/whatsapp";

function WhatsAppIcon({ size = 14 }) {
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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");

  const toast = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.orderStatus = statusFilter;
      if (paymentFilter !== "all") params.paymentStatus = paymentFilter;

      const data = await getAdminOrders(params);
      setOrders(data);
    } catch (err) {
      toast(err.message || "Failed to load orders", "danger");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const orderNum = order.orderNumber?.toLowerCase() || "";
    const custName =
      order.customer?.name?.toLowerCase() ||
      `${order.deliveryAddress?.firstName || ""} ${order.deliveryAddress?.lastName || ""}`.toLowerCase();
    const phone = order.customer?.phone || order.deliveryAddress?.phone || "";

    return orderNum.includes(q) || custName.includes(q) || phone.includes(q);
  });

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        description="Manage incoming customer orders and update kitchen preparation and fulfillment status."
      />

      <div className="filter-bar">
        <label className="search-input">
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
            placeholder="Search by order #, name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="filter-select">
          <span>Order Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="preparing">Preparing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="filter-select">
          <span>Payment Status</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
      </div>

      <section className="surface data-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading orders...
          </div>
        ) : (
          <Table
            columns={[
              "Order #",
              "Customer",
              "Phone",
              "Items",
              "Total",
              "Payment",
              "Order Status",
              "Date & Time",
              "Action",
            ]}
            rows={filteredOrders}
            empty="No orders found matching the filter criteria"
            renderRow={(order) => {
              const customerName =
                order.customer?.name ||
                `${order.deliveryAddress?.firstName || ""} ${order.deliveryAddress?.lastName || ""}`.trim() ||
                "Customer";

              const phone = order.customer?.phone || order.deliveryAddress?.phone || "—";

              const itemsSummary = Array.isArray(order.items)
                ? order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")
                : "—";

              const createdDate = order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>
                    <strong>{customerName}</strong>
                  </td>
                  <td className="muted">{phone}</td>
                  <td
                    className="muted"
                    style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={itemsSummary}
                  >
                    {itemsSummary}
                  </td>
                  <td>
                    <strong>₹{order.total}</strong>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-start" }}>
                      <StatusBadge>{PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}</StatusBadge>
                      <small className="muted" style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>
                        {order.paymentMethod === "razorpay" ? "Online" : "COD"}
                      </small>
                    </div>
                  </td>
                  <td>
                    <StatusBadge>{STATUS_LABELS[order.orderStatus] || order.orderStatus}</StatusBadge>
                  </td>
                  <td className="muted">{createdDate}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Link className="row-action" href={`/dashboard/orders/${order._id}`}>
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const url = getWhatsAppShareUrl(order);
                          const opened = window.open(url, "_blank", "noopener,noreferrer");
                          if (!opened) window.location.assign(url);
                        }}
                        title="Share on WhatsApp"
                        aria-label="Share on WhatsApp"
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "3px",
                          color: "#16a34a",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 6px",
                          lineHeight: 1,
                        }}
                      >
                        <WhatsAppIcon size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        )}
      </section>
    </>
  );
}