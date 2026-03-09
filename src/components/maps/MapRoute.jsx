import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faBuilding, faCrosshairs, faStore } from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";
import { getDistanceMeters } from "../../utils/locationUtils";
import { fetchWithJwt } from "../../utils/jwtHelper";


const getSmartZoom = (distance) => {
  if (distance < 100) return 20;
  if (distance < 500) return 19;
  if (distance < 1000) return 18;
  if (distance < 3000) return 17;
  if (distance < 5000) return 16;
  return 15;
};

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
      <FontAwesomeIcon icon={faLocationDot} style={{ color: "#2563eb", fontSize: "24px", zIndex: 2 }} />
    </div>,
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
      }}
    >
      <FontAwesomeIcon
        icon={faStore}
        style={{
          color: "#f59e0b",
          fontSize: "22px",
        }}
      />
    </div>
  ),
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const MapControls = ({ user, destination, onRefreshLocation }) => {
  const map = useMap();

  const refreshLocation = () => {
    onRefreshLocation?.();

    if (!user) return;

    if (!destination) {
      map.flyTo([user.lat, user.lng], 17, {
        duration: 0.6,
      });
      return;
    }

    const distance = getDistanceMeters(
      user.lat,
      user.lng,
      destination.lat,
      destination.lng
    );

    const smartZoom = getSmartZoom(distance);

    const bounds = L.latLngBounds(
      [user.lat, user.lng],
      [destination.lat, destination.lng]
    );

    map.fitBounds(bounds, {
      padding: [70, 70],
      maxZoom: smartZoom,
      animate: true,
      duration: 0.7,
    });
  };


  if (!user) return null;

  return (
    <div className="absolute top-2 right-2 z-[9999] pointer-events-auto">
      <button onClick={refreshLocation} className="bg-white text-sm text-blue-600 p-2 px-3 rounded-full shadow-lg border hover:bg-gray-100 transition">
        <FontAwesomeIcon icon={faCrosshairs} />
      </button>
    </div>
  );
};

const AutoFitBounds = ({ user, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!user) return;

    if (!destination) {
      map.setView([user.lat, user.lng], 18);
      return;
    }

    const distance = getDistanceMeters(
      user.lat,
      user.lng,
      destination.lat,
      destination.lng
    );

    // jika sangat dekat
    if (distance < 200) {
      const midLat = (user.lat + destination.lat) / 2;
      const midLng = (user.lng + destination.lng) / 2;

      map.setView([midLat, midLng], 19, {
        animate: true,
        duration: 0.8,
      });

      return;
    }

    const bounds = L.latLngBounds(
      [user.lat, user.lng],
      [destination.lat, destination.lng]
    );

    map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 18,
      animate: true,
      duration: 0.8,
    });

  }, [user, destination]);

  return null;
};


const MapRoute = ({ user, locations = [], destination, onDistance }) => {
  const [pos, setPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const GH_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const refreshGps = () => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        });
      },
      (err) => {
        console.error("GPS gagal:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  useEffect(() => {
    if (user?.lat && user?.lng) {
      setPos({ lat: user.lat, lng: user.lng });
    }
  }, [user]);


  useEffect(() => {
    if (!user || !destination) return;
    const fetchRoute = async () => {
      try {
        const url = `${GH_BASE_URL}/maps/route?point=${user.lat},${user.lng}&point=${destination.lat},${destination.lng}&profile=motorcycle&calc_points=true&points_encoded=false`;
        const res = await fetchWithJwt(url);
        const json = await res.json();
        if (!json?.data?.paths?.length) {
          console.error("Route kosong:", json);
          return;
        }
        const coords = json.data.paths[0].points.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteCoords(coords);
        const distance = json.data.paths[0].distance;
        onDistance?.(Math.round(distance));
      } catch (err) {
        console.error("Route error:", err);
      }
    };
    fetchRoute();
  }, [user, destination]);

  if (!pos) return null;

  const isInside = user && destination ? getDistanceMeters(user.lat, user.lng, destination.lat, destination.lng) <= 60 : false;

  return (
    <div className="relative w-full">
      <MapContainer
        zoomControl={false}
        className="z-10"
        zoom={16}
        attributionControl={false}
        style={{ height: "160px", borderRadius: "10px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {user && <MapControls user={user} destination={destination} onRefreshLocation={refreshGps} />}
        <AutoFitBounds user={user} destination={destination} />
        <Marker position={[pos.lat, pos.lng]} icon={userIcon} />

        {/* tampilkan semua lokasi jadwal */}
        {locations.map((loc) => {
          const coord = loc.koordinat.split(",").map(Number);
          const distance = getDistanceMeters(
            pos.lat,
            pos.lng,
            coord[0],
            coord[1]
          );
          const isInside = distance <= 60;
          return (
            <div key={loc.id}>
              <Marker position={[coord[0], coord[1]]} icon={officeIcon}>
                <Tooltip permanent direction="top" offset={[0, -14]} opacity={1} className="map-label">
                  <div className="map-label-text">
                    {loc.nama}
                  </div>
                </Tooltip>
              </Marker>
              <Circle center={[coord[0], coord[1]]} radius={60}
                pathOptions={{
                  color: isInside ? "#16a34a" : "#f59e0b",
                  fillColor: isInside ? "#16a34a" : "#f59e0b",
                  fillOpacity: 0.12,
                  weight: 2,
                }}
              />
            </div>
          );
        })}

        {/* jika ada lokasi yang dipilih */}
        {destination && (
          <>
            <Circle
              center={[destination.lat, destination.lng]}
              radius={60}
              pathOptions={{
                color: isInside ? "#16a34a" : "#ef4444",
                fillColor: isInside ? "#16a34a" : "#ef4444",
                fillOpacity: 0.2,
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
