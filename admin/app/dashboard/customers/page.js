"use client";

import { customers } from "@/lib/mock-data";
import { PageHeader, Table } from "@/components/ui";

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("");
}

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Customers"
        description="View and manage your customer base."
      />
      <div className="filter-bar">
        <label className="search-input">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="Search customers..." />
        </label>
      </div>
      <section className="surface data-surface">
        <Table
          columns={["Customer", "Phone", "Email", "Orders", "Bookings", "Total Spent", "Last Activity"]}
          rows={customers}
          renderRow={(c) => (
            <tr key={c.phone}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="avatar avatar-small">{initials(c.name)}</span>
                  <strong>{c.name}</strong>
                </div>
              </td>
              <td className="muted">{c.phone}</td>
              <td className="muted">{c.email}</td>
              <td>{c.orders}</td>
              <td>{c.bookings}</td>
              <td><strong>{c.spent}</strong></td>
              <td className="muted">{c.last}</td>
            </tr>
          )}
        />
      </section>
    </>
  );
}