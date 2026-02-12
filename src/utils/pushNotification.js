import { fetchWithJwt } from "./jwtHelper";

/* ===============================
   Helper: Base64 URL → Uint8Array
   =============================== */
const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
};

/* Helper: ArrayBuffer → Base64 */
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
};

/* MAIN FUNCTION */
export const initPushNotification = async (idUser) => {
    try {
        if (!idUser) return { status: "no-user" };
        if (!("serviceWorker" in navigator)) return { status: "unsupported" };
        if (!("PushManager" in window)) return { status: "unsupported" };

        // 🚨 Jika sudah ditolak sebelumnya
        if (Notification.permission === "denied") {
            return { status: "denied" };
        }

        const permission =
            Notification.permission === "default"
                ? await Notification.requestPermission()
                : Notification.permission;

        if (permission !== "granted") {
            return { status: "denied" };
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return { status: "no-sw" };
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
            const vapidKey = urlBase64ToUint8Array(vapidPublicKey);

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey,
            });
        }

        const p256dh = subscription.getKey("p256dh");
        const auth = subscription.getKey("auth");

        const payload = {
            id_user: idUser,
            endpoint: subscription.endpoint,
            keys: {
                p256dh: arrayBufferToBase64(p256dh),
                auth: arrayBufferToBase64(auth),
            },
        };

        const apiUrl = process.env.REACT_APP_API_BASE_URL;

        const res = await fetchWithJwt(`${apiUrl}/notif/subs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return { status: "failed" };
        }

        return { status: "success" };
    } catch (err) {
        console.error(err);
        return { status: "error" };
    }
};

