import { useRef } from "react";

export const useFakeGpsDetector = () => {
    const last = useRef(null);

    const analyze = (position) => {
        const now = Date.now();
        const { latitude, longitude, accuracy } = position.coords;

        let suspicious = false;
        const reason = [];

        if (last.current) {
            const dist = haversine(
                last.current.lat,
                last.current.lon,
                latitude,
                longitude
            );

            const timeDiff = (now - last.current.time) / 1000; // detik
            const speed = (dist / timeDiff) * 3.6; // km/jam

            if (dist > 500 && timeDiff < 10) {
                suspicious = true;
                reason.push("Loncat lokasi ekstrem");
            }

            if (speed > 120) {
                suspicious = true;
                reason.push(`Kecepatan tidak wajar (${speed.toFixed(1)} km/jam)`);
            }

            if (accuracy < 5 || accuracy > 200) {
                suspicious = true;
                reason.push(`Akurasi mencurigakan (${accuracy} m)`);
            }
        }

        last.current = {
            lat: latitude,
            lon: longitude,
            time: now,
        };

        console.log({ suspicious, reason });
        return { suspicious, reason };
    };

    return { analyze };
};

// Haversine formula for distance calculation
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (v) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
