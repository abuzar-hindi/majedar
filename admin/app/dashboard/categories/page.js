"use client";

import { useState } from "react";
import { Button, Modal, PageHeader } from "@/components/ui";
import { categories } from "@/lib/mock-data";

const ITEM_COUNTS = [3, 7, 5, 6, 4, 9, 4, 8, 7, 3, 5, 11, 4, 6, 5];

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (cat) => { setEditTarget(cat); setModalOpen(true); };

  return (
    <>
      <PageHeader
        eyebrow="Menu Management"
        title="Categories"
        description="Organise the menu so guests can find their favourites."
        action={<Button onClick={openAdd}>+ Add Category</Button>}
      />
      <div className="category-grid">
        {categories.map((category, index) => (
          <article className="category-card" key={category}>
            <span className="category-image">{category.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{category}</strong>
              <small>{ITEM_COUNTS[index] || 4} dishes · Active</small>
            </div>
            <button
              className="icon-button"
              aria-label={`Edit ${category}`}
              onClick={() => openEdit(category)}
              style={{ marginLeft: "auto" }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          </article>
        ))}
      </div>

      {modalOpen && (
        <Modal
          title={editTarget ? `Edit: ${editTarget}` : "Add Category"}
          onClose={() => setModalOpen(false)}
        >
          <div className="form-stack">
            <label className="form-field">
              <span>Category Name</span>
              <input placeholder="e.g. Breakfast" defaultValue={editTarget || ""} />
            </label>
            <label className="form-field">
              <span>Display Order</span>
              <input type="number" placeholder="e.g. 01" />
            </label>
            <div className="form-footer" style={{ marginTop: 0 }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>
                {editTarget ? "Save Changes" : "Add Category"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}