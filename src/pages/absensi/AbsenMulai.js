import Select from "react-select";
import Webcam from "react-webcam";
import { useEffect, useState, useRef, useMemo } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { faArrowRight, faLocationDot, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { getDistanceMeters } from "../../utils/locationUtils";
import { useFakeGpsDetector } from "../../hooks/useFakeGpsDetector";
import { MapRadius } from "../../components";

const AbsenMulai = ({ handleNextStepData }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [tugas, setTugas] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [showShiftDetail, setShowShiftDetail] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userCoords, setUserCoords] = useState({ latitude: null, longitude: null });
  const webcamRef = useRef(null);
  const [fotoMulai, setFotoMulai] = useState(null);
  const [jamMulai, setJamMulai] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const { analyze } = useFakeGpsDetector();
  const [jadwal, setJadwal] = useState(null);
  const [lockLocation, setLockLocation] = useState(false);
  const [lockShift, setLockShift] = useState(false);
  const [isKadiv, setIsKadiv] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [distance, setDistance] = useState(null);
  const [gpsValidation, setGpsValidation] = useState({ is_valid: 1, reason: "", });

  const isFormValid = () =>
    selectedLocation &&
    selectedShift &&
    fotoMulai &&
    jamMulai;
  // && isWithinRadius;

  useEffect(() => {
    if (!jadwal) {
      setSelectedLocation(null);
    }
  }, [jadwal]);


  useEffect(() => {
    if (!selectedLocation || !userCoords.latitude || !userCoords.longitude) return;

    checkLocationRadius(selectedLocation);
  }, [selectedLocation, userCoords]);


  const capture = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    const now = new Date();

    setFotoMulai(imageSrc);
    setJamMulai(
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };


  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // user info
  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserId(user.id_user);
      setUsername(user.nama_user?.trim());
      setRoleName(user.role);
      setIsKadiv(!!user.is_kadiv);
    }
  }, []);

  useEffect(() => {
    if (jadwal && jadwal.lokasi?.length > 1) {
      setSelectedLocation(null);
    }
  }, [jadwal]);


  useEffect(() => {
    if (!userId || isKadiv) return;

    const fetchJadwal = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/jadwal/cek/${userId}`);

        if (res.status === 404) {
          setJadwal(null);
          setLockLocation(false);
          setLockShift(false);
          return;
        }

        if (!res.ok) throw new Error("Gagal ambil jadwal");
        const json = await res.json();
        // NORMALISASI: object -> array
        const jadwalList = json?.data
          ? Array.isArray(json.data)
            ? json.data
            : [json.data]
          : [];

        if (jadwalList.length === 0) {
          setJadwal(null);
          setLockLocation(false);
          setLockShift(false);
          return;
        }

        const data = jadwalList[0];
        setJadwal(data);

        setSelectedShift({
          id: data.id_shift,
          nama: data.nama_shift,
        });

        setLockShift(true);

        if (data.lokasi?.length === 1 && locations.length > 0) {
          const loc = data.lokasi[0];
          const fullLocation = locations.find(l => l.value === loc.id);

          if (fullLocation) {
            setSelectedLocation(fullLocation);
            setLockLocation(true);
          } else {
            setLockLocation(false);
          }
        } else {
          setLockLocation(false);
        }

      } catch (err) {
        console.error("Cek jadwal error:", err);
        setJadwal(null);
        setLockLocation(false);
        setLockShift(false);
      }
    };

    fetchJadwal();
  }, [userId, isKadiv, apiUrl, locations]);



  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { suspicious, reason } = analyze(position);
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsValidation({
          is_valid: suspicious ? 0 : 1,
          reason: reason.join(" | "),
        });
        setLoadingLocation(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setLoadingLocation(false);
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
    const fetchData = async (endpoint, setter, mapper) => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/${endpoint}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        const raw = json.data ?? json;
        setter(mapper ? mapper(raw) : raw);
      } catch (err) {
        console.error(`Gagal memuat ${endpoint}:`, err);
      }
    };

    fetchData("lokasi", setLocations, (data) =>
      data.map((loc) => {
        const [latStr, lonStr] = (loc.koordinat || "").split(",").map(s => s.trim());
        return {
          value: loc.id,
          label: loc.nama,
          timezone: loc.timezone,
          lat: parseFloat(latStr),
          lon: parseFloat(lonStr),
        };
      })
    );
    fetchData("shift", setShiftList);
  }, [apiUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Pastikan GPS aktif
    if (!userCoords.latitude || !userCoords.longitude) {
      Swal.fire({
        icon: "error",
        title: "GPS Tidak Terdeteksi",
        text: "Pastikan GPS aktif sebelum melakukan absensi.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    // 2. Foto wajib
    if (!fotoMulai) {
      Swal.fire({
        icon: "warning",
        title: "Foto Wajib Diambil",
        text: "Silakan ambil foto kehadiran terlebih dahulu.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // 3. Lokasi wajib dipilih
    if (!selectedLocation) {
      Swal.fire({
        icon: "warning",
        title: "Lokasi Belum Dipilih",
        text: "Silakan pilih lokasi kerja terlebih dahulu.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // 4. Cek radius
    if (distance > 60) {
      const displayDistance = distance < 1000 ? `${Math.floor(distance)} meter` : `${(distance / 1000).toFixed(2)} km`;

      Swal.fire({
        icon: "error",
        title: "Absensi Ditolak",
        html: `
      <div style="text-align:left; font-size:14px; line-height:1.6;">
        <p><strong>Jarak Anda dari lokasi kerja:</strong></p>
        <p style="font-size:16px; color:#dc2626;"><strong>${displayDistance}</strong></p>
        
        <p>
          Absensi hanya dapat dilakukan dalam radius 
          <strong>maksimal 60 meter</strong> dari lokasi kerja.
        </p>

        <p>
          Silakan mendekat ke area kerja terlebih dahulu 
          sebelum melakukan absensi.
        </p>
      </div>
    `,
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    if (!jadwal && !isKadiv) {
      Swal.fire({
        toast: true,
        position: "top",
        icon: "error",
        title: "Absensi tidak dapat dilakukan",
        text: "Anda belum memiliki jadwal kerja hari ini. Silakan hubungi Kepala Divisi.",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
      });
      return;
    }

    // 6. Cek form dasar
    if (!isFormValid()) {
      return;
    }

    // 7. Kirim data
    const now = new Date();

    const formData = {
      userId,
      nama: username,
      id_lokasi: selectedLocation?.value || "",
      lokasi: selectedLocation?.label || "",
      tanggalMulai: formatFullDate(now),
      jamMulai: formatTime(now),
      tugas,
      id_shift: selectedShift?.id ?? "",
      shift: selectedShift?.nama ?? "",
      koordinatMulai: userCoords.latitude && userCoords.longitude
        ? `${userCoords.latitude},${userCoords.longitude}`
        : "",
      fotoMulai,
      tipe_absensi: 1,
      timezone: selectedLocation?.timezone || "",
      is_valid: gpsValidation.is_valid,
      reason: gpsValidation.reason,
    };
    handleNextStepData(formData);
  };


  const checkLocationRadius = (loc) => {
    if (!userCoords.latitude || !userCoords.longitude || !loc?.lat || !loc?.lon) return;

    const dist = getDistanceMeters(
      Number(userCoords.latitude),
      Number(userCoords.longitude),
      Number(loc.lat),
      Number(loc.lon)
    );
    setDistance(dist);
  };



  const filteredLocations = useMemo(() => {
    // Kadiv bebas pilih semua lokasi
    if (isKadiv) return locations;

    if (!jadwal || !Array.isArray(jadwal.lokasi) || jadwal.lokasi.length === 0) {
      return [];
    }

    // Filter sesuai jadwal
    return locations.filter((loc) =>
      jadwal.lokasi.some((j) => Number(j.id) === Number(loc.value))
    );
  }, [jadwal, locations, isKadiv]);



  const mapUser = userCoords.latitude
    ? { lat: userCoords.latitude, lng: userCoords.longitude }
    : null;

  const mapLocation = selectedLocation
    ? { lat: selectedLocation.lat, lng: selectedLocation.lon }
    : null;

  const handleUserMove = (pos) => {
    setUserCoords({
      latitude: pos.lat,
      longitude: pos.lng,
    });
  };

  const handleBlockedClick = () => {
    if (distance !== null && distance > 60) {
      const displayDistance =
        distance < 1000
          ? `${Math.floor(distance)} meter`
          : `${(distance / 1000).toFixed(2)} km`;

      Swal.fire({
        icon: "error",
        title: "Absensi Ditolak",
        html: `
        <div style="text-align:left; font-size:14px; line-height:1.6;">
          <p><strong>Jarak Anda dari lokasi kerja:</strong></p>
          <p style="font-size:16px; color:#dc2626;"><strong>${displayDistance}</strong></p>

          <p>
            Absensi hanya dapat dilakukan dalam radius 
            <strong>maksimal 60 meter</strong>.
          </p>

          <p>
            Silakan mendekat ke area kerja terlebih dahulu.
          </p>
        </div>
      `,
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#dc2626",
      });
    }
  };


  return (
    <MobileLayout title="Absen Masuk Kerja" className="bg-gray-100">
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-xl pb-28 space-y-6">
          <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-sm font-semibold">
                  Foto Kehadiran <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Ambil foto wajah sebagai bukti kehadiran.
                </p>
              </div>

              {fotoMulai && (
                <button type="button" onClick={() => setFotoMulai(null)} className="p-2 px-3 rounded-md border border-red-300 text-red-500 hover:bg-red-50 transition" title="Ambil ulang foto" aria-label="Ambil ulang foto">
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>
              )}
            </div>


            {!fotoMulai ? (
              <>
                <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} mirrored={false} className="w-full h-full object-cover scale-x-[-1]" />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={switchCamera} className="flex-1 py-3 text-md font-semibold rounded-lg border bg-blue-500 text-white hover:bg-blue-600">
                    Putar Kamera
                  </button>
                  <button type="button" onClick={capture} className="flex-1 py-3 text-md font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">
                    Ambil Foto
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border">
                  <img src={fotoMulai} alt="Foto Kehadiran" className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-3 text-white">
                    <p className="text-base font-bold leading-tight">
                      {username}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-200">
                      <span>{roleName}</span>
                      <span className="opacity-60">•</span>
                      <span>{jamMulai}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div>
              <label className="text-sm font-semibold">
                Lokasi Kerja <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Lokasi disesuaikan dengan posisi GPS Anda.
              </p>
            </div>

            {/* MAP WRAPPER */}
            <div className="relative w-full h-[260px] rounded-xl overflow-hidden">
              <MapRadius user={mapUser} location={mapLocation} radius={60} onUserMove={handleUserMove} />
            </div>

            {!jadwal && !isKadiv && (
              <div className="text-xs text-red-600 font-semibold">
                Anda belum memiliki jadwal kerja hari ini. Silakan hubungi Kepala Divisi Anda.
              </div>
            )}

            <Select options={filteredLocations} value={selectedLocation} isDisabled={lockLocation} placeholder={lockLocation ? "Lokasi sudah ditentukan" : "Pilih lokasi"} className="text-sm" onChange={(loc) => {
              setSelectedLocation(loc);
              checkLocationRadius(loc);
            }}
            />

            {/* INFO GPS */}
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              {loadingLocation && (
                <span className="text-gray-500">Mencari lokasi GPS…</span>
              )}

              {!loadingLocation && userCoords.latitude && (
                <>
                  <span className="text-green-600 bg-green-100 border border-green-600 rounded px-2 py-0.5 font-semibold flex items-center gap-1 whitespace-nowrap">
                    <FontAwesomeIcon icon={faLocationDot} className="animate-bounce" />
                    Berhasil Melacak Titik Lokasi Anda
                  </span>

                  {distance !== null && (
                    <span
                      className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap
                      ${distance <= 60
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-red-100 text-red-700 border border-red-300"
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

              {!loadingLocation && !userCoords.latitude && (
                <span className="text-red-500">GPS tidak tersedia</span>
              )}
            </div>
          </section>


          <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div>
              <label className="text-sm font-semibold">
                Shift Kerja <span className="text-red-500">*</span>
              </label>

              <p className="text-[11px] text-gray-500 mt-0.5">
                {lockShift ? "Shift ini telah dijadwalkan oleh Kepala Divisi sesuai pengaturan kerja." : "Pilih shift sesuai jadwal kerja yang berlaku dan sesuai."}
              </p>
            </div>

            <Select options={shiftList.map((s) => ({ value: s.id, label: s.nama, }))}
              value={selectedShift ? { value: selectedShift.id, label: selectedShift.nama } : null}
              isDisabled={lockShift}
              placeholder={lockShift ? "Shift sudah dijadwalkan" : "Pilih shift"}
              className="text-sm"
              onChange={(opt) => {
                const found = shiftList.find((s) => s.id === opt.value);
                setSelectedShift(found || null);
              }}
            />

            {lockShift && (
              <div className="text-[10px] text-gray-400">
                Jika terdapat ketidaksesuaian jadwal, silakan hubungi Kepala Divisi Anda.
              </div>
            )}

            {selectedShift?.detail && (
              <button type="button" onClick={() => setShowShiftDetail(!showShiftDetail)} className="text-xs text-green-600 underline text-left">
                {showShiftDetail ? "Sembunyikan detail shift" : "Lihat detail shift"}
              </button>
            )}

            {showShiftDetail && selectedShift?.detail && (
              <ul className="text-[10px] divide-y border rounded-lg">
                {selectedShift.detail.map((d, i) => (
                  <li key={i} className="flex justify-between px-3 py-1">
                    <span className="font-medium">{d.hari}</span>
                    <span>{d.jam_masuk} - {d.jam_pulang}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl border shadow-sm p-4 space-y-2">
            <label className="text-sm font-semibold">
              Keterangan <span className="text-gray-400">(Opsional)</span>
            </label>
            <textarea rows="3" value={tugas} onChange={(e) => setTugas(e.target.value)} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400" placeholder="Tambahkan catatan jika diperlukan" />
          </section>

          {/* {!isWithinRadius && (
            <p className="text-xs text-red-600 font-semibold text-center">
              Anda berada di luar radius absensi (maks. 60 meter).
            </p>
          )} */}


          <button type="submit"
            onClick={(e) => {
              if (distance !== null && distance > 60) {
                e.preventDefault();
                handleBlockedClick();
              }
            }}
            disabled={!isKadiv && !jadwal}
            className={`w-full py-4 rounded-lg font-semibold transition
              ${distance !== null && distance > 60 ? "bg-red-500 text-white cursor-not-allowed" : isFormValid() ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-400 text-white cursor-not-allowed"}`}
          >
            Lihat Detail Absen Masuk
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </form>
      </div>
    </MobileLayout>
  );

};

export default AbsenMulai;
