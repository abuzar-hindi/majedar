"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { restaurantSettings } from "@/lib/mock-data";

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-val">{value}</span>
    </div>
  );
}

function SectionView({ title, children, onEdit }) {
  return (
    <section className="surface form-panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--line-soft)" }}>
        <h2 style={{ margin: 0, borderBottom: "none", paddingBottom: 0 }}>{title}</h2>
        <button className="button button-secondary" style={{ padding: "6px 14px", fontSize: "11.5px" }} onClick={onEdit}>
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState(restaurantSettings);
  const [draft, setDraft] = useState(restaurantSettings);

  // Which section is in edit mode: null | "info" | "hours" | "ordering" | "status" | "contact"
  const [editing, setEditing] = useState(null);

  const startEdit = (section) => {
    setDraft({ ...data });
    setEditing(section);
  };

  const cancel = () => setEditing(null);

  const save = () => {
    setData({ ...draft });
    setEditing(null);
  };

  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Restaurant information and operational settings."
      />

      <div className="form-layout">
        <div className="form-stack">

          {/* Restaurant Information */}
          {editing === "info" ? (
            <section className="surface form-panel">
              <h2>Restaurant Information</h2>
              <div className="form-grid">
                <label className="form-field">
                  <span>Restaurant Name</span>
                  <input defaultValue={draft.name} onChange={(e) => update("name", e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Phone</span>
                  <input defaultValue={draft.phone} onChange={(e) => update("phone", e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Email</span>
                  <input type="email" defaultValue={draft.email} onChange={(e) => update("email", e.target.value)} />
                </label>
                <label className="form-field full">
                  <span>Address</span>
                  <textarea rows={3} defaultValue={draft.address} onChange={(e) => update("address", e.target.value)} />
                </label>
              </div>
              <div className="form-footer">
                <button className="button button-secondary" onClick={cancel}>Cancel</button>
                <button className="button button-primary" onClick={save}>Save Changes</button>
              </div>
            </section>
          ) : (
            <SectionView title="Restaurant Information" onEdit={() => startEdit("info")}>
              <InfoRow label="Restaurant Name" value={data.name} />
              <InfoRow label="Phone" value={data.phone} />
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="Address" value={data.address} />
            </SectionView>
          )}

          {/* Opening Hours */}
          {editing === "hours" ? (
            <section className="surface form-panel">
              <h2>Opening Hours</h2>
              <div className="opening-row">
                <strong>Monday to Sunday</strong>
                <label className="form-field">
                  <span>Opens</span>
                  <input type="time" defaultValue={draft.openingTime} onChange={(e) => update("openingTime", e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Closes</span>
                  <input type="time" defaultValue={draft.closingTime} onChange={(e) => update("closingTime", e.target.value)} />
                </label>
                <button
                  className={`toggle ${draft.hoursActive ? "on" : ""}`}
                  aria-label="Toggle hours active"
                  onClick={() => update("hoursActive", !draft.hoursActive)}
                />
              </div>
              <div className="form-footer">
                <button className="button button-secondary" onClick={cancel}>Cancel</button>
                <button className="button button-primary" onClick={save}>Save Changes</button>
              </div>
            </section>
          ) : (
            <SectionView title="Opening Hours" onEdit={() => startEdit("hours")}>
              <InfoRow label="Monday to Sunday" value={`${data.openingTime} – ${data.closingTime}`} />
              <InfoRow label="Hours" value={data.hoursActive ? "Active" : "Inactive"} />
            </SectionView>
          )}
        </div>

        <div className="form-stack">

          {/* Ordering */}
          {editing === "ordering" ? (
            <section className="surface form-panel">
              <h2>Ordering</h2>
              <div className="form-stack">
                <label className="form-field">
                  <span>Delivery Fee (₹)</span>
                  <input type="number" defaultValue={draft.deliveryFee} onChange={(e) => update("deliveryFee", e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Minimum Order (₹)</span>
                  <input type="number" defaultValue={draft.minimumOrder} onChange={(e) => update("minimumOrder", e.target.value)} />
                </label>
                <div className="switch-row">
                  <div>
                    <strong>Accepting Orders</strong>
                    <p>Allow new customer orders.</p>
                  </div>
                  <button
                    className={`toggle ${draft.acceptingOrders ? "on" : ""}`}
                    aria-label="Toggle accepting orders"
                    onClick={() => update("acceptingOrders", !draft.acceptingOrders)}
                  />
                </div>
              </div>
              <div className="form-footer">
                <button className="button button-secondary" onClick={cancel}>Cancel</button>
                <button className="button button-primary" onClick={save}>Save Changes</button>
              </div>
            </section>
          ) : (
            <SectionView title="Ordering" onEdit={() => startEdit("ordering")}>
              <InfoRow label="Delivery Fee" value={`₹${data.deliveryFee}`} />
              <InfoRow label="Minimum Order" value={`₹${data.minimumOrder}`} />
              <InfoRow label="Accepting Orders" value={data.acceptingOrders ? "Yes" : "No"} />
            </SectionView>
          )}

          {/* Restaurant Status */}
          {editing === "status" ? (
            <section className="surface form-panel">
              <h2>Restaurant Status</h2>
              <div className="switch-row">
                <div>
                  <strong>{draft.isOpen ? "Open and accepting guests" : "Currently closed"}</strong>
                  <p>{draft.isOpen ? "Visible to customers right now." : "Hidden from customers."}</p>
                </div>
                <button
                  className={`toggle ${draft.isOpen ? "on" : ""}`}
                  aria-label="Toggle restaurant open"
                  onClick={() => update("isOpen", !draft.isOpen)}
                />
              </div>
              <div className="form-footer">
                <button className="button button-secondary" onClick={cancel}>Cancel</button>
                <button className="button button-primary" onClick={save}>Save Changes</button>
              </div>
            </section>
          ) : (
            <SectionView title="Restaurant Status" onEdit={() => startEdit("status")}>
              <div className="status-choice" style={{ marginTop: 4 }}>
                <span className="status-dot" style={{ background: data.isOpen ? "#22C55E" : "#EF4444" }} />
                <div>
                  <strong>{data.isOpen ? "Open and accepting guests" : "Currently closed"}</strong>
                  <p style={{ color: "var(--muted)", fontSize: "11.5px", marginTop: 3 }}>
                    {data.isOpen ? "Visible to customers." : "Hidden from customer site."}
                  </p>
                </div>
              </div>
            </SectionView>
          )}

          {/* Contact */}
          {editing === "contact" ? (
            <section className="surface form-panel">
              <h2>Contact &amp; Social</h2>
              <div className="form-stack">
                <label className="form-field">
                  <span>WhatsApp</span>
                  <input defaultValue={draft.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Instagram</span>
                  <input defaultValue={draft.instagram} onChange={(e) => update("instagram", e.target.value)} />
                </label>
              </div>
              <div className="form-footer">
                <button className="button button-secondary" onClick={cancel}>Cancel</button>
                <button className="button button-primary" onClick={save}>Save Changes</button>
              </div>
            </section>
          ) : (
            <SectionView title="Contact &amp; Social" onEdit={() => startEdit("contact")}>
              <InfoRow label="WhatsApp" value={data.whatsapp} />
              <InfoRow label="Instagram" value={data.instagram} />
            </SectionView>
          )}
        </div>
      </div>
    </>
  );
}