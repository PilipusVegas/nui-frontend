import { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import AbsenMulai from "./AbsenMulai";
import AbsenSelesai from "./AbsenSelesai";
import DetailAbsen from "./DetailAbsen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faCalendarPlus, faClock, faArrowRight, faSignOutAlt, faCamera, faShieldAlt, faCheckToSlot, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { formatTime, formatFullDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Absensi = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [isSunday, setIsSunday] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [permissionReady, setPermissionReady] = useState(false);
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(true);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });
  const [isAppReady, setIsAppReady] = useState(false);
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [apiErrorMessage, setApiErrorMessage] = useState("");


  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const cam = await navigator.permissions.query({ name: "camera" });
        const geo = await navigator.permissions.query({ name: "geolocation" });
        if (cam.state === "granted" && geo.state === "granted") {
          setPermissionReady(true);
        }
      } catch (e) {
        // browser lama → abaikan
      }
    };

    checkPermissionStatus();
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
    const checkAttendance = async () => {
      setIsCheckingAttendance(true);
      setIsAppReady(false);
      setApiErrorMessage("");

      try {
        const response = await fetchWithJwt(
          `${apiUrl}/absen/cek/${attendanceData.userId}`
        );

        // 🔑 KHUSUS 404 → absensi memang kosong
        if (response.status === 404) {
          setAttendanceData(prev => ({
            ...prev,
            id_absen: "",
            jam_mulai: null,
            jam_selesai: null,
          }));

          setIsSelesaiFlow(false);
          setIsAppReady(true); // ⬅️ PENTING
          return;
        }

        const data = await response.json();

        // 🔴 error sungguhan
        if (!response.ok) {
          throw new Error(data?.message || "Server bermasalah");
        }

        if (data.success && data.data) {
          const detail = data.data;
          setAttendanceToday(detail);
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
            total_tugas_urgent: detail.total_tugas_urgent || 0,
          });

          setIsSelesaiFlow(!!detail.jam_mulai && !detail.jam_selesai);
        }

        setIsAppReady(true);

      } catch (error) {
        console.error("Check attendance error:", error);

        setApiErrorMessage(error.message);
        toast.error(error.message || "Gagal memuat data absensi");

        setIsAppReady(false);
        setIsSelesaiFlow(false);
        setCurrentStep(null);

      } finally {
        setIsCheckingAttendance(false);
      }
    };

    if (attendanceData.userId) checkAttendance();
  }, [apiUrl, attendanceData.userId]);


  const checkCameraAndLocation = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        })
      );

      return true;
    } catch (err) {
      console.error("Permission error:", err);
      return false;
    }
  };

  const handlePermissionInfoClick = async () => {
    if (permissionReady) return;
    const ok = await checkCameraAndLocation();
    if (ok) {
      setPermissionReady(true);
      toast.success("Kamera dan lokasi siap digunakan");
    } else {
      toast.error("Mohon izinkan akses kamera dan lokasi untuk melanjutkan absensi.");
    }
  };


  const handleMulaiClick = async () => {
    if (isSunday) return;
    setIsLoading(true);
    if (!permissionReady) {
      const ok = await checkCameraAndLocation();
      if (!ok) {
        setIsLoading(false);
        toast.error("Mohon izinkan kamera dan lokasi.");
        return;
      }
      setPermissionReady(true);
    }

    setIsLoading(false);
    setCurrentStep("AbsenMulai");
  };


  const handleSelesaiClick = async () => {
    if (attendanceData.total_tugas_urgent > 0) return;
    setIsLoading(true);
    if (!permissionReady) {
      const ok = await checkCameraAndLocation();
      if (!ok) {
        setIsLoading(false);
        toast.error("Mohon izinkan kamera dan lokasi.");
        return;
      }
      setPermissionReady(true);
    }
    setIsLoading(false);
    setCurrentStep("AbsenSelesai");
  };

  useEffect(() => {
    const today = new Date().getDay();
    const isSundayToday = today === 0;
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
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-600" />
                  Informasi Perizinan
                </h2>

                <button onClick={handlePermissionInfoClick} className={` w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${permissionReady ? "bg-emerald-50 border-emerald-400 text-emerald-800" : "bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100"}`}>
                  <FontAwesomeIcon icon={permissionReady ? faCheckToSlot : faCamera} className="text-xl shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      {permissionReady ? "Kamera & lokasi siap digunakan" : "Klik untuk izinkan kamera & lokasi"}
                    </p>
                    <p className="text-xs">
                      {permissionReady ? "Silakan Lanjutkan Absensi" : "Izin diperlukan untuk absensi"}
                    </p>
                  </div>
                </button>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-emerald-600" />
                    Riwayat Absensi Terakhir
                  </h2>

                  <button onClick={() => navigate("/riwayat-pengguna")} className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                    Lihat Semua
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                  </button>
                </div>

                {attendanceToday ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>{formatFullDate(attendanceToday.tanggal_absen)}</span>
                      <span className="text-emerald-700">{attendanceToday.shift || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-emerald-500 bg-emerald-50 p-3">
                      <FontAwesomeIcon icon={faCalendarPlus} className="text-emerald-700 mt-1 p-1 text-3xl" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-800">
                          Absen Masuk
                        </p>
                        {attendanceToday.jam_mulai ? (
                          <span className="text-sm font-bold text-emerald-800 block mt-1">
                            {formatTime(attendanceToday.jam_mulai)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 mt-1 block">
                            Belum absen masuk
                          </span>
                        )}
                        <p className="text-[11px] text-gray-600 mt-1">
                          <FontAwesomeIcon icon={faLocationDot} className="text-[10px] text-green-800" />{" "}
                          <span className="font-medium text-gray-700">
                            {attendanceToday.lokasi || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-orange-500 bg-orange-50 p-3">
                      <FontAwesomeIcon icon={faSignOutAlt} className="text-orange-700 rotate-180 mt-1 p-1 text-3xl" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-orange-800">
                          Absen Pulang
                        </p>
                        {attendanceToday.jam_selesai ? (
                          <span className="text-sm font-bold text-orange-800 block mt-1">
                            {formatTime(attendanceToday.jam_selesai)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 block mt-1">
                            Belum absen pulang
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-400">
                    <FontAwesomeIcon icon={faClock} className="text-2xl mb-2" />
                    <p className="text-sm">Belum ada absensi hari ini</p>
                  </div>
                )}
              </section>

              <section>
                {isCheckingAttendance ? (
                  <button disabled className="w-full py-5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gray-300 text-gray-600 shadow-md cursor-not-allowed">
                    <FontAwesomeIcon icon={faClock} className="text-2xl animate-spin" />
                    Memeriksa Kehadiran…
                  </button>
                ) : !attendanceData.jam_mulai ? (
                  <button disabled={!isAppReady || isLoading || isSunday} onClick={handleMulaiClick} className={` w-full py-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg ${!isAppReady || isSunday ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}>
                    <FontAwesomeIcon icon={faCalendarPlus} className="text-2xl" />
                    {!isAppReady ? "Menunggu Data Absensi…" : isSunday ? "Absen Nonaktif (Minggu)" : "Absen Masuk"}
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