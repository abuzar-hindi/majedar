"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PageHeader, useToast, Toggle } from "@/components/ui";
import { getAdminCategories } from "@/lib/api/categories";
import { getAdminMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api/menu";

export default function EditMenuItemPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

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
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadItemAndCategories() {
      setLoading(true);
      try {
        const [categoriesData, item] = await Promise.all([
          getAdminCategories(),
          getAdminMenuItem(id),
        ]);
        setCategories(categoriesData);

        if (item) {
          setName(item.name || "");
          const catId = typeof item.category === "object" ? item.category?._id : item.category;
          setCategoryId(catId || "");
          setPricingType(item.pricingType || "single");
          setPrice(item.price != null ? String(item.price) : "");
          setHalfPrice(item.halfPrice != null ? String(item.halfPrice) : "");
          setFullPrice(item.fullPrice != null ? String(item.fullPrice) : "");
          setDescription(item.description || "");
          setIsVeg(Boolean(item.isVeg));
          setIsAvailable(Boolean(item.isAvailable));
          setIsBestseller(Boolean(item.isBestseller));
          setCurrentImageUrl(item.image?.url || null);
        }
      } catch (err) {
        toast(err.message || "Failed to load dish details", "danger");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadItemAndCategories();
    }
  }, [id, toast]);

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
      await updateMenuItem(id, formData);
      toast("Menu item updated successfully", "success");
      router.push("/dashboard/menu");
    } catch (err) {
      toast(err.message || "Failed to update menu item", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteMenuItem(id);
      toast(`Menu item "${name}" deleted successfully`, "success");
      router.push("/dashboard/menu");
    } catch (err) {
      toast(err.message || "Failed to delete menu item", "danger");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>
        Loading menu item details...
      </div>
    );
  }

  const displayImage = previewUrl || currentImageUrl;

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title={`Edit: ${name}`}
        description={`Editing dish configuration and pricing.`}
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
                  disabled={submitting}
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
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
          {/* Image */}
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
              {displayImage ? (
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
                      src={displayImage}
                      alt="Dish preview"
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
            style={{
              borderTop: 0,
              marginTop: 0,
              paddingTop: 0,
              flexDirection: "column",
              alignItems: "stretch",
              gap: "8px",
            }}
          >
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
              style={{ justifyContent: "center" }}
            >
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
            <Link
              href="/dashboard/menu"
              className="button button-secondary"
              style={{ justifyContent: "center" }}
            >
              Cancel
            </Link>
            <button
              type="button"
              className="button button-danger"
              style={{ justifyContent: "center", marginTop: 4 }}
              onClick={handleDelete}
              disabled={submitting}
            >
              Delete Item
            </button>
          </div>
        </div>
      </form>
    </>
  );
}