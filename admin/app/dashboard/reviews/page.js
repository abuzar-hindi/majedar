"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader, Table, EmptyState, useToast } from "@/components/ui";
import { getAdminReviews, deleteAdminReview } from "@/lib/api/reviews";

function StarRating({ rating }) {
  const stars = Math.min(5, Math.max(1, Number(rating) || 5));
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        color: "#F59E0B",
        fontSize: "14px",
        letterSpacing: "1px",
      }}
      title={`${stars} out of 5 stars`}
    >
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
      <span style={{ color: "var(--ink-mid)", fontSize: "11.5px", marginLeft: 4, fontWeight: 600 }}>
        ({stars}/5)
      </span>
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");

  const toast = useToast();

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (ratingFilter !== "all") {
        params.rating = ratingFilter;
      }
      const data = await getAdminReviews(params);
      setReviews(data);
    } catch (err) {
      toast(err.message || "Failed to load reviews", "danger");
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this rating for "${review.menuItem?.name || "Dish"}"?`
    );
    if (!confirmed) return;

    try {
      await deleteAdminReview(review._id);
      toast("Rating removed successfully", "success");
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      toast(err.message || "Failed to delete rating", "danger");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Customer Feedback"
        title="Ratings & Reviews"
        description="Monitor verified customer ratings (1–5 stars) across dishes."
      />

      <div className="filter-bar">
        <label className="filter-select">
          <span>Filter by Rating</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars (★★★★★)</option>
            <option value="4">4 Stars (★★★★☆)</option>
            <option value="3">3 Stars (★★★☆☆)</option>
            <option value="2">2 Stars (★★☆☆☆)</option>
            <option value="1">1 Star (★☆☆☆☆)</option>
          </select>
        </label>
      </div>

      <section className="surface data-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading customer ratings...
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No ratings found"
            description="Verified ratings submitted by customers after order completion will appear here."
          />
        ) : (
          <Table
            columns={["Customer", "Menu Item", "Star Rating", "Date", "Action"]}
            rows={reviews}
            renderRow={(r) => {
              const customerName =
                r.customer?.name ||
                `${r.customer?.firstName || ""} ${r.customer?.lastName || ""}`.trim() ||
                "Customer";

              const itemName = r.menuItem?.name || "Menu Item";
              const itemPrice = r.menuItem?.price ? `₹${r.menuItem.price}` : "";

              const dateStr = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                : "—";

              return (
                <tr key={r._id}>
                  <td>
                    <strong>{customerName}</strong>
                    {r.customer?.phone && (
                      <small className="muted">{r.customer.phone}</small>
                    )}
                  </td>
                  <td>
                    <strong>{itemName}</strong>
                    {itemPrice && <small className="muted">{itemPrice}</small>}
                  </td>
                  <td>
                    <StarRating rating={r.rating} />
                  </td>
                  <td className="muted">{dateStr}</td>
                  <td>
                    <button
                      type="button"
                      className="row-action danger"
                      onClick={() => handleDelete(r)}
                    >
                      Delete
                    </button>
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