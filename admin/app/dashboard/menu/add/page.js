"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, ImageUpload } from "@/components/ui";
import { categories } from "@/lib/mock-data";

export default function AddMenuItemPage() {
  const [pricingMode, setPricingMode] = useState("single");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title="Add Menu Item"
        description="Add a new dish to the Majedaar menu."
      />
      <form className="form-layout">
        <div className="form-stack">
          {/* Basic */}
          <section className="surface form-panel">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <label className="form-field full">
                <span>Dish Name</span>
                <input placeholder="e.g. Paneer Chilli" />
              </label>
              <label className="form-field">
                <span>Category</span>
                <select defaultValue="">
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Display Order</span>
                <input type="number" placeholder="e.g. 1" />
              </label>
              <label className="form-field full">
                <span>Description</span>
                <textarea rows={3} placeholder="Short description of the dish..." />
              </label>
            </div>
          </section>

          {/* Pricing */}
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
                <input type="number" placeholder="e.g. 260" />
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
          {/* Image */}
          <section className="surface form-panel">
            <h2>Image</h2>
            <ImageUpload />
          </section>

          {/* Availability & Featured */}
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

          <div className="form-footer" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
            <Link href="/dashboard/menu" className="button button-secondary">Cancel</Link>
            <button type="submit" className="button button-primary">Add Menu Item</button>
          </div>
        </div>
      </form>
    </>
  );
}