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
    <div
      style={{
        position: "relative",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ring ping */}
      <span
        style={{
          position: "absolute",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "2px solid #2563eb",
          opacity: 0.6,
          animation: "ping 1.6s ease-out infinite",
        }}
      ></span>

      {/* Icon */}
      <FontAwesomeIcon
        icon={faLocationDot}
        style={{ color: "#2563eb", fontSize: "24px", zIndex: 2 }}
      />
    </div>
  ),
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});



const officeIcon = L.divIcon({
  html: ReactDOMServer.renderToString(
    <div
      style={{
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#dc2626",     // warna ikon
      }}
    >
      <FontAwesomeIcon icon={faBuilding} style={{ fontSize: "24px" }} />
    </div>
  ),
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],     // pusat geometris
});


const MapControls = ({ user, destination }) => {
  const map = useMap();

  const goUser = () => {
    if (!user) return;
    map.flyTo([user.lat, user.lng], 17, { duration: 0.6 });
  };

  const goOffice = () => {
    if (!destination) return;
    map.flyTo([destination.lat, destination.lng], 17, { duration: 0.6 });
  };

  const goBoth = () => {
    if (!user || !destination) return;

    const bounds = L.latLngBounds(
      [user.lat, user.lng],
      [destination.lat, destination.lng]
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="absolute top-2 right-2 z-[9999] flex flex-col gap-2 pointer-events-auto">

      {user && (
        <button onClick={goUser} className="bg-blue-600 text-white p-2.5 px-3.5 rounded-full shadow">
          <FontAwesomeIcon icon={faLocationDot} />
        </button>
      )}

      {destination && (
        <button onClick={goOffice} className="bg-red-600 text-white p-2.5 px-3.5 rounded-full shadow">
          <FontAwesomeIcon icon={faBuilding} />
        </button>
      )}

      {user && destination && (
        <button onClick={goBoth} className="bg-gray-800 text-white p-2.5 px-3.5 rounded-full shadow">
          <FontAwesomeIcon icon={faCrosshairs} />
        </button>
      )}
    </div>
  );
};



const AutoFitBounds = ({ user, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (user && destination) {
      const bounds = L.latLngBounds(
        [user.lat, user.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [user, destination]);

  return null;
};


const MapRoute = ({ user, destination, onDistance }) => {
  const [pos, setPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const GH_BASE_URL = process.env.REACT_APP_GRAPHHOPPER_BASE_URL;

  useEffect(() => {
    if (user?.lat && user?.lng) {
      setPos({ lat: user.lat, lng: user.lng });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !destination) return;

    const fetchRoute = async () => {
      try {
        const url = `${GH_BASE_URL}/route?point=${user.lat},${user.lng}&point=${destination.lat},${destination.lng}&profile=motorcycle&calc_points=true&points_encoded=false`;
        const res = await fetch(url);
        const data = await res.json();
        const coords = data.paths[0].points.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRouteCoords(coords);
        const distance = data.paths[0].distance;
        onDistance?.(Math.round(distance));
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
      <MapContainer zoomControl={false} className="z-10" center={[pos.lat, pos.lng]} zoom={16} attributionControl={false} style={{ height: "160px", borderRadius: "10px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {user && (
          <MapControls user={user} destination={destination} />
        )}
        <AutoFitBounds user={user} destination={destination} />


        <Marker position={[pos.lat, pos.lng]} icon={userIcon} />

        {destination && (
          <>
            <Marker position={[destination.lat, destination.lng]} icon={officeIcon} />

            <Circle center={[destination.lat, destination.lng]} radius={60}
              pathOptions={{
                color: isInside ? "#16a34a" : "#dc2626",
                fillColor: isInside ? "#16a34a" : "#dc2626",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />

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
