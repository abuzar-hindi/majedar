import { apiRequest } from "./api/client";

/**
 * Convert URL-safe base64 string to Uint8Array for PushManager subscription.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the browser supports standard Web Push and Service Workers.
 */
export function isPushNotificationSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get current browser notification permission status.
 * Returns: "granted" | "denied" | "default" | "unsupported"
 */
export function getPushPermissionState() {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Register the Admin Service Worker.
 */
export async function registerAdminServiceWorker() {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported by this browser.");
  }
  return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/**
 * Get existing PushSubscription on this device, if any.
 */
export async function getAdminPushSubscription() {
  if (!isPushNotificationSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

/**
 * Subscribe the current browser/device to Web Push notifications.
 * Prompts user for permission, registers SW, contacts PushManager,
 * and saves subscription to the backend associated with authenticated admin.
 */
export async function subscribeAdminPush() {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported on this device/browser.");
  }

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notification permission was blocked in browser settings."
        : "Notification permission was dismissed."
    );
  }

  // 2. Fetch VAPID public key from backend
  const keyRes = await apiRequest("/admin/push/vapid-public-key");
  const vapidPublicKey = keyRes?.data?.publicKey;
  if (!vapidPublicKey) {
    throw new Error("Server VAPID public key is not configured.");
  }

  // 3. Ensure service worker is registered & ready
  await registerAdminServiceWorker();
  const registration = await navigator.serviceWorker.ready;

  // 4. Subscribe with PushManager
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // 5. Send subscription to backend
  const subJson = subscription.toJSON();
  await apiRequest("/admin/push/subscribe", {
    method: "POST",
    body: {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
    },
  });

  return subscription;
}

/**
 * Unsubscribe current browser/device from Web Push notifications.
 */
export async function unsubscribeAdminPush() {
  if (!isPushNotificationSupported()) return false;

  const subscription = await getAdminPushSubscription();
  if (!subscription) return true;

  const endpoint = subscription.endpoint;

  // Unsubscribe in browser
  try {
    await subscription.unsubscribe();
  } catch {
    // continue to inform backend
  }

  // Remove from backend
  try {
    await apiRequest("/admin/push/unsubscribe", {
      method: "POST",
      body: { endpoint },
    });
  } catch {
    // silent fallback
  }

  return true;
}

/**
 * Send a test push notification to verify setup.
 */
export async function sendTestPushAlert() {
  return await apiRequest("/admin/push/test", {
    method: "POST",
  });
}

/**
 * Play a gentle, synthesized 2-tone chime using Web Audio API when admin tab is open.
 * Completely self-contained: no external audio files, never fails on missing assets,
 * and fails silently if blocked by browser autoplay policy.
 */
export function playNotificationChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second tone (880.00 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.08, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.35);
  } catch {
    // silent fallback if audio context blocked or unsupported
  }
}
