import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../utils/jwtHelper";
import { initPushNotification } from "../utils/pushNotification";
import {
  FooterMainBar,
  HelpMenuCard,
  HomeHero,
  MainMenuCard,
  TaskSection,
} from "../components";
import { useAuth } from "../hooks/useAuth";

const HomeMobile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [attendanceData, setAttendanceData] = useState(null);
  const [tripStatus, setTripStatus] = useState({
    status_kendaraan: false,
    user_lokasi: false,
  });
  const [loadingTripStatus, setLoadingTripStatus] = useState(true);

  const isTripReady = tripStatus.status_kendaraan && tripStatus.user_lokasi;

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
        } else {
          setAttendanceData(null);
        }
      } catch (error) {
        console.error("Fetch attendance error:", error);
        setAttendanceData(null);
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
    if (!user?.id_user) return;

    const handleNotificationPermission = async () => {
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

      if (permission === "granted") {
        try {
          await initPushNotification(user.id_user);
        } catch (err) {
          console.error("Init push notification failed:", err);
        }
        return;
      }

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
    <div className="flex flex-col font-sans bg-slate-100 min-h-screen pb-20">
      <HomeHero user={user} onLogout={confirmLogout} attendanceData={attendanceData}/>
      <div className="bg-slate-100">
        <MainMenuCard user={user} isTripReady={isTripReady} loadingTripStatus={loadingTripStatus}/>
        <TaskSection />
        <HelpMenuCard />
      </div>
      <FooterMainBar />
    </div>
  );
};

export default HomeMobile;
