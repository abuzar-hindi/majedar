"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader, useToast } from "@/components/ui";
import {
  isPushNotificationSupported,
  getPushPermissionState,
  getAdminPushSubscription,
  subscribeAdminPush,
  unsubscribeAdminPush,
  sendTestPushAlert,
  playNotificationChime,
} from "@/lib/push-notifications";

function InfoRow({ label, value, note }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <div>
        <span className="info-val">{value}</span>
        {note && <p style={{ color: "var(--muted)", fontSize: "11px", marginTop: 2 }}>{note}</p>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [pushStatus, setPushStatus] = useState("checking");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isPushNotificationSupported()) {
      setPushStatus("unsupported");
      return;
    }
    const perm = getPushPermissionState();
    setPushStatus(perm);

    getAdminPushSubscription()
      .then((sub) => {
        setIsSubscribed(!!sub);
      })
      .catch(() => {});
  }, []);

  const handleEnablePush = async () => {
    setLoadingAction(true);
    try {
      await subscribeAdminPush();
      setIsSubscribed(true);
      setPushStatus("granted");
      playNotificationChime();
      toast("Push alerts enabled on this device!", "success");
    } catch (err) {
      toast(err.message || "Failed to enable notifications", "danger");
      setPushStatus(getPushPermissionState());
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDisablePush = async () => {
    setLoadingAction(true);
    try {
      await unsubscribeAdminPush();
      setIsSubscribed(false);
      toast("Push alerts disabled on this device", "neutral");
    } catch (err) {
      toast(err.message || "Failed to disable notifications", "danger");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleTestAlert = async () => {
    setLoadingAction(true);
    try {
      await sendTestPushAlert();
      playNotificationChime();
      toast("Test push notification dispatched!", "success");
    } catch (err) {
      toast(err.message || "Failed to send test alert", "danger");
    } finally {
      setLoadingAction(false);
    }
  };

  let statusText = "Checking...";
  let statusTone = "var(--muted)";
  if (pushStatus === "unsupported") {
    statusText = "Not Supported by Browser";
    statusTone = "#C0392B";
  } else if (pushStatus === "denied") {
    statusText = "Blocked in Browser Settings";
    statusTone = "#C0392B";
  } else if (isSubscribed) {
    statusText = "Active on this Device";
    statusTone = "#16a34a";
  } else {
    statusText = "Disabled";
    statusTone = "var(--muted)";
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Authoritative restaurant configuration and operational parameters."
      />

      <div className="form-layout">
        <div className="form-stack">
          {/* Restaurant Information */}
          <section className="surface form-panel">
            <h2>Restaurant Identity</h2>
            <InfoRow label="Restaurant Name" value="Majedaar Restaurant" />
            <InfoRow label="City & Region" value="Ayodhya, Uttar Pradesh" />
            <InfoRow label="Operating Model" value="Delivery & Dine-in Takeaway" />
            <InfoRow
              label="Kitchen Status"
              value="Open & Accepting Orders"
              note="Controlled via backend server configuration"
            />
          </section>

          {/* Web Push Notification Panel */}
          <section className="surface form-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, border: 0, padding: 0 }}>Order &amp; Payment Alerts</h2>
              <span style={{ fontSize: "11px", fontWeight: 700, color: statusTone }}>
                {statusText}
              </span>
            </div>

            <InfoRow
              label="Notification Triggers"
              value="New Order &amp; Successful Payment Only"
              note="Strictly limited to critical operational events: new customer orders and confirmed Razorpay payments."
            />
            <InfoRow
              label="Background Delivery"
              value="Standard Web Push + Service Worker"
              note="Delivers browser/mobile OS notifications even when the Admin panel tab is closed."
            />
            <InfoRow
              label="Multi-Device Support"
              value="Supported (Laptop, Phone, Tablet)"
              note="Each device can be independently subscribed for alerts."
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
              {isSubscribed ? (
                <>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleTestAlert}
                    disabled={loadingAction}
                    style={{ fontSize: "11.5px", padding: "6px 14px" }}
                  >
                    Send Test Alert
                  </button>
                  <button
                    type="button"
                    className="button button-quiet"
                    onClick={handleDisablePush}
                    disabled={loadingAction}
                    style={{ fontSize: "11.5px", padding: "6px 14px", color: "#C0392B" }}
                  >
                    Disable on this device
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleEnablePush}
                  disabled={loadingAction || pushStatus === "unsupported"}
                  style={{ fontSize: "11.5px", padding: "6px 16px" }}
                >
                  {loadingAction ? "Enabling..." : "Enable Order & Payment Alerts"}
                </button>
              )}
            </div>

            {pushStatus === "denied" && (
              <p style={{ color: "#C0392B", fontSize: "11.5px", marginTop: "10px" }}>
                Notifications are blocked for this site. Click the lock/settings icon in your browser address bar and set Notifications to &quot;Allow&quot;.
              </p>
            )}
          </section>

          {/* Delivery Configuration */}
          <section className="surface form-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, border: 0, padding: 0 }}>Delivery Policies</h2>
              <Link href="/dashboard/delivery-zones" className="button button-secondary" style={{ padding: "6px 12px", fontSize: "11.5px" }}>
                Manage Delivery Zones
              </Link>
            </div>
            <InfoRow
              label="Delivery Rates"
              value="Tier 1 (0–3 KM): ₹15  ·  Tier 2 (3–5 KM): ₹30"
              note="Authoritatively calculated and enforced by backend delivery zones."
            />
            <InfoRow
              label="Minimum Order"
              value="₹100"
              note="Minimum cart value required before delivery order can be placed."
            />
            <InfoRow
              label="Service Radius"
              value="Up to 5.0 KM"
              note="Areas beyond 5 KM are outside current delivery coverage."
            />
          </section>
        </div>

        <div className="form-stack">
          {/* Security & Authentication Policies */}
          <section className="surface form-panel">
            <h2>Security &amp; API Policies</h2>
            <InfoRow
              label="Session Security"
              value="HttpOnly Cookie (Strict / Lax)"
              note="JWT credentials are never exposed to browser client scripts."
            />
            <InfoRow
              label="Authorization Role"
              value="Administrator (RBAC)"
              note="Admin-only routes are protected with cryptographic token verification."
            />
            <InfoRow
              label="VAPID Security"
              value="Public Key Distribution Only"
              note="VAPID private signing credentials remain strictly guarded on the backend."
            />
            <InfoRow
              label="Tax Policy"
              value="5.0% GST on items"
              note="Authoritatively calculated on food items at order creation."
            />
          </section>
        </div>
      </div>
    </>
  );
}