import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import Select from "react-select";
import MobileLayout from "../../layouts/mobileLayout";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateBack, faMapMarkerAlt, faSpinner, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useFakeGpsDetector } from "../../hooks/gps/useFakeGpsDetector";


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
  const [gpsValidation, setGpsValidation] = useState({
    is_valid: 1,
    reason: "",
  });

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


  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Error", "Browser tidak mendukung geolocation", "error");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        Swal.fire("Error", "Gagal mendapatkan lokasi", "error");
      },
      { enableHighAccuracy: true }
    );
  };


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
    setUserCoords({ latitude: null, longitude: null });
    setSelectedLocation(null);
  };


  const isValid = () =>
    fotoFile instanceof File &&
    selectedLocation !== null &&
    typeof userCoords.latitude === "number" &&
    typeof userCoords.longitude === "number";


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid()) return;

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
      is_valid: gpsValidation.is_valid,   // 🔥 TAMBAH
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

  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // radius bumi dalam meter
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // hasil meter
  };

  const showRadiusWarning = (dist) => {
    const displayDist = dist < 1000
      ? `${Math.floor(dist)} meter`
      : `${(dist / 1000).toFixed(2)} km`;

    Swal.fire({
      icon: "warning",
      title: "Lokasi Absensi Anda Di Luar Jangkauan",
      html: `
      <div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><strong>Jarak Anda:</strong> ${displayDist} dari titik lokasi kerja.</p>
        <p>Absensi hanya sah dalam radius <strong>60 meter</strong>. Saat ini posisi Anda di luar batas tersebut.</p>
        <p>Anda tetap bisa melanjutkan, tetapi HRD akan memeriksa data absensi Anda.</p>
        <p>Disarankan melakukan absensi <strong>di area lokasi kerja</strong> agar data akurat dan valid.</p>
      </div>
    `,
      confirmButtonText: "Lanjutkan Absensi",
      confirmButtonColor: "#d33",
      focusConfirm: true,
    });
  };


  const checkLocationRadius = (userLat, userLon, loc) => {
    if (!userLat || !userLon || !loc?.lat || !loc?.lon) return;

    const jarak = getDistanceMeters(userLat, userLon, loc.lat, loc.lon);

    if (jarak > 60) {
      showRadiusWarning(jarak);
    }
  };

  return (
    <MobileLayout title="Absen Selesai">
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-6 bg-white rounded-xl shadow">
        {!fotoFile ? (
          <div className="space-y-4">
            <div className="aspect-[3/4] w-full bg-gray-100 rounded-xl overflow-hidden shadow">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover scale-x-[-1]" />
            </div>
            <p className="text-[10px] text-gray-600 text-center leading-snug">
              Silakan ambil foto sebagai bukti selesai bekerja. Pastikan wajah terlihat jelas dan cahaya memadai. Anda dapat menukar kamera depan/belakang sesuai kebutuhan.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFacingMode((p) => (p === "user" ? "environment" : "user"))} className="flex-1 py-3 bg-blue-500 text-white rounded-lg">
                Balik Kamera
              </button>
              <button type="button" onClick={handleAmbilFoto} className="flex-1 py-3 bg-green-500 text-white rounded-lg">
                Ambil Foto
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border shadow">
              <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute bottom-0 w-full bg-black/60 text-white p-2 text-center text-xs">
                {formatFullDate(jamSelesai)} • {formatTime(jamSelesai)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold">
                Lokasi Selesai Bekerja<span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] text-gray-500 mb-2 leading-snug">
                <span className="text-[10px] text-gray-400">
                  (Pastikan fitur GPS di ponsel aktif dan sinyal kuat agar lokasi terdeteksi akurat.)
                </span>
              </p>

              <Select options={locations} value={selectedLocation} onChange={(loc) => { setSelectedLocation(loc); checkLocationRadius(userCoords.latitude, userCoords.longitude, loc); }} placeholder="Pilih lokasi..." isSearchable className="text-xs" />

              <div className="flex items-center mt-1 text-[9px]">
                {loadingLocation ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-500">
                    <FontAwesomeIcon icon={faSpinner} className="text-gray-400 text-xs animate-spin" />
                    <span className="font-medium">
                      Mencari titik lokasi GPS anda...
                    </span>
                  </div>
                ) : userCoords.latitude && userCoords.longitude ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-600">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 text-xs animate-bounce" />
                    <span className="font-semibold">
                      Lokasi GPS berhasil ditemukan
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-500">
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-xs" />
                    <span className="font-semibold">
                      Lokasi GPS tidak tersedia. Aktifkan GPS dan coba ulangi.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-gray-500 text-center">
                Pastikan foto dan lokasi sudah sesuai sebelum melanjutkan.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={handleUlangi} className="flex-1 border border-red-500 text-red-500 rounded-lg py-3">
                  <FontAwesomeIcon icon={faArrowRotateBack} /> Ulangi
                </button>
                <button type="submit" disabled={!isValid()} className={`flex-1 py-3 rounded-lg text-white font-medium ${isValid() ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"}`}>
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </MobileLayout>
  );
};

export default AbsenSelesai;