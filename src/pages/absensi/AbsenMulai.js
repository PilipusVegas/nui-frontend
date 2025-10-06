import { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import MobileLayout from "../../layouts/mobileLayout";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronRight, faChevronUp, faMapMarkerAlt, faSpinner, faTimesCircle, } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import Swal from "sweetalert2";

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

  const isFormValid = () =>
    selectedLocation && selectedShift && fotoMulai && jamMulai;

  // ambil foto
  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    const now = new Date();
    setFotoMulai(imageSrc);
    setJamMulai(now);
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
    }
  }, []);

  // koordinat GPS
  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (err) => {
          console.error("Gagal mendapatkan lokasi:", err);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: false, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation tidak didukung browser ini.");
      setLoadingLocation(false);
    }
  }, []);

  // fetch lokasi & shift
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
      data.map((loc) => ({ value: loc.id, label: loc.nama }))
    );
    fetchData("shift", setShiftList);
  }, [apiUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const now = new Date();

    const formData = {
      userId,
      nama: username,
      id_lokasi: selectedLocation?.value || "",
      lokasi: selectedLocation?.label || "",
      tanggalMulai: now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", }),
      jamMulai: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", }),
      tugas,
      id_shift: selectedShift?.id ?? "",
      shift: selectedShift?.nama ?? "",
      koordinatMulai: userCoords.latitude && userCoords.longitude ? `${userCoords.latitude},${userCoords.longitude}` : "",
      fotoMulai,
      tipe_absensi: 1,
    };

    handleNextStepData(formData);
  };


  return (
    <MobileLayout title="Absen Masuk Kerja" className="bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-center">
        <form className="w-full max-w-xl px-3 pb-10 space-y-5 tracking-wider" onSubmit={handleSubmit}>
          {/* Kamera / Foto */}
          <div className="mt-3">
            <label className="block text-sm font-semibold">
              Foto Kehadiran<span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-gray-500 mb-2">
              Pastikan wajah Anda terlihat jelas dan gunakan kamera depan atau belakang sesuai kebutuhan. <strong>jika sudah scroll kebawah</strong>
            </p>

            {!fotoMulai ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-md">
                  <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} mirrored={false} className="w-full h-full object-cover scale-x-[-1]" />
                </div>

                <div className="flex gap-3 mt-4 w-full">
                  <button type="button" onClick={switchCamera} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base font-medium shadow-sm transition">
                    Switch Kamera
                  </button>
                  <button type="button" onClick={capture} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-base font-medium shadow-sm transition">
                    Ambil Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  {/* Foto Absen */}
                  <img src={fotoMulai} alt="Foto Mulai" className="w-full h-full object-cover scale-x-[-1]" />

                  {/* Overlay Informasi */}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/90 to-transparent px-3 py-2 text-white">
                    <p className="text-sm font-semibold">Tanggal: {jamMulai?.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    <p className="text-sm font-semibold">Waktu: {jamMulai?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setFotoMulai(null)} className="flex-1 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition">
                    Ulangi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-xs font-bold">
              Lokasi Bekerja<span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-gray-500 mb-2">
              Pilih lokasi kerja sesuai titik GPS Anda saat ini.
            </p>
            <Select options={locations} value={selectedLocation} onChange={setSelectedLocation} placeholder="Pilih lokasi..." isSearchable className="text-xs" />

            {/* Status lokasi */}
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
                    Lokasi GPS tidak tersedia
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shift */}
          <div>
            <label className="block text-xs font-bold">
              Jadwal Kerja / Shift<span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-gray-500 mb-2">
              Pilih shift sesuai jadwal kerja yang sudah ditentukan.
            </p>
            <Select options={shiftList.map((s) => ({ value: s.id, label: s.nama, }))}
              value={
                selectedShift
                  ? { value: selectedShift.id, label: selectedShift.nama }
                  : null
              }
              onChange={(opt) => {
                const found = shiftList.find((s) => s.id === opt.value);
                setSelectedShift(found || null);
              }}
              placeholder="Pilih Shift"
              className="text-xs"
            />
          </div>

          {selectedShift?.detail && (
            <div className="rounded-md overflow-hidden border border-green-500 bg-white shadow-sm">
              <div className="flex justify-between items-center px-4 py-3 bg-green-600 text-white text-[10px] font-semibold cursor-pointer" onClick={() => setShowShiftDetail(!showShiftDetail)}>
                <span>Lihat Jadwal {selectedShift.nama}</span>
                <FontAwesomeIcon icon={showShiftDetail ? faChevronUp : faChevronRight} className="ml-3 text-xs" />
              </div>

              {showShiftDetail && (
                <ul className="divide-y divide-green-200 text-[9px]">
                  {selectedShift.detail.map((item, i) => (
                    <li key={i} className="flex justify-between items-center px-3 py-1 hover:bg-green-50 transition">
                      <span className="font-semibold text-green-700">
                        {item.hari}
                      </span>
                      <span className="font-medium text-gray-700">
                        {item.jam_masuk} - {item.jam_pulang}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label htmlFor="tugas" className="block text-xs font-bold">
              Keterangan
            </label>
            <p className="text-[10px] text-gray-500 mb-2">
              Isi keterangan jika ada tugas atau catatan tambahan.
            </p>
            <textarea rows="3" id="tugas" name="tugas" value={tugas} className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-vertical" onChange={(e) => setTugas(e.target.value)} />
          </div>

          {/* Tombol Next */}
          <button type="submit" className={`w-full py-2 text-lg font-bold rounded-lg transition-all ${isFormValid() ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} disabled={!isFormValid()}>
            Lanjut
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default AbsenMulai;
