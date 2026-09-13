"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { adminProfile } from "@/lib/mock-data";

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-val">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [data, setData] = useState(adminProfile);
  const [draft, setDraft] = useState(adminProfile);
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const startEdit = () => { setDraft({ ...data }); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = () => { setData({ ...draft }); setEditing(false); };
  const update = (k, v) => setDraft((prev) => ({ ...prev, [k]: v }));

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Admin Profile"
        description="Manage the details attached to your office account."
      />

      <div className="profile-layout">
        {/* Main profile */}
        <section className="surface form-panel">
          <div className="profile-hero">
            <span className="avatar avatar-large">{data.initials}</span>
            <div>
              <h2>{data.name}</h2>
              <p>{data.role} · Majedaar</p>
            </div>
            {!editing && (
              <button
                className="button button-secondary"
                style={{ marginLeft: "auto", padding: "7px 16px", fontSize: "11.5px" }}
                onClick={startEdit}
              >
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <>
              <div className="form-grid">
                <label className="form-field">
                  <span>Full Name</span>
                  <input defaultValue={draft.name} onChange={(e) => update("name", e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Phone</span>
                  <input defaultValue={draft.phone} onChange={(e) => update("phone", e.target.value)} />
                </label>
                <label className="form-field full">
                  <span>Email Address</span>
                  <input type="email" defaultValue={draft.email} onChange={(e) => update("email", e.target.value)} />
                </label>
              </div>
              <div className="form-footer">
                <button className="button button-secondary" onClick={cancel}>Cancel</button>
                <button className="button button-primary" onClick={save}>Save Changes</button>
              </div>
            </>
          ) : (
            <>
              <InfoRow label="Full Name" value={data.name} />
              <InfoRow label="Email Address" value={data.email} />
              <InfoRow label="Phone" value={data.phone} />
              <InfoRow label="Role" value={data.role} />
            </>
          )}
        </section>

        {/* Password */}
        <section className="surface form-panel">
          <h2>Password</h2>
          {changingPwd ? (
            <div className="form-stack">
              <label className="form-field">
                <span>Current Password</span>
                <input type="password" placeholder="Enter current password" />
              </label>
              <label className="form-field">
                <span>New Password</span>
                <input type="password" placeholder="Enter new password" />
              </label>
              <label className="form-field">
                <span>Confirm New Password</span>
                <input type="password" placeholder="Repeat new password" />
              </label>
              <div className="form-footer" style={{ marginTop: 0 }}>
                <button className="button button-secondary" onClick={() => setChangingPwd(false)}>Cancel</button>
                <button className="button button-primary" onClick={() => setChangingPwd(false)}>Update Password</button>
              </div>
              <p className="helper-text">
                Authentication is a UI-only flow. Password changes will be enabled with the backend.
              </p>
            </div>
          ) : (
            <div style={{ paddingTop: 4 }}>
              <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "18px" }}>
                Your password is managed securely. Click below to change it.
              </p>
              <button className="button button-secondary" onClick={() => setChangingPwd(true)}>
                Change Password
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}