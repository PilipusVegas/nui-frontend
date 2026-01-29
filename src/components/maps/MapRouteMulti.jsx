import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMap,} from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../../utils/dateUtils";

/* UTIL */
const parseCoord = (str) => {
    if (!str) return null;
    const [lat, lng] = str.split(",").map(Number);
    return { lat, lng };
};

/*  CUSTOM PIN ICON (NUMBERED) */
const createPinIcon = (number) =>
    L.divIcon({
        html: `
        <div style="
            position: relative;
            width: 34px;
            height: 34px;
            background: #16a34a;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.35);
            border: 2px solid white;
        ">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                color: white;
                font-size: 13px;
                font-weight: 700;
            ">
                ${number}
            </div>
        </div>
        `,
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 34], // ujung pin tepat ke koordinat
        popupAnchor: [0, -34],
    });

/* FIT ALL CONTROLLER */
const FitAllController = ({ points }) => {
    const map = useMap();

    const fitAll = () => {
        if (!points || points.length < 2) return;

        const bounds = L.latLngBounds(
            points.map(p => [p.lat, p.lng])
        );

        requestAnimationFrame(() => {
            map.fitBounds(bounds, {
                padding: [80, 80],
                maxZoom: 15,
                animate: true,
            });
        });
    };

    return (
        <div className="absolute top-3 right-3 z-[1000]">
            <button
                onClick={fitAll}
                title="Tampilkan semua lokasi"
                className="bg-white p-3 px-4 rounded-full shadow hover:bg-gray-100 transition text-lg"
            >
                <FontAwesomeIcon icon={faCrosshairs} />
            </button>
        </div>
    );
};

const AutoFitOnce = ({ points }) => {
    const map = useMap();
    const hasFitted = React.useRef(false);
    useEffect(() => {
        if (hasFitted.current) return;
        if (!points || points.length < 2) return;
        const bounds = L.latLngBounds(
            points.map(p => [p.lat, p.lng])
        );
        map.whenReady(() => {
            map.fitBounds(bounds, {
                padding: [80, 80],
                maxZoom: 15,
                animate: false,
            });
            hasFitted.current = true;
        });
    }, [points, map]);
    return null;
};


/* MAIN */
const MapRouteMulti = ({ locations = [] }) => {
    const [orderedPoints, setOrderedPoints] = useState([]);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        if (!locations.length) return;
        const sorted = [...locations].sort(
            (a, b) => new Date(a.jam_mulai) - new Date(b.jam_mulai)
        );
        const points = sorted.reduce((acc, l) => {
            const coord =
                parseCoord(l.koordinat_lokasi) ||
                parseCoord(l.koordinat_mulai) ||
                parseCoord(l.koordinat_selesai);
            if (!coord) return acc;
            const last = acc[acc.length - 1];
            if (
                last &&
                last.lat === coord.lat &&
                last.lng === coord.lng
            ) {
                last.isEnd = l.kategori === 3;
                return acc;
            }
            acc.push({
                lat: coord.lat,
                lng: coord.lng,
                nama: l.nama_lokasi,
                jamMulai: l.jam_mulai,
                jamSelesai: l.jam_selesai,
                kategori: l.kategori,
            });
            return acc;
        }, []);

        if (points.length < 2) return;

        setOrderedPoints(points);

        // 3️⃣ GRAPHOPPER ROUTE
        const fetchRoutes = async () => {
            const allRoutes = [];

            for (let i = 0; i < points.length - 1; i++) {
                const a = points[i];
                const b = points[i + 1];

                try {
                    const url = `http://192.168.80.254:8989/route?point=${a.lat},${a.lng}&point=${b.lat},${b.lng}&profile=motorcycle&points_encoded=false`;
                    const res = await fetch(url);
                    const json = await res.json();

                    if (!json?.paths?.length) continue;

                    const coords = json.paths[0].points.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                    );

                    allRoutes.push(coords);
                } catch (err) {
                    console.error("GraphHopper error:", err);
                }
            }

            setRoutes(allRoutes);
        };

        fetchRoutes();
    }, [locations]);

    if (!orderedPoints.length) return null;

    return (
        <div className="w-full rounded-xl overflow-hidden relative">
            <MapContainer center={[orderedPoints[0].lat, orderedPoints[0].lng]} zoom={13} minZoom={3} preferCanvas={true} zoomControl={false} attributionControl={false} style={{ height: 420, width: "100%" }}>

                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <AutoFitOnce points={orderedPoints} />
                <FitAllController points={orderedPoints} />
                {/* MARKER + TOOLTIP + CIRCLE */}
                {orderedPoints.map((p, i) => (
                    <React.Fragment key={i}>
                        <Marker position={[p.lat, p.lng]} icon={createPinIcon(i + 1)}>
                            <Tooltip sticky direction="top" offset={[0, -30]}>
                                <div className="text-xs text-center leading-tight">
                                    <div className="font-semibold">
                                        {p.nama}
                                    </div>
                                    <div>
                                        {p.jamMulai ? formatTime(p.jamMulai) : "-"}{" "}
                                        –{" "}
                                        {p.jamSelesai ? formatTime(p.jamSelesai) : "-"}
                                    </div>
                                </div>
                            </Tooltip>
                        </Marker>

                        <Circle center={[p.lat, p.lng]} radius={60} pathOptions={{
                            color: "#16a34a",
                            fillColor: "#16a34a",
                            fillOpacity: 0.15,
                            weight: 2,
                        }}
                        />
                    </React.Fragment>
                ))}

                {/* ROUTE */}
                {routes.map((r, i) => (
                    <Polyline key={i} positions={r} pathOptions={{ weight: 4 }} />
                ))}
            </MapContainer>
        </div>
    );
};

export default MapRouteMulti;
