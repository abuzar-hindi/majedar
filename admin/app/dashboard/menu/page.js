"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, PageHeader, Table, useToast } from "@/components/ui";
import { getAdminMenu, updateMenuItem, deleteMenuItem } from "@/lib/api/menu";
import { getAdminCategories } from "@/lib/api/categories";

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availableFilter, setAvailableFilter] = useState("all");
  const [bestsellerFilter, setBestsellerFilter] = useState("all");

  const toast = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuData, categoryData] = await Promise.all([
        getAdminMenu(),
        getAdminCategories(),
      ]);
      setItems(menuData);
      setCategories(categoryData);
    } catch (err) {
      toast(err.message || "Failed to load menu data", "danger");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleAvail = async (id, current) => {
    try {
      await updateMenuItem(id, { isAvailable: !current });
      setItems((prev) =>
        prev.map((it) => (it._id === id ? { ...it, isAvailable: !current } : it))
      );
      toast("Availability updated", "success");
    } catch (err) {
      toast(err.message || "Failed to update availability", "danger");
    }
  };

  const toggleBestseller = async (id, current) => {
    try {
      await updateMenuItem(id, { isBestseller: !current });
      setItems((prev) =>
        prev.map((it) => (it._id === id ? { ...it, isBestseller: !current } : it))
      );
      toast("Bestseller status updated", "success");
    } catch (err) {
      toast(err.message || "Failed to update bestseller status", "danger");
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteMenuItem(item._id);
      toast(`Menu item "${item.name}" deleted successfully`, "success");
      setItems((prev) => prev.filter((it) => it._id !== item._id));
    } catch (err) {
      toast(err.message || "Failed to delete item", "danger");
    }
  };

  // Client-side filtering for fast interactive feedback
  const filteredItems = items.filter((it) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = it.name?.toLowerCase().includes(q);
      const matchDesc = it.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    if (categoryFilter !== "all") {
      const catId = typeof it.category === "object" ? it.category?._id : it.category;
      if (catId !== categoryFilter) return false;
    }

    if (availableFilter !== "all") {
      const isAvail = availableFilter === "yes";
      if (Boolean(it.isAvailable) !== isAvail) return false;
    }

    if (bestsellerFilter !== "all") {
      const isBest = bestsellerFilter === "yes";
      if (Boolean(it.isBestseller) !== isBest) return false;
    }

    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title="Menu"
        description="Manage dishes, prices, categories, and live availability."
        action={<Button href="/dashboard/menu/add">+ Add Menu Item</Button>}
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
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="filter-select">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-select">
          <span>Available</span>
          <select
            value={availableFilter}
            onChange={(e) => setAvailableFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Available</option>
            <option value="no">Unavailable</option>
          </select>
        </label>

        <label className="filter-select">
          <span>Featured</span>
          <select
            value={bestsellerFilter}
            onChange={(e) => setBestsellerFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Bestseller</option>
            <option value="no">Standard</option>
          </select>
        </label>
      </div>

      <section className="surface data-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading menu items...
          </div>
        ) : (
          <Table
            columns={[
              "Dish",
              "Category",
              "Price",
              "Type",
              "Available",
              "Featured",
              "Actions",
            ]}
            rows={filteredItems}
            empty="No menu items match your search or filter"
            renderRow={(item) => {
              const catName =
                typeof item.category === "object"
                  ? item.category?.name
                  : categories.find((c) => c._id === item.category)?.name || "—";

              return (
                <tr key={item._id}>
                  <td>
                    <div className="dish-cell">
                      {item.image?.url ? (
                        <div
                          style={{
                            position: "relative",
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={item.image.url}
                            alt={item.name}
                            fill
                            sizes="36px"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        </div>
                      ) : (
                        <span className="item-thumb">
                          {item.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span>
                        <strong>{item.name}</strong>
                        <small className="muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.description}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>{catName}</td>
                  <td>
                    {item.pricingType === "half-full" ? (
                      <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                        <div><span className="muted">Half:</span> <strong>₹{item.halfPrice}</strong></div>
                        <div><span className="muted">Full:</span> <strong>₹{item.fullPrice}</strong></div>
                      </div>
                    ) : (
                      <strong>₹{item.price}</strong>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: item.isVeg ? "#DCFCE7" : "#FEE2E2",
                        color: item.isVeg ? "#166534" : "#991B1B",
                      }}
                    >
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`toggle ${item.isAvailable ? "on" : ""}`}
                      aria-label={`Toggle availability for ${item.name}`}
                      onClick={() => toggleAvail(item._id, item.isAvailable)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`toggle ${item.isBestseller ? "on" : ""}`}
                      aria-label={`Toggle featured for ${item.name}`}
                      onClick={() => toggleBestseller(item._id, item.isBestseller)}
                    />
                  </td>
                  <td>
                    <Link
                      className="row-action"
                      href={`/dashboard/menu/${item._id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="row-action danger"
                      style={{ marginLeft: 14 }}
                      onClick={() => handleDelete(item)}
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