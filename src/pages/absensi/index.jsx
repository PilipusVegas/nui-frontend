import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import AbsenMulai from "./AbsenMulai";
import AbsenSelesai from "./AbsenSelesai";
import DetailAbsen from "./DetailAbsen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faCalendarPlus, faClock, faArrowRight, faSignOutAlt, faCamera, faLocationDot, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { formatTime, formatFullDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Absensi = () => {
  const [isSunday, setIsSunday] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [currentStep, setCurrentStep] = useState(null);
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [permStatus, setPermStatus] = useState({ camera: "unknown", location: "unknown" });
  const [videoStreams, setVideoStreams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const user = getUserFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    const updatePerm = async () => {
      if (!navigator.permissions) {
        setPermStatus({ camera: "unsupported", location: "unsupported" });
        return;
      }
      try {
        const loc = await navigator.permissions.query({ name: "geolocation" });
        const cam = await navigator.permissions.query({ name: "camera" });
        setPermStatus({ camera: cam.state, location: loc.state });

        // listener real-time perubahan izin
        cam.onchange = () => setPermStatus(ps => ({ ...ps, camera: cam.state }));
        loc.onchange = () => setPermStatus(ps => ({ ...ps, location: loc.state }));
      } catch {
        setPermStatus({ camera: "unsupported", location: "unsupported" });
      }
    };
    updatePerm();
  }, []);

  // Trigger permission saat card diklik
  const requestPermission = async (type) => {
    try {
      if (type === "camera") {
        await navigator.mediaDevices.getUserMedia({ video: true });
        toast.success("Izin kamera sudah diberikan");
      } else if (type === "location") {
        await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        );
        toast.success("Izin lokasi sudah diberikan");
      }
      // Setelah sukses, refresh status agar UI langsung berubah
      const loc = await navigator.permissions.query({ name: "geolocation" });
      const cam = await navigator.permissions.query({ name: "camera" });
      setPermStatus({ camera: cam.state, location: loc.state });
    } catch (err) {
      console.error("Gagal meminta izin:", err);
      toast.error(
        type === "camera"
          ? "Akses kamera ditolak"
          : "Akses lokasi ditolak atau timeout"
      );
    }
  };

  useEffect(() => {
    const permissionCheck = async () => {
      const permissionsGranted = await checkPermissions();
      if (permissionsGranted) preloadCameras();
      else setCurrentStep(null);
    };
    permissionCheck();
  }, []);

  const handleNextStepData = (data) => {
    setAttendanceData((prev) => ({ ...prev, ...data }));
    handleNextStep();
  };

  const handleNextStep = () => {
    const steps = isSelesaiFlow ? ["AbsenSelesai", "DetailAbsen"] : ["AbsenMulai", "DetailAbsen"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetchWithJwt(`${apiUrl}/absen/riwayat/${attendanceData.userId}`);
      const data = await response.json();
      if (response.ok) {
        const last24Hours = data.filter((item) => new Date() - new Date(item.jam_mulai) <= 24 * 60 * 60 * 1000);
        setAttendanceHistory(last24Hours.slice(0, 1) || []);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  useEffect(() => {
    const storedUserId = user?.id_user;
    const storedUsername = user?.nama_user;
    if (storedUserId) {
      setAttendanceData((prev) => ({
        ...prev,
        userId: storedUserId,
        username: storedUsername || "",
      }));
    }
  }, []);

  useEffect(() => {
    if (attendanceData.userId) fetchAttendanceHistory();
  }, [attendanceData.userId]);

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/cek/${attendanceData.userId}`);
        const data = await response.json();

        // ✅ Jika API success true → sudah absen
        if (response.ok && data.success === true && data.data) {
          const detail = data.data;
          setAttendanceData({
            userId: String(detail.id_user),
            username: detail.nama || "",
            id_absen: String(detail.id_absen),
            id_lokasi: detail.lokasi || "",
            nama: detail.nama || "",
            shift: detail.shift || "",
            deskripsi: detail.deskripsi || "",
            jam_mulai: detail.jam_mulai ? String(detail.jam_mulai) : null,
            jam_selesai: detail.jam_selesai ? String(detail.jam_selesai) : null,
          });

          // Jika jam_mulai sudah ada, berarti sudah absen masuk
          setIsSelesaiFlow(!!detail.jam_mulai && !detail.jam_selesai);
          setCurrentStep(null);

          console.log("✅ Sudah absen:", detail);
        }

        // ❌ Jika success false → belum absen
        else if (response.ok && data.success === false) {
          setAttendanceData(prev => ({
            ...prev,
            id_absen: "",
            jam_mulai: null,
            jam_selesai: null,
          }));
          setIsSelesaiFlow(false);
          setCurrentStep(null);
          console.log("❌ Belum absen hari ini");
        }

        else {
          console.warn("⚠️ Response tidak sesuai format diharapkan:", data);
          setIsSelesaiFlow(false);
          setCurrentStep(null);
        }
      } catch (error) {
        console.error("Error checking attendance:", error);
        setIsSelesaiFlow(false);
        setCurrentStep(null);
      }
    };

    if (attendanceData.userId) checkAttendance();
  }, [apiUrl, attendanceData.userId]);



  const checkPermissions = async () => {
    try {
      if (!navigator.permissions || !navigator.permissions.query) return true;
      const locationPermission = await navigator.permissions.query({ name: "geolocation" });
      const cameraPermission = await navigator.permissions.query({ name: "camera" });
      const isLocationDenied = locationPermission.state === "denied";
      const isCameraDenied = cameraPermission.state === "denied";
      if (isLocationDenied || isCameraDenied) {
        Swal.fire({
          icon: "error",
          title: "Izin Ditolak Permanen",
          html: `<p>Anda telah menolak akses <b>${isCameraDenied ? "kamera" : ""} ${isCameraDenied && isLocationDenied ? "dan" : ""} ${isLocationDenied ? "lokasi" : ""}</b>.</p>
                <p>Silakan buka <b>Pengaturan Browser</b> → <b>Setelan Situs</b> → <b>Izin</b> dan izinkan kembali akses yang dibutuhkan.</p>`,
          confirmButtonText: "Saya Mengerti",
        });
        return false;
      }

      if (locationPermission.state !== "granted" || cameraPermission.state !== "granted") {
        Swal.fire({
          icon: "warning",
          title: "Perizinan Dibutuhkan",
          text: "Mohon aktifkan GPS dan izinkan akses kamera untuk melanjutkan.",
          confirmButtonText: "OK",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Gagal mengecek permission:", error);
      return false;
    }
  };

  const preloadCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      const streams = {};
      for (const device of videoInputs) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: device.deviceId } } });
        streams[device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear") ? "back" : "front"] = stream;
      }
      setVideoStreams(streams);
      Object.values(streams).forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    } catch (err) {
      console.warn("Preload kamera gagal:", err);
    }
  };

  const handleMulaiClick = async () => {
    if (isSunday) {
      Swal.fire({
        icon: "info",
        title: "Absen Masuk Nonaktif",
        html: `
        <p>Hari ini adalah <b>Minggu</b>, sehingga <b>Absen Masuk</b> tidak tersedia.</p>
        <p>Jika Anda sedang lembur, silakan lakukan <b>pengajuan lembur</b>.</p>
      `,
        confirmButtonText: "Ajukan Lembur",
        showCancelButton: true,
        cancelButtonText: "Tutup",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/lembur");
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      setCurrentStep("AbsenMulai");
    } catch (error) {
      console.error("Izin ditolak:", error);
      Swal.fire({ icon: "error", title: "Akses Ditolak", text: "Mohon izinkan akses kamera dan lokasi di browser Anda." });
    } finally {
      setIsLoading(false);
    }
  };


  const handleSelesaiClick = async () => {
    setIsLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 }));
      setCurrentStep("AbsenSelesai");
    } catch (error) {
      console.error("Izin ditolak:", error);
      Swal.fire({ icon: "error", title: "Akses Ditolak", text: "Mohon izinkan akses kamera dan lokasi di browser Anda." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().getDay();
    const isSundayToday = today === 0; // Minggu = 0
    setIsSunday(isSundayToday);
  }, []);


  const renderStep = () => {
    switch (currentStep) {
      case "AbsenMulai":
        return <AbsenMulai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "AbsenSelesai":
        return <AbsenSelesai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "DetailAbsen":
        return <DetailAbsen formData={attendanceData} />;
      default:
        return (
          <MobileLayout title="Absensi Online">
            <div className="w-full bg-white rounded-2xl p-5 px-1 pt-2 space-y-6">

              {/* === Status Perizinan === */}
              <section>
                <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 w-4 h-4" />
                  Status Perizinan
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {["camera", "location"].map((key) => {
                    const status = permStatus[key];
                    const label = key === "camera" ? "Kamera" : "Lokasi";
                    const icon = key === "camera" ? faCamera : faLocationDot;

                    const styleMap = {
                      granted: "bg-green-50 border-green-400 text-green-700",
                      prompt: "bg-yellow-50 border-yellow-400 text-yellow-700",
                      denied: "bg-red-50 border-red-400 text-red-700",
                      unsupported: "bg-gray-50 border-gray-300 text-gray-500",
                      unknown: "bg-gray-50 border-gray-300 text-gray-500",
                    };

                    const desc = {
                      granted: "Siap digunakan",
                      prompt: "Belum diizinkan",
                      denied: "Ditolak",
                      unsupported: "Tidak didukung",
                      unknown: "Memeriksa…",
                    };

                    return (
                      <div key={key} className={`flex flex-col items-center rounded-lg border px-3 py-2 text-center shadow-sm ${styleMap[status]}`}>
                        <FontAwesomeIcon icon={icon} className="w-5 h-5 mb-1" />
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[11px]">{desc[status]}</p>

                        {(status === "prompt" || status === "denied") && (
                          <button onClick={() => requestPermission(key)} className="mt-1 px-2 py-[2px] text-[11px] font-medium rounded bg-white/70 border border-current hover:bg-white transition">
                            Beri Izin
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* === Riwayat Lembur / Absensi === */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-green-600" />
                    Riwayat Terakhir Absensi
                  </h2>
                  <button onClick={() => navigate("/riwayat-pengguna")} className="text-xs font-medium text-green-700 hover:underline flex items-center gap-1">
                    Lihat Semua
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </button>
                </div>

                {attendanceHistory.length > 0 ? (
                  <ul className="space-y-4">
                    {attendanceHistory.map((item) => {
                      const terlambat = item.keterlambatan > 0;
                      return (
                        <li key={item.id_absen} className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 hover:shadow-md transition">
                          {/* Header: Tanggal & Shift */}
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-gray-800">
                              {formatFullDate(item.jam_mulai)}
                            </p>
                            <p className="text-xs text-gray-800 tracking-wider">{item.nama_shift}</p>
                          </div>

                          <div className="flex items-center gap-3 border-t border-green-200 pt-3 pb-3">
                            <div className="flex flex-col justify-center p-3 bg-green-100 rounded-md">
                              <FontAwesomeIcon icon={faCalendarPlus} className="w-6 h-6 text-green-700" />
                            </div>

                            <div className="flex-1 flex flex-col">
                              <span className="text-[10px] text-gray-800 tracking-wider">Absen Masuk</span>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-green-700">
                                  {formatTime(item.jam_mulai)}
                                </span>
                                {terlambat && (
                                  <span className="text-[8px] text-red-700 font-medium px-1 mt-1 bg-red-100 rounded-sm">
                                    Telat {item.keterlambatan} menit
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                Lokasi: <span className="font-medium text-[10px]">{item.lokasi_absen_mulai || "—"}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 border-t border-gray-300 mt-2 pt-4">
                            <div className="flex flex-col justify-center p-3 rounded-md bg-orange-100">
                              <FontAwesomeIcon icon={faSignOutAlt} className="w-6 h-6 text-orange-600 transform rotate-180" />
                            </div>

                            {/* Teks kanan bersusun */}
                            <div className="flex-1 flex flex-col">
                              <span className="text-[10px] text-gray-800">Absen Pulang</span>
                              <span className="text-sm font-semibold text-orange-600">
                                {item.jam_selesai ? formatTime(item.jam_selesai) : "--:--"}
                              </span>
                              <span className="text-xs text-gray-600">
                                Lokasi:{" "}
                                <span className="font-medium text-[10px]">
                                  {item.lokasi_absen_selesai || (item.jam_selesai ? "—" : "Belum pulang")}
                                </span>
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center text-gray-500">
                    <FontAwesomeIcon icon={faClock} className="text-2xl mb-1" />
                    <p className="text-sm">Belum ada data absensi dalam 24 jam terakhir</p>
                  </div>
                )}
              </section>

              {/* === Tombol Aksi === */}
              <section>
                {!attendanceData.jam_mulai ? (
                  <button disabled={isLoading} onClick={handleMulaiClick} className={`w-full py-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg ${isSunday ? "bg-gray-400 text-white" : "bg-green-600 text-white hover:bg-green-700"}  ${isLoading && "opacity-60 cursor-not-allowed"}`}>
                    <FontAwesomeIcon icon={faCalendarPlus} className="text-2xl" />
                    {isSunday ? "Absen Masuk Nonaktif (Minggu)" : isLoading ? "Memuat…" : "Absen Masuk"}
                  </button>

                ) : !attendanceData.jam_selesai ? (
                  <button disabled={isLoading} onClick={handleSelesaiClick} className={`w-full py-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition bg-orange-500 text-white hover:bg-orange-600 shadow-lg ${isLoading && "opacity-60 cursor-not-allowed"}`}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-2xl" />
                    {isLoading ? "Memuat…" : "Absen Pulang"}
                  </button>
                ) : (
                  <button disabled className="w-full py-5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gray-400 text-white shadow-md cursor-not-allowed">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl" />
                    Sudah Absen
                  </button>
                )}
              </section>
            </div>
          </MobileLayout>
        );
    }
  };

  return <div>{renderStep()}</div>;
};

export default Absensi;