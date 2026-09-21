"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader, StatusBadge, Table, EmptyState } from "@/components/ui";
import { getAdminOrders } from "@/lib/api/orders";

const STATUS_LABELS = {
  placed: "Placed",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardOrders() {
      try {
        const data = await getAdminOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardOrders();
  }, []);

  const totalOrders = orders.length;

  // Authoritative rule: Revenue must be calculated ONLY from orders whose paymentStatus is actually "paid"
  const paidRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const activeOrders = orders.filter(
    (o) => o.orderStatus === "placed" || o.orderStatus === "preparing"
  );

  const completedOrders = orders.filter((o) => o.orderStatus === "completed");

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow={todayStr}
        title="Dashboard"
        description="Real-time operational summary computed authoritatively from restaurant orders."
      />

      {/* Summary Grid */}
      <section className="summary-grid">
        <article className="summary-card">
          <p>Total Orders</p>
          <div className="summary-number">
            {loading ? "..." : totalOrders}
          </div>
          <div className="summary-note">All recorded customer orders</div>
        </article>

        <article className="summary-card">
          <p>Verified Paid Revenue</p>
          <div className="summary-number">
            {loading ? "..." : `₹${Math.round(paidRevenue).toLocaleString("en-IN")}`}
          </div>
          <div className="summary-note">Orders with paymentStatus &quot;paid&quot;</div>
        </article>

        <article className="summary-card">
          <p>Active Orders</p>
          <div className="summary-number">
            {loading ? "..." : activeOrders.length}
          </div>
          <div className={`summary-note ${activeOrders.length > 0 ? "warn" : "neutral"}`}>
            {activeOrders.length > 0 ? `${activeOrders.length} in kitchen queue` : "Kitchen queue clear"}
          </div>
        </article>

        <article className="summary-card">
          <p>Completed Orders</p>
          <div className="summary-number">
            {loading ? "..." : completedOrders.length}
          </div>
          <div className="summary-note neutral">Fulfilled orders</div>
        </article>
      </section>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Orders */}
        <section className="surface">
          <div className="surface-heading">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest customer activity from online orders.</p>
            </div>
            <Link href="/dashboard/orders">See all</Link>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
              Loading recent orders...
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Incoming orders will appear here in real time."
              compact
            />
          ) : (
            <Table
              columns={["Order #", "Customer", "Amount", "Status", "Time", ""]}
              rows={orders.slice(0, 5)}
              renderRow={(order) => {
                const customerName =
                  order.customer?.name ||
                  `${order.deliveryAddress?.firstName || ""} ${order.deliveryAddress?.lastName || ""}`.trim() ||
                  "Customer";

                const itemsCount = Array.isArray(order.items)
                  ? `${order.items.length} item${order.items.length === 1 ? "" : "s"}`
                  : "";

                const timeStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
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
                      <small className="muted">{itemsCount}</small>
                    </td>
                    <td>
                      <strong>₹{order.total}</strong>
                    </td>
                    <td>
                      <StatusBadge>{STATUS_LABELS[order.orderStatus] || order.orderStatus}</StatusBadge>
                    </td>
                    <td className="muted">{timeStr}</td>
                    <td>
                      <Link className="row-action" href={`/dashboard/orders/${order._id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              }}
            />
          )}
        </section>

        {/* Active Kitchen Queue */}
        <section className="surface">
          <div className="surface-heading">
            <div>
              <h2>Active Orders Queue</h2>
              <p>Dishes currently placed or preparing.</p>
            </div>
            <Link href="/dashboard/orders">Manage</Link>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
              Loading queue...
            </div>
          ) : activeOrders.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ color: "var(--muted)", fontSize: "12.5px" }}>
                No active orders in preparation right now.
              </p>
            </div>
          ) : (
            <div className="booking-list">
              {activeOrders.slice(0, 5).map((order) => {
                const custName =
                  order.customer?.name ||
                  `${order.deliveryAddress?.firstName || ""} ${order.deliveryAddress?.lastName || ""}`.trim() ||
                  "Customer";

                const itemsList = Array.isArray(order.items)
                  ? order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")
                  : "Items";

                return (
                  <div className="booking-item" key={order._id}>
                    <span
                      className="booking-avatar"
                      style={{
                        background: order.orderStatus === "placed" ? "#FEF3C7" : "var(--forest-soft)",
                        color: order.orderStatus === "placed" ? "#B45309" : "var(--forest-deep)",
                      }}
                    >
                      {order.orderStatus === "placed" ? "NEW" : "PREP"}
                    </span>
                    <div>
                      <strong>{custName} — {order.orderNumber}</strong>
                      <small style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {itemsList}
                      </small>
                    </div>
                    <StatusBadge>{STATUS_LABELS[order.orderStatus] || order.orderStatus}</StatusBadge>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}