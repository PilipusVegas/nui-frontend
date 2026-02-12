self.addEventListener("install", () => {
    console.log("✅ Service Worker installed");
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    console.log("✅ Service Worker activated");
});

/* PUSH EVENT (INI JAWABANNYA) */
self.addEventListener("push", event => {
    let data = {
        title: "Notifikasi",
        body: "Ada notifikasi baru",
        url: "/",
    };

    if (event.data) {
        data = event.data.json();
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            data: { url: data.url },

            // 👇 SEMUA PATH KE PUBLIC ROOT
            icon: "/logo.png",
            badge: "/logo.png",

            // 👇 UX tambahan
            vibrate: [100, 50, 100],
            tag: "general-notification",
            renotify: true,
            requireInteraction: true,
        })
    );
});


/* KETIKA NOTIF DIKLIK */
self.addEventListener("notificationclick", event => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
