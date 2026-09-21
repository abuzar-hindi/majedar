"use client";

import { useState, useEffect } from "react";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import { getAdminOrders } from "@/lib/api/orders";

function initials(name) {
  if (!name) return "CU";
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCustomersFromOrders() {
      setLoading(true);
      try {
        const orders = await getAdminOrders();

        // Aggregate unique customer records safely from real backend orders
        const customerMap = new Map();

        for (const order of orders) {
          const custId =
            order.customer?._id ||
            order.customer?.phone ||
            order.deliveryAddress?.phone ||
            order.deliveryAddress?.email;

          if (!custId) continue;

          const phone =
            order.customer?.phone || order.deliveryAddress?.phone || "—";
          const email =
            order.customer?.email || order.deliveryAddress?.email || "—";
          const name =
            order.customer?.name ||
            `${order.deliveryAddress?.firstName || ""} ${order.deliveryAddress?.lastName || ""}`.trim() ||
            "Customer";

          const isPaidOrCompleted =
            order.paymentStatus === "paid" || order.orderStatus === "completed";
          const orderTotal = isPaidOrCompleted ? Number(order.total) || 0 : 0;

          const orderDate = order.createdAt ? new Date(order.createdAt) : null;

          if (!customerMap.has(custId)) {
            customerMap.set(custId, {
              id: custId,
              name,
              phone,
              email,
              ordersCount: 1,
              totalSpent: orderTotal,
              lastOrder: orderDate,
            });
          } else {
            const existing = customerMap.get(custId);
            existing.ordersCount += 1;
            existing.totalSpent += orderTotal;
            if (orderDate && (!existing.lastOrder || orderDate > existing.lastOrder)) {
              existing.lastOrder = orderDate;
            }
          }
        }

        setCustomers(Array.from(customerMap.values()));
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    loadCustomersFromOrders();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Customers"
        description="Verified customer profiles and lifetime activity aggregated from real store orders."
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
            placeholder="Search customers by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <section className="surface data-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading customer records...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customer records found"
            description="Verified customer accounts will appear automatically as orders are placed."
          />
        ) : (
          <Table
            columns={[
              "Customer",
              "Phone",
              "Email",
              "Total Orders",
              "Total Spent",
              "Last Activity",
            ]}
            rows={filteredCustomers}
            renderRow={(c) => {
              const lastStr = c.lastOrder
                ? c.lastOrder.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="avatar avatar-small">{initials(c.name)}</span>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td className="muted">{c.phone}</td>
                  <td className="muted">{c.email}</td>
                  <td>
                    <strong>{c.ordersCount}</strong>
                  </td>
                  <td>
                    <strong>₹{Math.round(c.totalSpent).toLocaleString("en-IN")}</strong>
                  </td>
                  <td className="muted">{lastStr}</td>
                </tr>
              );
            }}
          />
        )}
      </section>
    </>
  );
}