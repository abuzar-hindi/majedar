"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button, Modal, PageHeader, EmptyState, useToast, Toggle } from "@/components/ui";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const toast = useToast();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      toast(err.message || "Failed to load categories", "danger");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openAdd = () => {
    setEditTarget(null);
    setFormName("");
    setFormIsActive(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setFormName(cat.name || "");
    setFormIsActive(Boolean(cat.isActive));
    setSelectedFile(null);
    setPreviewUrl(cat.image?.url || null);
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("Image size must not exceed 5 MB", "danger");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast("Category name is required", "danger");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", formName.trim());
    formData.append("isActive", String(formIsActive));

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      if (editTarget) {
        await updateCategory(editTarget._id, formData);
        toast("Category updated successfully", "success");
      } else {
        await createCategory(formData);
        toast("Category created successfully", "success");
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast(err.message || "Failed to save category", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete category "${cat.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteCategory(cat._id);
      toast(`Category "${cat.name}" deleted successfully`, "success");
      await loadCategories();
    } catch (err) {
      toast(err.message || "Failed to delete category", "danger");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title="Categories"
        description="Organise the menu so guests can find their favourites."
        action={<Button onClick={openAdd}>+ Add Category</Button>}
      />

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Click '+ Add Category' to create your first category."
        />
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category._id}>
              {category.image?.url ? (
                <div
                  style={{
                    position: "relative",
                    width: "48px",
                    height: "48px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    sizes="48px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </div>
              ) : (
                <span className="category-image">
                  {category.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div>
                <strong>{category.name}</strong>
                <small>
                  <span style={{ color: category.isActive ? "var(--forest)" : "var(--muted)" }}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </small>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button
                  className="icon-button"
                  aria-label={`Edit ${category.name}`}
                  onClick={() => openEdit(category)}
                  title="Edit category"
                >
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
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  className="icon-button"
                  style={{ color: "#DC2626" }}
                  aria-label={`Delete ${category.name}`}
                  onClick={() => handleDelete(category)}
                  title="Delete category"
                >
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
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editTarget ? `Edit: ${editTarget.name}` : "Add Category"}
          onClose={() => !submitting && setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="form-stack">
            <label className="form-field">
              <span>Category Name</span>
              <input
                placeholder="e.g. South Indian"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <div className="switch-row" style={{ marginTop: 4 }}>
              <div>
                <strong>Active Status</strong>
                <p>Allow customers to see dishes in this category.</p>
              </div>
              <Toggle
                on={formIsActive}
                onToggle={() => setFormIsActive(!formIsActive)}
                label="Toggle category active status"
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <span className="detail-label" style={{ display: "block", marginBottom: 6 }}>
                Category Image
              </span>
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
                        width: "80px",
                        height: "80px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        margin: "0 auto 8px",
                      }}
                    >
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        sizes="80px"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <span>Click to choose another image</span>
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
                    <strong>Choose a category image</strong>
                    <small>JPG, PNG or WEBP · max 5 MB</small>
                  </>
                )}
              </div>
            </div>

            <div className="form-footer" style={{ marginTop: 14 }}>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editTarget
                  ? "Save Changes"
                  : "Add Category"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}