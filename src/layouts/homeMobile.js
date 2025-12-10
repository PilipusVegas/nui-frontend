import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { faCalendarCheck, faBell, faHistory, faSignOutAlt, faMapMarkerAlt, faPenFancy, faPeopleGroup, faClockFour, faTasks, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../utils/jwtHelper";
import { FooterMainBar, TaskCardSlider } from "../components";

const HomeMobile = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    const idUser = user?.id_user;
    const fetchAttendance = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/riwayat/${idUser}`);
        if (!response.ok) throw new Error("Failed to fetch attendance data");

        const json = await response.json();
        console.log("RIWAYAT ABSEN:", json);

        // Pastikan selalu array
        setAttendanceData(Array.isArray(json.data) ? json.data : []);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    if (idUser) fetchAttendance();
  }, [apiUrl]);

  const handleNotificationClick = () => {
    navigate("/notification");
    setHasNewNotifications(false);
  };

  const MainMenuButton = ({ icon, image, label, onClick, color, hasNotification }) => (
    <button onClick={onClick} aria-label={label} className="flex flex-col items-center justify-center mb-1 py-2 px-4 relative transition-all duration-300 rounded-full hover:text-green-900 px-2">
      <div className="relative">
        {icon && <FontAwesomeIcon icon={icon} className={`text-lg ${color}`} />}
        {image && (
          <div className={`p-3 rounded-lg ${color}`}>
            <img src={image} alt={label} className="w-8 h-8 object-contain mx-auto" />
          </div>
        )}
        {hasNotification && (
          <>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
          </>
        )}
      </div>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </button>
  );

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const confirmLogout = () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Terimakasih atas kerja keras anda! Tetap semangat",
      icon: "question",
      cancelButtonText: "Batal",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      confirmButtonColor: "#3085d6",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
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
        <span className="text-sm font-semibold pl-3">Menu Utama</span>
      </div>
      <div className="grid grid-cols-4 gap-2 px-3">
        <MainMenuButton icon={faCalendarCheck} label="Absen" onClick={() => navigate("/absensi")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-emerald-600 hover:scale-105 transition" />
        <MainMenuButton icon={faClockFour} label="Lembur" onClick={() => navigate("/lembur")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-teal-600 hover:scale-105 transition" />
        <MainMenuButton icon={faPenFancy} label="Dinas" onClick={() => navigate("/formulir-dinas-aplikasi")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-blue-600 hover:scale-105 transition" />
        <MainMenuButton icon={faTasks} label="Tugas" onClick={() => navigate("/tugas")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-lime-600 hover:scale-105 transition" />
        <MainMenuButton icon={faBell} label="Notifikasi" onClick={handleNotificationClick} hasNotification={hasNewNotifications} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-amber-600 hover:scale-105 transition" />
        <MainMenuButton icon={faHistory} label="Riwayat" onClick={() => navigate("/riwayat-pengguna")} color="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-200 text-xl text-indigo-600 hover:scale-105 transition" />
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