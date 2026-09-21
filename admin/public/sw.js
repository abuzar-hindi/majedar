/**
 * Majedaar Restaurant Admin - Service Worker for Web Push Notifications
 * Handles incoming push events and notification clicks with deep-linking to Admin Panel.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: 'Majedaar Restaurant',
      body: event.data ? event.data.text() : '',
    };
  }

  const title = data.title || 'Majedaar Restaurant';
  const options = {
    body: data.body || '',
    icon: data.icon || '/brand/logo-mark.svg',
    badge: data.badge || '/brand/logo-mark.svg',
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: (data.data?.type || 'general') + '-' + Date.now(),
    renotify: true,
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'PUSH_NOTIFICATION', payload: data });
        }
      }),
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If an existing admin tab is open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
