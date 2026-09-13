"use client";

import { bookings } from "@/lib/mock-data";
import { Button, PageHeader, StatusBadge, Table } from "@/components/ui";

export default function BookingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Front of House"
        title="Bookings"
        description="Manage dine-in table reservations."
        action={<Button>+ New Booking</Button>}
      />
      <div className="filter-bar">
        <label className="search-input">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="Search bookings..." />
        </label>
        <label className="filter-select">
          <span>Status</span>
          <select defaultValue="all">
            <option value="all">All</option>
            {["Confirmed","Pending","Completed","Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button className="button button-quiet">12 Sep 2026</button>
      </div>
      <section className="surface data-surface">
        <Table
          columns={["Booking ID", "Customer", "Phone", "Date", "Time", "Guests", "Table", "Status", "Action"]}
          rows={bookings}
          renderRow={(booking) => (
            <tr key={booking.id}>
              <td><strong>{booking.id}</strong></td>
              <td>
                <strong>{booking.customer}</strong>
                <small className="muted">{booking.notes || "No notes"}</small>
              </td>
              <td className="muted">{booking.phone}</td>
              <td>{booking.date}</td>
              <td>{booking.time}</td>
              <td>{booking.guests}</td>
              <td><strong>{booking.table}</strong></td>
              <td><StatusBadge>{booking.status}</StatusBadge></td>
              <td>
                <button className="row-action">View</button>
              </td>
            </tr>
          )}
        />
      </section>
    </>
  );
}