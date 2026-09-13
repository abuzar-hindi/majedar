"use client";

import { useState } from "react";
import Link from "next/link";
import { menuItems } from "@/lib/mock-data";
import { Button, PageHeader, Table } from "@/components/ui";

export default function MenuPage() {
  const [items, setItems] = useState(menuItems);

  const toggleAvail = (id) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, available: !it.available } : it));
  const toggleFeatured = (id) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, featured: !it.featured } : it));

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title="Menu"
        description="Manage dishes, prices, availability and categories."
        action={<Button href="/dashboard/menu/add">+ Add Menu Item</Button>}
      />
      <div className="filter-bar">
        <label className="search-input">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="Search dishes..." />
        </label>
        <label className="filter-select">
          <span>Category</span>
          <select defaultValue="all"><option value="all">All</option>{["Chinese","Burgers","Pizza","South Indian","Rice & Biryani","Momos"].map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
        <label className="filter-select">
          <span>Available</span>
          <select defaultValue="all"><option value="all">All</option><option value="yes">Available</option><option value="no">Unavailable</option></select>
        </label>
        <label className="filter-select">
          <span>Featured</span>
          <select defaultValue="all"><option value="all">All</option><option value="yes">Featured</option><option value="no">Standard</option></select>
        </label>
      </div>
      <section className="surface data-surface">
        <Table
          columns={["Dish", "Category", "Price", "Variants", "Available", "Featured", "Actions"]}
          rows={items}
          renderRow={(item) => (
            <tr key={item.id}>
              <td>
                <div className="dish-cell">
                  <span className="item-thumb">{item.image}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.id}</small>
                  </span>
                </div>
              </td>
              <td>{item.category}</td>
              <td><strong>{item.price}</strong></td>
              <td className="muted">{item.variants}</td>
              <td>
                <button
                  className={`toggle ${item.available ? "on" : ""}`}
                  aria-label={`Toggle availability for ${item.name}`}
                  onClick={() => toggleAvail(item.id)}
                />
              </td>
              <td>
                <button
                  className={`toggle ${item.featured ? "on" : ""}`}
                  aria-label={`Toggle featured for ${item.name}`}
                  onClick={() => toggleFeatured(item.id)}
                />
              </td>
              <td>
                <Link className="row-action" href={`/dashboard/menu/${item.id}/edit`}>Edit</Link>
                <button className="row-action danger" style={{ marginLeft: 14 }}>Delete</button>
              </td>
            </tr>
          )}
        />
      </section>
    </>
  );
}