"use client";

import { payments } from "@/lib/mock-data";
import { PageHeader, StatusBadge, Table } from "@/components/ui";

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Payments"
        description="Track payment status across all orders."
      />
      <div className="filter-bar">
        <label className="search-input">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="Search payments..." />
        </label>
        <label className="filter-select">
          <span>Status</span>
          <select defaultValue="all">
            <option value="all">All</option>
            {["Paid","Pending","Failed","Refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button className="button button-quiet">Today</button>
      </div>
      <section className="surface data-surface">
        <Table
          columns={["Payment ID", "Order ID", "Customer", "Amount", "Method", "Status", "Date", ""]}
          rows={payments}
          renderRow={(p) => (
            <tr key={p.id}>
              <td><span style={{ fontFamily: "monospace", fontSize: "11.5px" }}>{p.id}</span></td>
              <td><strong>{p.order}</strong></td>
              <td>{p.customer}</td>
              <td><strong>{p.amount}</strong></td>
              <td className="muted">{p.method}</td>
              <td><StatusBadge>{p.status}</StatusBadge></td>
              <td className="muted">{p.date}</td>
              <td><button className="row-action">View</button></td>
            </tr>
          )}
        />
      </section>
    </>
  );
}