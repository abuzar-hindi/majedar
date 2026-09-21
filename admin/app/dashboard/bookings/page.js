"use client";

import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/ui";

export default function BookingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Front of House"
        title="Table Bookings"
        description="Dine-in table reservation system."
      />

      <section className="surface" style={{ padding: "40px", textAlign: "center" }}>
        <EmptyState
          title="Booking system coming soon"
          description="Dine-in table booking and reservation management APIs will be connected in an upcoming phase. Currently, the kitchen is actively fulfilling delivery and takeout orders."
        />
        <div style={{ marginTop: 20 }}>
          <Link href="/dashboard/orders" className="button button-primary">
            View Live Orders
          </Link>
        </div>
      </section>
    </>
  );
}