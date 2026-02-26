import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrosshairs, faBuilding, faExpand } from "@fortawesome/free-solid-svg-icons";
import { getDistanceMeters } from "../../utils/locationUtils";

// === ICONS ===
const userIcon = L.divIcon({
    html: `
    <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
      <span style="
        position:absolute;
        width:36px;
        height:36px;
        border-radius:50%;
        background:#3b82f6;
        opacity:0.25;
        animation: ping 1.5s infinite;
      "></span>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#2563eb" style="z-index:2;">
        <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5z"/>
        <path d="M4 22v-1c0-3.3 3.6-6 8-6s8 2.7 8 6v1H4z"/>
      </svg>
    </div>
  `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});



const officeIcon = L.divIcon({
    html: `
    <div style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#dc2626">
        <path d="M6 2h12v20H6z"/>
        <rect x="10.5" y="17" width="3" height="5" fill="#ffffff"/>
        <rect x="8" y="5" width="2" height="2" fill="#ffffff"/>
        <rect x="14" y="5" width="2" height="2" fill="#ffffff"/>
        <rect x="8" y="9" width="2" height="2" fill="#ffffff"/>
        <rect x="14" y="9" width="2" height="2" fill="#ffffff"/>
        <rect x="8" y="13" width="2" height="2" fill="#ffffff"/>
        <rect x="14" y="13" width="2" height="2" fill="#ffffff"/>
      </svg>
    </div>
  `,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
});


// === AUTO FIT ===
const AutoFitBounds = ({ userPos, officePos }) => {
    const map = useMap();
    const hasFitted = useRef(false);

    useEffect(() => {
        if (!userPos || !officePos || hasFitted.current) return;

        map.fitBounds(
            [
                [userPos.lat, userPos.lng],
                [officePos.lat, officePos.lng],
            ],
            { padding: [40, 40], animate: true, duration: 0.8 }
        );

        hasFitted.current = true;
    }, [userPos, officePos, map]);

    return null;
};


// === OFFSET LINE ===
const offsetPoint = (from, to, factor = 0.00006) => {
    const lat = from.lat + (to.lat - from.lat) * factor;
    const lng = from.lng + (to.lng - from.lng) * factor;
    return [lat, lng];
};

// === MAIN MAP ===
const MapRadius = ({ user, location: office, radius = 60 }) => {
    const [pos, setPos] = useState({ lat: null, lng: null });
    const mapRef = useRef(null);

    useEffect(() => {
        if (user?.lat && user?.lng) {
            setPos({ lat: user.lat, lng: user.lng });
        }
    }, [user]);

    if (!pos.lat || !pos.lng) return null;

    const distance =
        office?.lat && office?.lng
            ? getDistanceMeters(pos.lat, pos.lng, office.lat, office.lng)
            : null;

    const isWithinRadius = distance !== null && distance <= radius;

    const officeColor = isWithinRadius ? "#22c55e" : "#ef4444";

    const start = office?.lat ? offsetPoint(pos, office) : null;
    const end = office?.lat ? offsetPoint(office, pos) : null;

    const zoomToUser = () => {
        mapRef.current?.flyTo([pos.lat, pos.lng], 17, { duration: 0.8 });
    };

    const zoomToOffice = () => {
        if (!office?.lat) return;
        mapRef.current?.flyTo([office.lat, office.lng], 17, { duration: 0.8 });
    };

    const zoomToBoth = () => {
        if (!office?.lat) return;
        mapRef.current?.fitBounds(
            [
                [pos.lat, pos.lng],
                [office.lat, office.lng],
            ],
            { padding: [40, 40], animate: true, duration: 0.8 }
        );
    };

    return (
        <div className="relative">
            {/* === CONTROL BUTTONS === */}
            <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-3">
                <button type="button" onClick={zoomToOffice} className="w-11 h-11 bg-white/80 text-red-600 rounded-full shadow border hover:scale-105">
                    <FontAwesomeIcon icon={faBuilding} />
                </button>

                <button type="button" onClick={zoomToBoth} className="w-11 h-11 bg-neutral-900/90 text-white rounded-full shadow hover:scale-105">
                    <FontAwesomeIcon icon={faExpand} />
                </button>

                <button type="button" onClick={zoomToUser} className="w-11 h-11 bg-white text-blue-500 rounded-full shadow border hover:scale-105">
                    <FontAwesomeIcon icon={faCrosshairs} />
                </button>
            </div>


            {/* === MAP === */}
            <MapContainer ref={mapRef} center={[pos.lat, pos.lng]} zoom={17} zoomControl={false} attributionControl={false} className="h-[260px] w-full rounded-xl">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {office?.lat && (
                    <AutoFitBounds
                        userPos={{ lat: pos.lat, lng: pos.lng }}
                        officePos={{ lat: office.lat, lng: office.lng }}
                    />
                )}

                {/* USER */}
                <Marker position={[pos.lat, pos.lng]} icon={userIcon} />

                {/* OFFICE */}
                {office?.lat && (
                    <>
                        <Marker position={[office.lat, office.lng]} icon={officeIcon} />
                        <Circle center={[office.lat, office.lng]} radius={radius} pathOptions={{ color: officeColor, fillOpacity: 0.12 }}/>

                        {start && end && (
                            <Polyline positions={[start, end]} pathOptions={{ color: "#3388ff", weight: 4, dashArray: "8 6" }} />
                        )}
                    </>
                )}
            </MapContainer>

            {/* === STATUS BADGE === */}
            {distance !== null && (
                <div
                    className={`absolute top-3 left-3 z-[1000] px-3 py-1.5 text-xs font-semibold rounded-full shadow
          ${isWithinRadius ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                    {isWithinRadius ? "Dalam Radius Lokasi" : "Di Luar Radius"}
                </div>
            )}
        </div>
    );
};

export default MapRadius;
