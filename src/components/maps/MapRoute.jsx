import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faBuilding, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";
import { getDistanceMeters } from "../../utils/locationUtils";


// === ICONS ===
const userIcon = L.divIcon({
  html: ReactDOMServer.renderToString(
    <FontAwesomeIcon icon={faLocationDot} style={{ color: "#2563eb", fontSize: "24px" }} />
  ),
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const officeIcon = L.divIcon({
  html: ReactDOMServer.renderToString(
    <FontAwesomeIcon icon={faBuilding} style={{ color: "#dc2626", fontSize: "24px" }} />
  ),
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// === GPS BUTTON CONTROL (PASTI WORK) ===
const RecenterControl = ({ position }) => {
  const map = useMap();

  const handleClick = (e) => {
    e.stopPropagation();
    map.flyTo([position.lat, position.lng], 17, { duration: 0.6 });
  };

  return (
    <div onClick={handleClick}
      className="absolute top-3 right-3 z-[1000] bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1 active:scale-95 transition select-none cursor-pointer"
    >
      <FontAwesomeIcon icon={faCrosshairs} />
      GPS
    </div>
  );
};

const MapRoute = ({ user, destination }) => {
  const [pos, setPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (user?.lat && user?.lng) {
      setPos({ lat: user.lat, lng: user.lng });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !destination) return;

    const fetchRoute = async () => {
      try {
        const url = `http://192.168.17.41:8989/route?point=${user.lat},${user.lng}&point=${destination.lat},${destination.lng}&profile=motorcycle&calc_points=true&points_encoded=false`;

        const res = await fetch(url);
        const data = await res.json();

        const coords = data.paths[0].points.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        setRouteCoords(coords);
      } catch (err) {
        console.error("Route error:", err);
      }
    };

    fetchRoute();
  }, [user, destination]);

  if (!pos) return null;

  const isInside = user && destination
    ? getDistanceMeters(
      user.lat,
      user.lng,
      destination.lat,
      destination.lng
    ) <= 60
    : false;


  return (
    <div className="relative w-full">
      <MapContainer center={[pos.lat, pos.lng]} zoom={16} attributionControl={false} style={{ height: "260px", borderRadius: "16px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <RecenterControl position={pos} />

        <Marker position={[pos.lat, pos.lng]} icon={userIcon} />

        {destination && (
          <>
            {/* Marker Gedung */}
            <Marker position={[destination.lat, destination.lng]} icon={officeIcon} />

            {/* Radius 60 Meter */}
            <Circle
              center={[destination.lat, destination.lng]}
              radius={60}
              pathOptions={{
                color: isInside ? "#16a34a" : "#dc2626",
                fillColor: isInside ? "#16a34a" : "#dc2626",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />


            {/* Rute */}
            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} pathOptions={{ weight: 4 }} />
            )}
          </>
        )}

      </MapContainer>
    </div>
  );
};

export default MapRoute;
