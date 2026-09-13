"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, ImageUpload } from "@/components/ui";
import { menuItems, categories } from "@/lib/mock-data";

export default function EditMenuItemPage({ params }) {
  const id = params?.id || "MI-01";
  const item = menuItems.find((m) => m.id === id) || menuItems[0];
  const [available, setAvailable] = useState(item.available);
  const [featured, setFeatured] = useState(item.featured);
  const hasVariants = item.variants.includes("/");
  const [pricingMode, setPricingMode] = useState(hasVariants ? "variants" : "single");

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title={`Edit: ${item.name}`}
        description={`Editing menu item ${item.id}`}
      />
      <form className="form-layout">
        <div className="form-stack">
          <section className="surface form-panel">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <label className="form-field full">
                <span>Dish Name</span>
                <input defaultValue={item.name} />
              </label>
              <label className="form-field">
                <span>Category</span>
                <select defaultValue={item.category}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Display Order</span>
                <input type="number" placeholder="e.g. 1" />
              </label>
              <label className="form-field full">
                <span>Description</span>
                <textarea rows={3} placeholder="Short description..." />
              </label>
            </div>
          </section>

          <section className="surface form-panel">
            <h2>Pricing</h2>
            <div className="pricing-options" style={{ marginBottom: 18 }}>
              <label className="pricing-radio">
                <input type="radio" name="pricing" value="single" checked={pricingMode === "single"} onChange={() => setPricingMode("single")} />
                <span>Single price</span>
              </label>
              <label className="pricing-radio">
                <input type="radio" name="pricing" value="variants" checked={pricingMode === "variants"} onChange={() => setPricingMode("variants")} />
                <span>Half / Full variants</span>
              </label>
            </div>
            {pricingMode === "single" ? (
              <label className="form-field">
                <span>Price (₹)</span>
                <input type="number" defaultValue={parseInt(item.price.replace(/\D/g, ""))} />
              </label>
            ) : (
              <div className="form-grid">
                <label className="form-field">
                  <span>Half Price (₹)</span>
                  <input type="number" placeholder="e.g. 160" />
                </label>
                <label className="form-field">
                  <span>Full Price (₹)</span>
                  <input type="number" placeholder="e.g. 280" />
                </label>
              </div>
            )}
          </section>
        </div>

        <div className="form-stack">
          <section className="surface form-panel">
            <h2>Image</h2>
            <ImageUpload />
          </section>
          <section className="surface form-panel">
            <h2>Status</h2>
            <div className="form-stack">
              <div className="switch-row">
                <div>
                  <strong>Available</strong>
                  <p>Visible and orderable by customers.</p>
                </div>
                <button type="button" className={`toggle ${available ? "on" : ""}`} aria-label="Toggle availability" onClick={() => setAvailable(!available)} />
              </div>
              <div className="switch-row">
                <div>
                  <strong>Featured</strong>
                  <p>Show in the bestsellers section.</p>
                </div>
                <button type="button" className={`toggle ${featured ? "on" : ""}`} aria-label="Toggle featured" onClick={() => setFeatured(!featured)} />
              </div>
            </div>
          </section>
          <div className="form-footer" style={{ borderTop: 0, marginTop: 0, paddingTop: 0, flexDirection: "column", alignItems: "stretch" }}>
            <button type="submit" className="button button-primary" style={{ justifyContent: "center" }}>Save Changes</button>
            <Link href="/dashboard/menu" className="button button-secondary" style={{ justifyContent: "center" }}>Cancel</Link>
            <button type="button" className="button button-danger" style={{ justifyContent: "center" }}>Delete Item</button>
          </div>
        </div>
      </form>
    </>
  );
}