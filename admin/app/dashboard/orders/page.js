"use client";

import Link from "next/link";
import { orders } from "@/lib/mock-data";
import { FilterBar, PageHeader, SelectFilter, StatusBadge, Table } from "@/components/ui";

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        description="Manage incoming orders and keep the kitchen and delivery status up to date."
      />
      <div className="filter-bar">
        <label className="search-input">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="Search orders..." />
        </label>
        <label className="filter-select">
          <span>Status</span>
          <select defaultValue="all">
            <option value="all">All</option>
            {["Pending","Confirmed","Preparing","Ready","Out for Delivery","Delivered","Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="filter-select">
          <span>Payment</span>
          <select defaultValue="all">
            <option value="all">All</option>
            {["Paid","Pending","Failed","Refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button className="button button-quiet">Today</button>
      </div>
      <section className="surface data-surface">
        <Table
          columns={["Order ID", "Customer", "Phone", "Items", "Amount", "Payment", "Status", "Time", ""]}
          rows={orders}
          renderRow={(order) => (
            <tr key={order.id}>
              <td><strong>{order.id}</strong></td>
              <td><strong>{order.customer}</strong></td>
              <td className="muted">{order.phone}</td>
              <td className="muted">{order.items}</td>
              <td><strong>{order.amount}</strong></td>
              <td><StatusBadge>{order.payment}</StatusBadge></td>
              <td><StatusBadge>{order.status}</StatusBadge></td>
              <td className="muted">{order.date}<br />{order.time}</td>
              <td>
                <Link className="row-action" href={`/dashboard/orders/${order.id.replace("#", "")}`}>
                  View
                </Link>
              </td>
            </tr>
          )}
        />
      </section>
    </>
  );
}