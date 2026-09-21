"use client";

import { PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-val">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { admin } = useAuth();

  const name = admin?.name || "Administrator";
  const email = admin?.email || "admin@majedar.com";
  const role = admin?.role === "admin" ? "Super Administrator" : "Administrator";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Admin Profile"
        description="Authenticated administrator account details."
      />

      <div className="profile-layout">
        {/* Main profile */}
        <section className="surface form-panel">
          <div className="profile-hero">
            <span className="avatar avatar-large">{initials}</span>
            <div>
              <h2>{name}</h2>
              <p>{role} · Majedaar Restaurant</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <InfoRow label="Full Name" value={name} />
            <InfoRow label="Email Address" value={email} />
            <InfoRow label="Account Role" value={role} />
            <InfoRow label="Session Security" value="HttpOnly Cookie Secured" />
          </div>
        </section>

        {/* Credentials Policy */}
        <section className="surface form-panel">
          <h2>Credentials &amp; Access Control</h2>
          <div style={{ paddingTop: 4 }}>
            <p style={{ color: "var(--muted)", fontSize: "12.5px", lineHeight: 1.7, marginBottom: "14px" }}>
              Administrator credentials are encrypted with bcrypt and verified against server environment configurations.
            </p>
            <div
              style={{
                background: "var(--cream)",
                border: "1px solid var(--line)",
                padding: "12px 14px",
                borderRadius: "4px",
                fontSize: "12px",
                color: "var(--ink-mid)",
              }}
            >
              <strong>Security Note:</strong> Admin passwords and session tokens cannot be modified from the public browser client. Password rotations must be initiated through server environment variables or authenticated CLI management.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}