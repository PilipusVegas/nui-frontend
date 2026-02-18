import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { faCalendarCheck, faHistory, faSignOutAlt, faMapMarkerAlt, faPenFancy, faPeopleGroup, faClockFour, faTasks, faMotorcycle, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../utils/jwtHelper";
import { initPushNotification } from "../utils/pushNotification";
import { FooterMainBar, TaskCardSlider } from "../components";
import { useAuth } from "../hooks/useAuth";
import { formatTime } from "../utils/dateUtils";

const HomeMobile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isLeader = user?.is_leader === true;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const user = getUserFromToken();
    const idUser = user?.id_user;
    const fetchAttendance = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/riwayat/user/${idUser}`);
        if (!response.ok) throw new Error("Failed to fetch attendance data");
        const json = await response.json();
        setAttendanceData(Array.isArray(json.data) ? json.data : []);
      } catch (error) {
      }
    };

    if (idUser) fetchAttendance();
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


  const MainMenuButton = ({ icon, image, label, onClick, color, hasNotification }) => (
    <div className="flex flex-col items-center justify-center mb-2">
      <div onClick={onClick} className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95">
        {icon && (
          <div className={`${color} p-4 px-5 rounded-xl`}>
            <FontAwesomeIcon icon={icon} className="text-xl" />
          </div>
        )}

        {image && (
          <div className={`${color} p-3 rounded-lg`}>
            <img src={image} alt={label} className="w-8 h-8 object-contain" />
          </div>
        )}

        {hasNotification && (
          <>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
          </>
        )}
      </div>
      <span className="mt-1 text-[11px] font-medium text-gray-700 select-none tracking-wide">
        {label}
      </span>
    </div>
  );

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
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-b-6xl px-8 pb-12 pt-4 relative shadow-xl z-10">
        <button onClick={confirmLogout} title="Logout" className="absolute top-3 right-3 text-xl text-red-500 hover:bg-white hover:text-red-600 transition-colors px-2 py-1 rounded-md bg-white/70">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
        <div className="flex flex-col py-5">
          <h2 className="text-sm font-medium text-white/90 tracking-wide">Selamat Bekerja,</h2>
          <div className="text-2xl font-bold text-white drop-shadow-sm mb-2">
            {user?.nama_user || "User"}
          </div>
          <div className="text-sm text-white font-semibold inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg w-fit shadow-sm">
            <FontAwesomeIcon icon={faPeopleGroup} className="text-white/90" />
            {user?.role || "N/A"}
          </div>
        </div>
      </div>

      {attendanceData.length > 0 && (
        <div className="relative z-20 scale-95">
          <div className="px-4 -mt-14">
            <div onClick={() => navigate("/riwayat-pengguna")} className="bg-white shadow-md rounded-2xl p-2 border border-gray-200 cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-green-400 active:scale-[0.98] transition-all duration-300">
              <div className="flex items-start">
                <div className="flex flex-col items-center min-w-[72px]">
                  <div className="bg-green-500 text-white rounded-xl py-2 px-3 text-center w-full">
                    <div className="text-[11px] font-medium opacity-90 tracking-wider">
                      {new Date(attendanceData[0].jam_mulai).toLocaleDateString("id-ID", { weekday: "long" })}
                    </div>
                    <div className="text-2xl font-extrabold leading-none">
                      {new Date(attendanceData[0].jam_mulai).getDate()}
                    </div>
                    <div className="text-[11px] font-medium opacity-90 tracking-wide">
                      {new Date(attendanceData[0].jam_mulai).toLocaleDateString("id-ID", { month: "long" })}
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid gap-2">
                  <div className="grid grid-cols-2 text-center text-sm overflow-hidden">
                    <div className="border-r border-gray-300 flex flex-col items-center">
                      <div className="text-[10px] text-gray-600 mb-1">Absen Masuk</div>
                      <div className="text-base font-semibold text-gray-800">{formatTime(attendanceData[0].jam_mulai)}</div>
                      {attendanceData[0].lokasi_absen_mulai && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-[8px] text-gray-700 font-medium text-center px-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 text-[10px] shrink-0" />
                          <span className="truncate max-w-[90px] text-left" title={attendanceData[0].lokasi_absen_mulai}>
                            {attendanceData[0].lokasi_absen_mulai}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-gray-600 mb-1">Absen Pulang</div>
                      <div className={`text-base font-semibold ${attendanceData[0].jam_selesai ? "text-gray-800" : "text-gray-400"}`}>
                        {attendanceData[0].jam_selesai ? formatTime(attendanceData[0].jam_selesai) : "-"}
                      </div>
                      {attendanceData[0].lokasi_absen_selesai && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-[8px] text-gray-700 font-medium text-center px-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 text-[10px] shrink-0" />
                          <span className="truncate max-w-[90px] text-left" title={attendanceData[0].lokasi_absen_selesai}>
                            {attendanceData[0].lokasi_absen_selesai}
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
      <div className="flex flex-row items-center p-1 mt-3">
        <span className="text-sm font-semibold pl-3 pb-3">Menu Utama</span>
      </div>
      <div className="grid grid-cols-4 gap-2 px-3">
        <MainMenuButton icon={faCalendarCheck} label="Absensi" onClick={() => navigate("/absensi")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-emerald-600 hover:scale-105 transition" />
        {user?.is_leader && (
          <MainMenuButton icon={faPeopleGroup} label="Absensi Tim" onClick={() => navigate("/absensi-tim")}color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-orange-600 hover:scale-105 transition"/>
        )}
        <MainMenuButton icon={faClockFour} label="Lembur" onClick={() => navigate("/lembur")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-teal-600 hover:scale-105 transition" />
        <MainMenuButton icon={faPenFancy} label="Dinas" onClick={() => navigate("/formulir-dinas-aplikasi")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-blue-600 hover:scale-105 transition" />
        <MainMenuButton icon={faTasks} label="Tugas" onClick={() => navigate("/tugas")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-lime-600 hover:scale-105 transition" />
        {/* {allowedKunjunganRoles.includes(user?.id_role) && (
          <MainMenuButton icon={faMotorcycle} label="Kunjungan" onClick={() => navigate("/kunjungan")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-indigo-600 hover:scale-105 transition" />
        )} */}

        {/* <MainMenuButton icon={faHistory} label="Riwayat" onClick={() => navigate("/riwayat-pengguna")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-indigo-600 hover:scale-105 transition" /> */}
        <MainMenuButton image="/NOS.png" label="NOS" onClick={() => window.open("https://nos.nicourbanindonesia.com/mypanel/maintenance", "_blank")} color="rounded-xl bg-gradient-to-br from-green-50 to-green-200 hover:scale-105 transition" />
        {/* <MainMenuButton icon={faClipboardList} label="Cuti" onClick={() => navigate("/cuti")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-indigo-600 hover:scale-105 transition" /> */}
        {/* <MainMenuButton icon={faThList} label="Lainnya" onClick={() => navigate("/menu")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-teal-600 hover:scale-105 transition" /> */}
      </div>

      <TaskCardSlider />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold">Menu Bantuan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-green-500 hover:scale-[1.01] transition-all duration-300 cursor-pointer" onClick={() => window.open("https://wa.me/628980128222", "_blank")}>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 text-2xl group-hover:animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Hubungi</span>
              <span className="font-semibold text-gray-800">Team IT</span>
            </div>
          </div>
          <div className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-green-500 hover:scale-[1.01] transition-all duration-300 cursor-pointer" onClick={() => window.open("https://wa.me/6282181525235 ", "_blank")}>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 text-2xl group-hover:animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Hubungi</span>
              <span className="font-semibold text-gray-800">HRD Office</span>
            </div>
          </div>
        </div>
      </div>
      <FooterMainBar />
    </div>
  );
};

export default HomeMobile;