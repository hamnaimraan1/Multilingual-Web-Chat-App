// /* public/sw.js */
// self.addEventListener("install", () => {
//   self.skipWaiting();
//   console.log("[SW] installed");
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(self.clients.claim());
//   console.log("[SW] activated");
// });

// self.addEventListener("message", (event) => {
//   const data = event.data || {};
//   if (data.type !== "notify") return;

//   const title = data.title || "New message";
//   const body  = data.body  || "";
//   const options = {
//     body,
//     icon: "/icons/icon-192.png",   // optional, place in public/icons
//     badge: "/icons/badge.png",     // optional
//     data: { url: data.url || "/" },
//     tag: data.tag || undefined,    // collapse duplicates by tag if you want
//     renotify: !!data.tag,
//   };

//   self.registration.showNotification(title, options);
// });

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   const url = event.notification.data?.url || "/";
//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
//       for (const client of list) {
//         if (client.url.includes(url) && "focus" in client) return client.focus();
//       }
//       return clients.openWindow(url);
//     })
//   );
// });
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const toOpen = new URL(url, self.location.origin).href;
      for (const client of clientsArr) {
        if (client.url === toOpen) { client.focus(); return; }
      }
      return self.clients.openWindow(toOpen);
    })
  );
});

// Optional: allow the page to ask SW to show a notification
self.addEventListener("message", (e) => {
  if (e.data?.type === "LOCAL_NOTIFY") {
    self.registration.showNotification(e.data.title || "CrossPing", {
      body: e.data.body || "",
      icon: e.data.icon || "/app-icon-192.png",
      tag: e.data.tag,
      data: { url: e.data.urlToOpen || "/" }
    });
  }
});
