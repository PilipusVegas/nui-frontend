import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { faCalendarCheck, faClock, faBell, faHistory, faThList, faHome, faUser, faSignOutAlt, faQuestionCircle, faMapMarkerAlt, faArrowRight, faPenFancy, faPeopleGroup, faPowerOff, faSign, faSignOut, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../utils/jwtHelper";

const HomeMobile = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attendanceData, setAttendanceData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const [loading, setLoading] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    const idUser = user?.id_user;
    if (idUser) {
      const fetchNotifications = async () => {
        try {
          setLoading(true);
          const response = await fetchWithJwt(`${apiUrl}/notif/user/${idUser}`, {
            headers: { "Cache-Control": "no-cache" },
          });
          if (!response.ok) {
            throw new Error("Gagal mengambil data notifikasi");
          }
          const data = await response.json();
          const unreadNotifications = data?.data?.some((notif) => notif.is_read === 0);
          setHasNewNotifications(unreadNotifications);
        } catch (error) {
          console.error("Terjadi kesalahan:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    } else {
      setLoading(false);
    }
    return () => {
      setLoading(false);
    };
  }, [apiUrl]);

  useEffect(() => {
    const user = getUserFromToken();
    const idUser = user?.id_user;
    const fetchAttendance = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/riwayat/${idUser}`);
        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }
        const data = await response.json();
        setAttendanceData(data);
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

  const FooterMenuButton = ({ icon, label, onClick, isActive }) => (
    <button onClick={onClick} className="group relative flex flex-col items-center justify-center text-white transition-all duration-300 px-3">
      {/* Background putih */}
      <div className={`absolute w-9 h-9 rounded-full transition-all duration-300 ease-in-out z-0 ${isActive ? "bg-white scale-125 -translate-y-8 border-2 border-green-700/90" : "scale-0"}`}></div>
      {/* Icon */}
      <div className={`relative z-10 flex items-center justify-center w-8 h-8 text-lg transition-all duration-300 ease-in-out ${isActive ? "text-green-600 -translate-y-5 group-hover:text-green-800" : "text-[9px] text-white/80 group-hover:text-white"}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      {/* Label selalu muncul */}
      <span className={`relative z-10 text-[10px] font-medium mt-2 tracking-widest transition-all duration-300 ${isActive ? "-translate-y-5 text-white" : "-translate-y-2 text-white/80 group-hover:text-white text-[9px]"}`}>
        {label}
      </span>
    </button>
  );

  const calculateTotalHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

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
    <div className="flex flex-col font-sans bg-gray-50 min-h-screen">
      {/* Header Hero */}
      <div className="bg-gradient-to-br from-green-500 to-green-800 rounded-b-6xl px-8 pb-12 pt-4 relative shadow-xl z-10">
        <button onClick={confirmLogout} title="Logout" className="absolute top-3 right-3 text-xl text-red-500 hover:bg-white hover:text-red-700 transition-colors px-2 py-1 rounded-full">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
        <div className="flex flex-col py-5">
          <h2 className="text-sm font-medium text-white/90 tracking-wide">Selamat Bekerja,</h2>
          <div className="text-3xl font-bold text-white drop-shadow-sm mb-2">
            {user?.nama_user || "User"}
          </div>
          <div className="text-sm text-white font-semibold inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg w-fit shadow-sm">
            <FontAwesomeIcon icon={faPeopleGroup} className="text-white/90" />
            {user?.role || "N/A"}
          </div>
        </div>
      </div>

      {/* === Absen Terbaru (floating center) === */}
      {attendanceData.length > 0 && (
        <div className="relative z-20 scale-90">
          <div className="px-4 -mt-14">
            <div onClick={() => navigate("/riwayat-absensi")} className="bg-gradient-to-br from-[#e8fdf2] via-white to-[#dcfce7] shadow-lg rounded-2xl p-2 border border-gray-200 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-green-400 active:scale-[0.98] transition-all duration-300">
              <div className="flex items-center justify-between">
                {/* === Kartu Tanggal === */}
                <div className="flex flex-col items-center bg-gradient-to-br from-green-400 to-green-600 py-3 px-4 rounded-xl shadow-md text-white min-w-[72px]">
                  <span className="text-[11px] font-medium opacity-90 tracking-wider">
                    {new Date(attendanceData[0].jam_mulai).toLocaleDateString("id-ID", {
                      weekday: "long",
                    })}
                  </span>
                  <span className="text-3xl font-extrabold leading-none drop-shadow-md">
                    {new Date(attendanceData[0].jam_mulai).getDate()}
                  </span>
                  <span className="text-[11px] font-medium opacity-90 tracking-wide">
                    {new Date(attendanceData[0].jam_mulai).toLocaleDateString("id-ID", {
                      month: "long",
                    })}
                  </span>
                </div>

                {/* === Informasi Waktu & Lokasi === */}
                <div className="flex-1 grid gap-4">
                  <div className="grid grid-cols-3 text-center text-sm">
                    <div className="border-r border-gray-300">
                      <div className="text-base font-semibold text-gray-800">{formatTime(attendanceData[0].jam_mulai)}</div>
                      <div className="text-[10px] text-gray-500">Absen Masuk</div>
                    </div>
                    <div className="border-r border-gray-300">
                      <div className="text-base font-semibold text-gray-800">
                        {attendanceData[0].jam_selesai ? formatTime(attendanceData[0].jam_selesai) : "-"}
                      </div>
                      <div className="text-[10px] text-gray-500">Absen Pulang</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-green-700">
                        {attendanceData[0].jam_selesai ? calculateTotalHours(attendanceData[0].jam_mulai, attendanceData[0].jam_selesai) : "-"}
                      </div>
                      <div className="text-[11px] text-gray-500">Total Jam</div>
                    </div>
                  </div>

                  {/* === Lokasi === */}
                  <div className="text-[11px] text-gray-600 text-center tracking-wide font-medium">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-green-600" />
                    {attendanceData[0].lokasi_absen || "No location provided"}
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
      <div className="grid grid-cols-4 gap-2 px-4">
        <MainMenuButton icon={faCalendarCheck} label="Absen" onClick={() => navigate("/absensi")} color="p-4 rounded-lg bg-green-100 text-xl text-emerald-500" />
        <MainMenuButton icon={faClock} label="Lembur" onClick={() => navigate("/lembur")} color="p-4 rounded-lg bg-green-100 text-xl text-teal-500" />
        <MainMenuButton icon={faPenFancy} label="e-Form" onClick={() => navigate("/form")} color="p-4 rounded-lg bg-green-100 text-xl text-blue-500" />
        <MainMenuButton icon={faBell} label="Notifikasi" onClick={handleNotificationClick} hasNotification={hasNewNotifications} color="p-4 rounded-lg bg-green-100 text-xl text-amber-600" />
        <MainMenuButton icon={faHistory} label="Riwayat" onClick={() => navigate("/riwayat-absensi")} color="p-4 rounded-lg bg-green-100 text-xl text-indigo-600" />
        <MainMenuButton icon={faThList} label="Lainnya" onClick={() => navigate("/menu")} color="p-4 rounded-lg bg-green-100 text-xl text-teal-600" />
        <MainMenuButton image="/NOS.png" label="NOS" onClick={() => window.open("https://nos.nicourbanindonesia.com/mypanel/maintenance", "_blank")} color="bg-green-100" />
      </div>
      {/* MENU UTAMA */}

      {/* === RIWAYAT ABSENSI === */}
      {attendanceData.length > 1 && (
        <div className="px-4 mt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-sm font-semibold">Riwayat Absensi</h2>
            </div>
            <button onClick={() => navigate("/riwayat-absensi")} className="text-sm text-green-600 hover:text-green-800 hover:underline transition">
              See more <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          <div className="grid gap-3">
            {attendanceData.slice(1, 4).map((item) => (
              <div key={item.id_absen} className="bg-gradient-to-br from-[#e8fdf2] via-white to-[#dcfce7] shadow-lg rounded-2xl p-2 border border-gray-200 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-green-400 active:scale-[0.98] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center bg-gradient-to-br from-green-400 to-green-600 py-3 px-4 rounded-xl shadow-md text-white min-w-[72px]">
                  <span className="text-[11px] font-medium opacity-90 tracking-wider">
                    {new Date(item.jam_mulai).toLocaleDateString("id-ID", {
                      weekday: "long",
                    })}
                  </span>
                  <span className="text-3xl font-extrabold leading-none drop-shadow-md">
                    {new Date(item.jam_mulai).getDate()}
                  </span>
                  <span className="text-[11px] font-medium opacity-90 tracking-wide">
                    {new Date(item.jam_mulai).toLocaleDateString("id-ID", {
                      month: "long",
                    })}
                  </span>
                </div>
                  <div className="flex-1 ml-4 grid gap-2">
                    <div className="grid grid-cols-3 text-center">
                      <div className="border-r">
                        <div className="text-md font-semibold text-gray-800">
                          {formatTime(item.jam_mulai)}
                        </div>
                        <div className="text-[10px] text-gray-500">Absen Masuk</div>
                      </div>
                      <div className="border-r">
                        <div className="text-md font-semibold text-gray-800">
                          {item.jam_selesai ? formatTime(item.jam_selesai) : "-"}
                        </div>
                        <div className="text-[10px] text-gray-500">Absen Pulang</div>
                      </div>
                      <div>
                        <div className="text-md font-semibold text-green-700">
                          {item.jam_selesai ? calculateTotalHours(item.jam_mulai, item.jam_selesai) : "-"}
                        </div>
                        <div className="text-xs text-gray-500">Total Jam</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-green-600" />
                      {item.lokasi_absen || "No location provided"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MENU BANTUAN === */}
      <div className="px-4 pt-4 pb-40">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold">Bantuan</span>
          <FontAwesomeIcon icon={faQuestionCircle} className="text-green-600 text-base" />
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

          <div className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-green-500 hover:scale-[1.01] transition-all duration-300 cursor-pointer" onClick={() => window.open("https://wa.me/6287819999599", "_blank")}>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 text-2xl group-hover:animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Hubungi</span>
              <span className="font-semibold text-gray-800">Team Leader</span>
            </div>
          </div>
        </div>
      </div>

      {/* MENU FOOTER */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-green-700/90 backdrop-blur-lg border border-white/10 shadow-lg flex justify-around items-center px-4 py-1 rounded-full z-50">
        <FooterMenuButton icon={faHome} label="Beranda" isActive={location.pathname === "/home"} onClick={() => navigate("/home")} />
        <FooterMenuButton icon={faHistory} label="Riwayat" isActive={location.pathname === "/riwayat-absensi"} onClick={() => navigate("/riwayat-absensi")} />
        <FooterMenuButton icon={faBell} label="Notifikasi" isActive={location.pathname === "/notification"} onClick={() => navigate("/notification")} />
        <FooterMenuButton icon={faUser} label="Profil" isActive={location.pathname === "/profile"} onClick={() => navigate("/profile")} />
      </div>

      {/* MENU FOOTER */}
    </div>
  );
};

export default HomeMobile;
