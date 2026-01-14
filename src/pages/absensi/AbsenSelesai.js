import { useState, useRef, useEffect, useMemo } from "react";
import Webcam from "react-webcam";
import Select from "react-select";
import MobileLayout from "../../layouts/mobileLayout";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faLocationDot, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../../utils/dateUtils";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { useFakeGpsDetector } from "../../hooks/useFakeGpsDetector";
import { getDistanceMeters } from "../../utils/locationUtils";
import { MapRadius } from "../../components";


const AbsenSelesai = ({ handleNextStepData }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const webcamRef = useRef(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [jamSelesai, setJamSelesai] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userCoords, setUserCoords] = useState({ latitude: null, longitude: null, });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const { analyze } = useFakeGpsDetector();
  const [userId, setUserId] = useState(null);
  const [isKadiv, setIsKadiv] = useState(false);
  const [jadwal, setJadwal] = useState(null);
  const [lockLocation, setLockLocation] = useState(false);
  const [username, setUsername] = useState("");
  const [roleName, setRoleName] = useState("");
  const [distance, setDistance] = useState(null);
  const [isWithinRadius, setIsWithinRadius] = useState(true);

  const [gpsValidation, setGpsValidation] = useState({
    is_valid: 1,
    reason: "",
  });

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserId(user.id_user);
      setUsername(user.nama_user?.trim() || "");
      setRoleName(user.role || "");
      setIsKadiv(!!user.is_kadiv);
    }
  }, []);

  useEffect(() => {
    if (!selectedLocation || !userCoords.latitude || !userCoords.longitude) return;

    checkLocationRadius(
      userCoords.latitude,
      userCoords.longitude,
      selectedLocation
    );
  }, [selectedLocation, userCoords]);



  useEffect(() => {
    if (!userId || isKadiv) return;

    const fetchJadwal = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/jadwal/cek/${userId}`);
        if (res.status === 404) {
          // fallback bebas
          setLockLocation(false);
          return;
        }
        if (!res.ok) throw new Error("Gagal ambil jadwal");
        const json = await res.json();
        const data = json.data;
        setJadwal(data);
        // ===== LOKASI =====
        if (data.lokasi?.length === 1 && locations.length > 0) {
          const loc = data.lokasi[0];
          const fullLocation = locations.find(l => l.value === loc.id_lokasi);

          if (fullLocation) {
            setSelectedLocation(fullLocation);
            setLockLocation(true);   // kunci karena hanya 1 lokasi
          } else {
            setLockLocation(false); // jangan kunci kalau belum ketemu
          }
        }
        else if (data.lokasi?.length > 1) {
          setLockLocation(false);
        }

      } catch (err) {
        console.error("Cek jadwal selesai error:", err);
        setLockLocation(false);
      }
    };

    fetchJadwal();
  }, [userId, isKadiv, apiUrl, locations]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 3000,
      }
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { suspicious, reason } = analyze(position);

        setGpsValidation({
          is_valid: suspicious ? 0 : 1,
          reason: reason.join(" | "),
        });
      },
      (err) => {
        console.error("GPS watch error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    fetchWithJwt(`${apiUrl}/lokasi`)
      .then((res) => res.json())
      .then((data) =>
        setLocations(
          (data.data || []).map((item) => {
            const [lat, lon] = item.koordinat.split(",").map(Number);
            return {
              value: item.id,
              label: item.nama,
              timezone: item.timezone,
              lat,
              lon,
            };
          })
        )
      )
      .catch(() => Swal.fire("Error", "Gagal memuat daftar lokasi", "error"));
  }, [apiUrl]);

  const handleAmbilFoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const file = base64ToFile(imageSrc, "fotoSelesai.jpg");
      setFotoFile(file);
      setFotoPreview(imageSrc);
      setJamSelesai(new Date());
    }
  };


  const handleUlangi = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setJamSelesai(null);
  };


  const isValid = () =>
    jadwal &&                              // 🔒 wajib ada jadwal
    fotoFile instanceof File &&
    selectedLocation !== null &&
    typeof userCoords.latitude === "number" &&
    typeof userCoords.longitude === "number";


  /*
  // 🔒 BLOK RADIUS DINONAKTIFKAN
  && isWithinRadius;
  */



  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid()) {
      return;
    }

    // if (!isWithinRadius && distance !== null) {
    //   showRadiusBlockedToast(distance);
    // }

    handleNextStepData({
      fotoSelesai: fotoFile,
      id_lokasi: selectedLocation.value,
      timezone: selectedLocation.timezone,
      lokasi: selectedLocation.label,
      jamSelesai: jamSelesai.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      koordinatSelesai: `${userCoords.latitude}, ${userCoords.longitude}`,
      is_valid: gpsValidation.is_valid,
      reason: gpsValidation.reason,
    });
  };


  const base64ToFile = (base64, filename) => {
    const [meta, data] = base64.split(",");
    const mime = meta.match(/:(.*?);/)[1];
    const bstr = atob(data);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], filename, { type: mime });
  };

  const showRadiusBlockedToast = (dist) => {
    const displayDist = dist < 1000
      ? `${Math.floor(dist)} meter`
      : `${(dist / 1000).toFixed(2)} km`;

    Swal.fire({
      icon: "error",
      title: "Absensi Ditolak",
      html: `
      <div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><strong>Jarak Anda:</strong> ${displayDist}</p>
        <p>Absensi hanya diperbolehkan dalam radius <strong>60 meter</strong>.</p>
        <p>Silakan menuju ke lokasi kerja sebelum melakukan absen pulang.</p>
      </div>
    `,
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#d33",
    });
  };


  const checkLocationRadius = (userLat, userLon, loc) => {
    if (!userLat || !userLon || !loc?.lat || !loc?.lon) return;

    const jarak = getDistanceMeters(userLat, userLon, loc.lat, loc.lon);
    setDistance(jarak);

    // BLOK DINONAKTIFKAN
    // if (jarak > 60) setIsWithinRadius(false);
    // else setIsWithinRadius(true);
  };

  const filteredLocations = useMemo(() => {
    if (isKadiv) return locations;

    if (!jadwal || !Array.isArray(jadwal.lokasi) || jadwal.lokasi.length === 0) {
      return []; // 🔒 Tidak ada jadwal → lokasi kosong
    }

    return locations.filter((loc) =>
      jadwal.lokasi.some((j) => Number(j.id_lokasi) === Number(loc.value))
    );
  }, [jadwal, locations, isKadiv]);



  const mapUser = userCoords.latitude
    ? { lat: userCoords.latitude, lng: userCoords.longitude }
    : null;

  const mapLocation = selectedLocation
    ? { lat: selectedLocation.lat, lng: selectedLocation.lon }
    : null;


  return (
    <MobileLayout title="Absen Selesai" className="bg-gray-100">
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg pb-28 space-y-6">
          <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-sm font-semibold">
                  Foto Selesai Bekerja <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Ambil foto sebagai bukti selesai bekerja.
                </p>
              </div>

              {fotoFile && (
                <button type="button" onClick={handleUlangi} className="p-2 px-3 rounded-md border border-red-300 text-red-500 hover:bg-red-50 transition" title="Ambil ulang foto" aria-label="Ambil ulang foto">
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>
              )}
            </div>

            {!fotoFile ? (
              <>
                <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden">
                  <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover scale-x-[-1]" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setFacingMode((p) => p === "user" ? "environment" : "user")} className="flex-1 py-3 font-semibold text-sm rounded-lg border bg-blue-500 hover:bg-blue-600 text-white">
                    Putar Kamera
                  </button>
                  <button type="button" onClick={handleAmbilFoto} className="flex-1 py-3 font-semibold text-sm rounded-lg bg-green-500 text-white hover:bg-green-600">
                    Ambil Foto
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border">
                  <img src={fotoPreview} alt="Foto Selesai" className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-3 text-white">
                    <p className="text-base font-bold leading-tight">
                      {username}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-200">
                      <span>{roleName}</span>
                      <span className="opacity-60">•</span>
                      <span>{formatTime(jamSelesai)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div>
              <label className="text-sm font-semibold">
                Lokasi Selesai Bekerja <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Lokasi disesuaikan dengan posisi GPS Anda.
              </p>
            </div>

            {/* MAP WRAPPER */}
            <div className="relative w-full h-[260px] rounded-xl overflow-hidden">
              <MapRadius
                user={mapUser}
                location={mapLocation}
                radius={60}
              />
            </div>

            {!jadwal && !isKadiv && (
              <div className="text-xs text-red-600 font-semibold">
                Anda belum memiliki jadwal kerja hari ini. Silakan hubungi Kepala Divisi Anda.
              </div>
            )}


            {/* SELECT LOKASI */}
            <Select
              options={filteredLocations}
              value={selectedLocation}
              isDisabled={lockLocation}
              isSearchable
              placeholder={lockLocation ? "Lokasi sudah ditentukan" : "Pilih lokasi"}
              className="text-sm"
              onChange={(loc) => {
                setSelectedLocation(loc);
                checkLocationRadius(
                  userCoords.latitude,
                  userCoords.longitude,
                  loc
                );
              }}

            />

            {/* INFO GPS */}
            <div className="flex items-center gap-2 text-[10px] flex-wrap">
              {loadingLocation && (
                <span className="text-gray-500">Mencari lokasi GPS…</span>
              )}

              {!loadingLocation && userCoords.latitude && (
                <>
                  <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <FontAwesomeIcon icon={faLocationDot} className="animate-bounce" />
                    Berhasil Melacak Titik Lokasi Anda
                  </span>

                  {distance !== null && (
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${distance <= 60
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      Jarak:{" "}
                      {distance < 1000
                        ? `${Math.floor(distance)} m`
                        : `${(distance / 1000).toFixed(2)} km`}
                    </span>
                  )}
                </>
              )}

              {/* {!isWithinRadius && (
                <p className="text-xs text-red-600 font-semibold">
                  Anda berada di luar radius absensi. Mendekatlah ke lokasi kerja.
                </p>
              )} */}

              {!loadingLocation && !userCoords.latitude && (
                <span className="text-red-500">
                  GPS tidak tersedia. Aktifkan GPS.
                </span>
              )}
            </div>
          </section>

          {/* ================= AKSI ================= */}
          {fotoFile && (
            <section className="space-y-3">
              {!isValid() && (
                <p className="text-[10px] text-gray-500 text-center">
                  Pastikan foto dan lokasi sudah sesuai sebelum melanjutkan.
                </p>
              )}

              <div className="flex gap-3">
                <button type="submit" className={`flex-1 py-4 rounded-lg font-semibold transition
                    ${isValid() ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-400 text-white hover:bg-red-500"}`}
                >
                  Lihat Detail Absen Pulang <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </MobileLayout>
  );

};

export default AbsenSelesai;