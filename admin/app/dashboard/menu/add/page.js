"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PageHeader, useToast, Toggle } from "@/components/ui";
import { getAdminCategories } from "@/lib/api/categories";
import { createMenuItem } from "@/lib/api/menu";

export default function AddMenuItemPage() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricingType, setPricingType] = useState("single");
  const [price, setPrice] = useState("");
  const [halfPrice, setHalfPrice] = useState("");
  const [fullPrice, setFullPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);

  // Image handling
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getAdminCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0]._id);
        }
      } catch (err) {
        toast(err.message || "Failed to load categories", "danger");
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [toast]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("Image size cannot exceed 5 MB", "danger");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Dish name is required", "danger");
      return;
    }
    if (!categoryId) {
      toast("Please select a category", "danger");
      return;
    }

    let priceNum = null;
    let halfPriceNum = null;
    let fullPriceNum = null;

    if (pricingType === "single") {
      priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast("Please provide a valid price greater than 0", "danger");
        return;
      }
    } else {
      halfPriceNum = parseFloat(halfPrice);
      fullPriceNum = parseFloat(fullPrice);
      if (isNaN(halfPriceNum) || halfPriceNum <= 0) {
        toast("Please provide a valid Half price greater than 0", "danger");
        return;
      }
      if (isNaN(fullPriceNum) || fullPriceNum <= 0) {
        toast("Please provide a valid Full price greater than 0", "danger");
        return;
      }
    }

    if (!description.trim() || description.trim().length < 5) {
      toast("Description must be at least 5 characters long", "danger");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", categoryId);
    formData.append("pricingType", pricingType);
    if (pricingType === "single") {
      formData.append("price", String(priceNum));
    } else {
      formData.append("halfPrice", String(halfPriceNum));
      formData.append("fullPrice", String(fullPriceNum));
    }
    formData.append("description", description.trim());
    formData.append("isVeg", String(isVeg));
    formData.append("isAvailable", String(isAvailable));
    formData.append("isBestseller", String(isBestseller));

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      await createMenuItem(formData);
      toast("Menu item created successfully", "success");
      router.push("/dashboard/menu");
    } catch (err) {
      toast(err.message || "Failed to create menu item", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title="Add Menu Item"
        description="Add a new dish to the Majedaar menu with authoritative pricing."
      />

      <form className="form-layout" onSubmit={handleSubmit}>
        <div className="form-stack">
          {/* Basic Information */}
          <section className="surface form-panel">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <label className="form-field full">
                <span>Dish Name</span>
                <input
                  placeholder="e.g. Paneer Tikka Butter Masala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>

              <label className="form-field">
                <span>Category</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories || submitting}
                  required
                >
                  {loadingCategories ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="form-field">
                <span>Dietary Type</span>
                <select
                  value={isVeg ? "veg" : "nonveg"}
                  onChange={(e) => setIsVeg(e.target.value === "veg")}
                  disabled={submitting}
                >
                  <option value="veg">Vegetarian</option>
                  <option value="nonveg">Non-Vegetarian</option>
                </select>
              </label>

              <label className="form-field full">
                <span>Description (min 5 characters)</span>
                <textarea
                  rows={3}
                  placeholder="Detailed description of the dish and ingredients..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
            </div>
          </section>

          {/* Dynamic Pricing Mode Panel */}
          <section className="surface form-panel">
            <h2>Pricing</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "14px" }}>
              Configure single pricing or half &amp; full portions.
            </p>

            <label className="form-field" style={{ marginBottom: 14 }}>
              <span>Pricing Mode</span>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value)}
                disabled={submitting}
              >
                <option value="single">Single Price</option>
                <option value="half-full">Half &amp; Full</option>
              </select>
            </label>

            {pricingType === "single" ? (
              <label className="form-field">
                <span>Price (₹)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 180"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
            ) : (
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="form-field">
                  <span>Half Price (₹)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 100"
                    value={halfPrice}
                    onChange={(e) => setHalfPrice(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </label>
                <label className="form-field">
                  <span>Full Price (₹)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 180"
                    value={fullPrice}
                    onChange={(e) => setFullPrice(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </label>
              </div>
            )}
          </section>
        </div>

        <div className="form-stack">
          {/* Image Upload */}
          <section className="surface form-panel">
            <h2>Image</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div
              className="upload-box"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              {previewUrl ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "90px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      margin: "0 auto 8px",
                    }}
                  >
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      sizes="120px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                  <span>Click to change image</span>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 16l4-4m0 0l4 4m-4-4v12M20 16V8a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  <strong>Drop a dish photo here</strong>
                  <span>or click to browse from device</span>
                  <small>JPG, PNG or WEBP · max 5 MB</small>
                </>
              )}
            </div>
          </section>

          {/* Operational Status */}
          <section className="surface form-panel">
            <h2>Status</h2>
            <div className="form-stack">
              <div className="switch-row">
                <div>
                  <strong>Available</strong>
                  <p>Orderable by customers right now.</p>
                </div>
                <Toggle
                  on={isAvailable}
                  onToggle={() => setIsAvailable(!isAvailable)}
                  label="Toggle item availability"
                />
              </div>
              <div className="switch-row">
                <div>
                  <strong>Bestseller / Featured</strong>
                  <p>Highlight in the featured menu section.</p>
                </div>
                <Toggle
                  on={isBestseller}
                  onToggle={() => setIsBestseller(!isBestseller)}
                  label="Toggle bestseller status"
                />
              </div>
            </div>
          </section>

          <div
            className="form-footer"
            style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}
          >
            <Link
              href="/dashboard/menu"
              className="button button-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Menu Item"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}