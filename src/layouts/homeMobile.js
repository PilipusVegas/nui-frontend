import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faClock,
  faBell,
  faHistory,
  faGrip,
  faHome,
  faUser,
  faSignOutAlt,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

const HomeMobile = ({ username, roleId, handleLogout, GetNamaDivisi }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const idUser = localStorage.getItem("userId");

    if (idUser) {
      const fetchNotifications = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${apiUrl}/notif/user/${idUser}`, {
            headers: { "Cache-Control": "no-cache" },
          });

          if (!response.ok) {
            throw new Error("Gagal mengambil data notifikasi");
          }

          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            const unreadNotifications = data.data.some((notif) => notif.is_read === 0);
            setHasNewNotifications(unreadNotifications);
          } else {
            setHasNewNotifications(false);
          }
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

  const handleNotificationClick = () => {
    navigate("/notification");
    setHasNewNotifications(false);
  };

  const MenuBantuan = ({ icon, title, color, onClick }) => (
    <div
      className="flex flex-row items-center gap-2 p-4 bg-green-100 rounded-xl cursor-pointer hover:bg-green-200 transition-all duration-300"
      onClick={onClick}
    >
      <FontAwesomeIcon className={`${color} text-xl`} icon={icon} />
      <span className="font-medium">{title}</span>
    </div>
  );

  const IconButton = ({ icon, label, onClick, color, hasNotification, isActive }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex flex-col items-center justify-center mb-1 py-2 px-4 relative transition-all duration-300 rounded-full ${
        isActive ? "bg-white text-green-900" : "hover:bg-gray-200 hover:text-green-900 px-2"
      }`}
    >
      <div className="relative">
        <FontAwesomeIcon icon={icon} className={`text-lg ${color}`} />
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

  return (
    <div className="flex flex-col font-sans bg-gray-50 min-h-screen">
      <div className="bg-green-700 rounded-b-2xl p-8 relative shadow-lg">
        <button
          onClick={handleLogout}
          title="Logout"
          className="absolute top-3 right-3 text-lg text-white hover:text-green-700 transition-colors hover:bg-white px-2 py-1 rounded-full"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
        <div className="flex flex-col py-5">
          <h2 className="text-xs font-semibold text-white">Selamat Datang,</h2>
          <div className="text-3xl font-bold text-white mb-2">{username || "User"}</div>
          <div className="text-sm text-white font-semibold">{GetNamaDivisi(roleId)} • Kantor Palem</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4">
        <IconButton icon={faCalendarCheck} label="Absen" onClick={() => navigate("/absensi")} color="text-blue-500" />
        <IconButton icon={faClock} label="Lembur" onClick={() => navigate("/lembur")} color="text-blue-500" />
        <IconButton
          icon={faBell}
          label="Notifikasi"
          color="text-yellow-500"
          onClick={handleNotificationClick}
          hasNotification={hasNewNotifications}
        />
        <IconButton icon={faGrip} label="Lainnya" onClick={() => navigate("/menu")} color="text-gray-500" />
      </div>

      <div className="flex flex-row items-center p-1">
        <span className="text-md font-semibold pl-3 pb-3">
          Bantuan <FontAwesomeIcon icon={faQuestionCircle} className="text-sm" />
        </span>
      </div>

      <div className="flex flex-col gap-3 px-5">
        <MenuBantuan
          title="Team IT"
          icon={faWhatsapp}
          color="text-green-500"
          onClick={() => window.open("https://wa.me/628980128222", "_blank")}
        />
        <MenuBantuan
          icon={faWhatsapp}
          title="Team Leader"
          color="text-green-500"
          onClick={() => window.open("https://wa.me/6287819999599", "_blank")}
        />
      </div>

      <div className="fixed bottom-0 left-0 w-full flex justify-around items-center p-2 bg-green-700 shadow-md text-white rounded-t-2xl">
        <IconButton icon={faHome} label="Home" isActive={location.pathname === "/home"} onClick={() => navigate("/home")} />
        <IconButton
          icon={faHistory}
          label="Riwayat"
          hasNotification={hasNewNotifications}
          isActive={location.pathname === "/riwayat-absensi"}
          onClick={() => navigate("/riwayat-absensi")}
        />
        <IconButton
          icon={faUser}
          label="Profil"
          isActive={location.pathname === "/profile"}
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
};

export default HomeMobile;
