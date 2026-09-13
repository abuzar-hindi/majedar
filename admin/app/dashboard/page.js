"use client";

import Link from "next/link";
import { bookings, orders } from "@/lib/mock-data";
import { PageHeader, StatusBadge, Table } from "@/components/ui";

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("");
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Saturday, 12 September 2026"
        title="Dashboard"
        description="Here is what is happening at Majedaar today."
      />

      {/* Summary */}
      <section className="summary-grid">
        <article className="summary-card">
          <p>Today&apos;s Orders</p>
          <div className="summary-number">28</div>
          <div className="summary-note">+12.5% from yesterday</div>
        </article>
        <article className="summary-card">
          <p>Today&apos;s Revenue</p>
          <div className="summary-number">₹18,420</div>
          <div className="summary-note">+8.2% from yesterday</div>
        </article>
        <article className="summary-card">
          <p>Pending Orders</p>
          <div className="summary-number">07</div>
          <div className="summary-note warn">3 need attention</div>
        </article>
        <article className="summary-card">
          <p>Today&apos;s Bookings</p>
          <div className="summary-number">12</div>
          <div className="summary-note neutral">4 tables available</div>
        </article>
      </section>

      {/* Content grid */}
      <div className="content-grid">
        {/* Recent orders */}
        <section className="surface">
          <div className="surface-heading">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest activity from the counter and kitchen.</p>
            </div>
            <Link href="/dashboard/orders">See all</Link>
          </div>
          <Table
            columns={["Order ID", "Customer", "Amount", "Status", "Time", ""]}
            rows={orders.slice(0, 5)}
            renderRow={(order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>
                  <strong>{order.customer}</strong>
                  <small className="muted">{order.items}</small>
                </td>
                <td><strong>{order.amount}</strong></td>
                <td><StatusBadge>{order.status}</StatusBadge></td>
                <td className="muted">{order.time}</td>
                <td>
                  <Link
                    className="row-action"
                    href={`/dashboard/orders/${order.id.replace("#", "")}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            )}
          />
        </section>

        {/* Today bookings */}
        <section className="surface">
          <div className="surface-heading">
            <div>
              <h2>Today&apos;s Bookings</h2>
              <p>Tables reserved for today.</p>
            </div>
            <Link href="/dashboard/bookings">See all</Link>
          </div>
          <div className="booking-list">
            {bookings.slice(0, 4).map((booking) => (
              <div className="booking-item" key={booking.id}>
                <span className="booking-avatar">{initials(booking.customer)}</span>
                <div>
                  <strong>{booking.customer}</strong>
                  <small>
                    {booking.time} · {booking.guests} guests · {booking.table}
                  </small>
                </div>
                <StatusBadge>{booking.status}</StatusBadge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}