"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Modal, PageHeader, Table, EmptyState, useToast, Toggle } from "@/components/ui";
import {
  getAdminDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "@/lib/api/delivery-zones";

const ZONE_FEES = {
  "0-3km": 15,
  "3-5km": 30,
};

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("0-3km");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const toast = useToast();

  const loadZones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminDeliveryZones();
      setZones(data);
    } catch (err) {
      toast(err.message || "Failed to load delivery zones", "danger");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const openAdd = () => {
    setEditTarget(null);
    setName("");
    setType("0-3km");
    setSortOrder("0");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (zone) => {
    setEditTarget(zone);
    setName(zone.name || "");
    setType(zone.type || "0-3km");
    setSortOrder(String(zone.sortOrder ?? 0));
    setIsActive(Boolean(zone.isActive));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Area name is required", "danger");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      type,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    };

    try {
      if (editTarget) {
        await updateDeliveryZone(editTarget._id, payload);
        toast("Delivery area updated successfully", "success");
      } else {
        await createDeliveryZone(payload);
        toast("Delivery area added successfully", "success");
      }
      setModalOpen(false);
      await loadZones();
    } catch (err) {
      toast(err.message || "Failed to save delivery zone", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (zone) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete or deactivate area "${zone.name}"?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteDeliveryZone(zone._id);
      toast(res?.message || `Delivery area "${zone.name}" deleted`, "success");
      await loadZones();
    } catch (err) {
      toast(err.message || "Failed to delete delivery area", "danger");
    }
  };

  const toggleActiveStatus = async (zone) => {
    try {
      await updateDeliveryZone(zone._id, { isActive: !zone.isActive });
      setZones((prev) =>
        prev.map((z) => (z._id === zone._id ? { ...z, isActive: !z.isActive } : z))
      );
      toast("Area status updated", "success");
    } catch (err) {
      toast(err.message || "Failed to update area status", "danger");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Delivery Zones"
        description="Manage serviceable areas and authoritative tiered delivery rates (0–3 KM → ₹15, 3–5 KM → ₹30)."
        action={<Button onClick={openAdd}>+ Add Service Area</Button>}
      />

      <section className="surface data-surface">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading delivery zones...
          </div>
        ) : zones.length === 0 ? (
          <EmptyState
            title="No delivery zones configured"
            description="Add your first delivery area to start accepting delivery orders."
          />
        ) : (
          <Table
            columns={[
              "Area Name",
              "Zone Tier",
              "Authoritative Fee",
              "Sort Order",
              "Status",
              "Actions",
            ]}
            rows={zones}
            renderRow={(zone) => (
              <tr key={zone._id}>
                <td>
                  <strong>{zone.name}</strong>
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: "var(--forest-soft)",
                      color: "var(--forest-deep)",
                    }}
                  >
                    {zone.type === "0-3km" ? "0–3 KM" : "3–5 KM"}
                  </span>
                </td>
                <td>
                  <strong>₹{zone.deliveryFee ?? ZONE_FEES[zone.type] ?? 15}</strong>
                </td>
                <td className="muted">{zone.sortOrder ?? 0}</td>
                <td>
                  <Toggle
                    on={zone.isActive}
                    onToggle={() => toggleActiveStatus(zone)}
                    label={`Toggle active for ${zone.name}`}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="row-action"
                    onClick={() => openEdit(zone)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="row-action danger"
                    style={{ marginLeft: 14 }}
                    onClick={() => handleDelete(zone)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </section>

      {modalOpen && (
        <Modal
          title={editTarget ? `Edit Area: ${editTarget.name}` : "Add Delivery Area"}
          onClose={() => !submitting && setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="form-stack">
            <label className="form-field">
              <span>Area / Locality Name</span>
              <input
                placeholder="e.g. Civil Lines, Ram Nagar, Naya Ganj"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <label className="form-field">
              <span>Zone Tier & Authoritative Fee</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={submitting}
              >
                <option value="0-3km">0–3 KM → ₹15 Delivery Fee</option>
                <option value="3-5km">3–5 KM → ₹30 Delivery Fee</option>
              </select>
            </label>
            <p style={{ color: "var(--muted)", fontSize: "11.5px", marginTop: -6 }}>
              Delivery fee is authoritatively calculated by the backend based on distance tier.
            </p>

            <label className="form-field">
              <span>Sort Order</span>
              <input
                type="number"
                placeholder="e.g. 0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={submitting}
              />
            </label>

            <div className="switch-row" style={{ marginTop: 4 }}>
              <div>
                <strong>Active Delivery Area</strong>
                <p>Allow diners in this area to select delivery at checkout.</p>
              </div>
              <Toggle
                on={isActive}
                onToggle={() => setIsActive(!isActive)}
                label="Toggle area active"
              />
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
                  : "Add Area"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
