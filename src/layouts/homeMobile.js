import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import {  faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../utils/jwtHelper";
import { initPushNotification } from "../utils/pushNotification";
import { FooterMainBar, HelpMenuCard } from "../components";
import { useAuth } from "../hooks/useAuth";
import { formatTime } from "../utils/dateUtils";
import { HomeHero, MainMenuCard, TaskSection } from "../components";

const HomeMobile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [attendanceData, setAttendanceData] = useState(null);
  const [tripStatus, setTripStatus] = useState({ status_kendaraan: false, user_lokasi: false, });
  const [loadingTripStatus, setLoadingTripStatus] = useState(true);
  const isTripReady = tripStatus.status_kendaraan && tripStatus.user_lokasi;
  const [activityStatus, setActivityStatus] = useState(null);
  const [loadingActivityStatus, setLoadingActivityStatus] = useState(true);

  useEffect(() => {
    const idUser = user?.id_user;
    const fetchAttendance = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/cek/${idUser}`);
        if (response.status === 404) {
          setAttendanceData(null); 
          return;
        }
        const json = await response.json();
        if (json.success && json.data) {
          setAttendanceData(json.data);
        }
      } catch (error) {
        console.error("Fetch attendance error:", error);
      }
    };
    if (idUser) fetchAttendance();
  }, [apiUrl, user?.id_user]);


  useEffect(() => {
    const fetchTripStatus = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/trip/user`);
        if (!res.ok) throw new Error("Gagal memuat status kunjungan");
        const json = await res.json();
        setTripStatus({
          status_kendaraan: json.data?.status_kendaraan === true,
          user_lokasi: json.data?.user_lokasi === true,
        });
      } catch (err) {
        console.error("Fetch trip status error:", err);
      } finally {
        setLoadingTripStatus(false);
      }
    };
    fetchTripStatus();
  }, [apiUrl]);

  useEffect(() => {
    const fetchActivityStatus = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/home/status`);

        if (res.status === 404) {
          setActivityStatus(null);
          return;
        }

        if (!res.ok) {
          throw new Error("Gagal memuat status aktivitas");
        }

        const json = await res.json();
        const status = json.data?.activity_status || null;

        const allowedStatus = ["dinas", "lembur", "kunjungan"];

        if (allowedStatus.includes(status)) {
          setActivityStatus(status);
        } else {
          setActivityStatus(null);
        }
      } catch (err) {
        console.error("Fetch activity status error:", err);
        setActivityStatus(null);
      } finally {
        setLoadingActivityStatus(false);
      }
    };

    fetchActivityStatus();
  }, [apiUrl]);



  useEffect(() => {
    if (!user?.id_user) return;

    const handleNotificationPermission = async () => {
      // Browser tidak support notification
      if (!("Notification" in window)) {
        Swal.fire({
          icon: "error",
          title: "Browser Tidak Mendukung",
          text: "Browser Anda tidak mendukung fitur notifikasi. Silakan gunakan browser terbaru atau gunakan browser lain yang mendukung notifikasi.",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        return;
      }

      const permission = Notification.permission;

      /* SUDAH DIIZINKAN */
      if (permission === "granted") {
        try {
          await initPushNotification(user.id_user);
        } catch (err) {
          console.error("Init push notification failed:", err);
        }
        return;
      }

      /* PERNAH DITOLAK (DENIED) */
      if (permission === "denied") {
        await Swal.fire({
          icon: "error",
          title: "Notifikasi Dinonaktifkan",
          html: `
          <div style="text-align:left; font-size:14px; line-height:1.6;">
            <p>
              Aplikasi ini <strong>mewajibkan notifikasi aktif</strong>
              untuk memastikan seluruh informasi penting dapat diterima
              secara real-time.
            </p>
            <p>
              Saat ini notifikasi <strong>dinonaktifkan</strong>
              pada pengaturan browser Anda.
            </p>
            <p>
              Silakan aktifkan notifikasi secara manual melalui
              pengaturan browser sebelum melanjutkan penggunaan aplikasi.
            </p>
          </div>
        `,
          confirmButtonText: "Saya Mengerti",
          confirmButtonColor: "#dc2626",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        return;
      }

      /* BELUM MENENTUKAN (DEFAULT) */
      if (permission === "default") {
        const result = await Swal.fire({
          icon: "warning",
          title: "Aktifkan Notifikasi",
          html: `
          <div style="text-align:left; font-size:14px; line-height:1.6;">
            <p>
              Untuk menggunakan aplikasi ini, notifikasi harus diaktifkan.
            </p>
            <p>
              Notifikasi memastikan Anda menerima informasi penting
              secara otomatis dan tepat waktu.
            </p>
            <p>
              Tanpa notifikasi aktif, sistem tidak dapat menjamin
              penyampaian informasi terkait pekerjaan Anda.
            </p>
          </div>
        `,
          confirmButtonText: "Aktifkan Sekarang",
          confirmButtonColor: "#16a34a",
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        if (result.isConfirmed) {
          const newPermission = await Notification.requestPermission();
          if (newPermission === "granted") {
            await initPushNotification(user.id_user);
            await Swal.fire({
              icon: "success",
              title: "Notifikasi Aktif",
              text: "Notifikasi berhasil diaktifkan. Anda akan menerima informasi penting secara otomatis.",
              confirmButtonColor: "#16a34a",
            });
          } else {
            // Dipaksa ulang → tidak bisa lanjut tanpa izin
            window.location.reload();
          }
        }
      }
    };

    handleNotificationPermission();
  }, [user?.id_user]);

  const confirmLogout = () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Terima kasih atas kerja keras Anda!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };


  return (
    <div className="flex flex-col font-sans bg-gray-50 min-h-screen pb-40">
      <HomeHero user={user} onLogout={confirmLogout} activityStatus={loadingActivityStatus ? null : activityStatus} />

      {attendanceData && (
        <div className="relative z-20 scale-95">
          <div className="px-4 -mt-14">
            <div
              onClick={() => navigate("/riwayat-pengguna")}
              className="bg-white shadow-md rounded-2xl p-2 border border-gray-200 cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-green-400 active:scale-[0.98] transition-all duration-300"
            >
              <div className="flex items-start">

                {/* Tanggal */}
                <div className="flex flex-col items-center min-w-[72px]">
                  <div className="bg-green-500 text-white rounded-xl py-2 px-3 text-center w-full">
                    <div className="text-[11px] font-medium opacity-90 tracking-wider">
                      {attendanceData.jam_mulai
                        ? new Date(attendanceData.jam_mulai).toLocaleDateString("id-ID", {
                          weekday: "long",
                        })
                        : "-"}
                    </div>

                    <div className="text-2xl font-extrabold leading-none">
                      {attendanceData.jam_mulai
                        ? new Date(attendanceData.jam_mulai).getDate()
                        : "-"}
                    </div>

                    <div className="text-[11px] font-medium opacity-90 tracking-wide">
                      {attendanceData.jam_mulai
                        ? new Date(attendanceData.jam_mulai).toLocaleDateString("id-ID", {
                          month: "long",
                        })
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* Info Absensi */}
                <div className="flex-1 grid gap-2">
                  <div className="grid grid-cols-2 text-center text-sm overflow-hidden">

                    {/* Absen Masuk */}
                    <div className="border-r border-gray-300 flex flex-col items-center">
                      <div className="text-[10px] text-gray-600 mb-1">
                        Absen Masuk
                      </div>

                      <div className="text-base font-semibold text-gray-800">
                        {attendanceData.jam_mulai
                          ? formatTime(attendanceData.jam_mulai)
                          : "-"}
                      </div>

                      {attendanceData.lokasi_mulai && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-[8px] text-gray-700 font-medium text-center px-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-green-600 text-[10px] shrink-0"
                          />

                          <span
                            className="truncate max-w-[90px] text-left"
                            title={attendanceData.lokasi_mulai}
                          >
                            {attendanceData.lokasi_mulai}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Absen Pulang */}
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-gray-600 mb-1">
                        Absen Pulang
                      </div>

                      <div
                        className={`text-base font-semibold ${attendanceData.jam_selesai
                          ? "text-gray-800"
                          : "text-gray-400"
                          }`}
                      >
                        {attendanceData.jam_selesai
                          ? formatTime(attendanceData.jam_selesai)
                          : "-"}
                      </div>

                      {attendanceData.jam_selesai && attendanceData.lokasi_selesai && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-[8px] text-gray-700 font-medium text-center px-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-green-600 text-[10px] shrink-0"
                          />

                          <span className="truncate max-w-[90px] text-left" title={attendanceData.lokasi_selesai}>
                            {attendanceData.lokasi_selesai}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENU UTAMA */}
      <div className="bg-[#f5f7f6]">
        <MainMenuCard
          user={user}
          isTripReady={isTripReady}
          loadingTripStatus={loadingTripStatus}
        />

        <TaskSection />

        <HelpMenuCard />

      </div>

      <FooterMainBar />
    </div>
  );
};

export default HomeMobile;