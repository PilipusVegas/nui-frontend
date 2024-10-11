import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faClock, faBell, faGrip, faHome, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const HomeMobile = ({ username, roleId, handleLogout, GetNamaDivisi }) => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const idUser = localStorage.getItem("userId");

    if (idUser) {
      const fetchNotifications = async () => {
        try {
          setLoading(true); // Mulai loading saat fetch dimulai
          const response = await fetch(`${apiUrl}/notif/user/${idUser}`, {
            headers: { "Cache-Control": "no-cache" },
          });

          if (!response.ok) {
            throw new Error("Gagal mengambil data notifikasi");
          }

          const data = await response.json();

          // Cek apakah data ada dan tidak kosong
          if (data && data.data && data.data.length > 0) {
            const unreadNotifications = data.data.some((notif) => notif.is_read === 0);
            setHasNewNotifications(unreadNotifications);
          } else {
            setHasNewNotifications(false); // Tidak ada notifikasi
          }
        } catch (error) {
          console.error("Terjadi kesalahan:", error);
        } finally {
          setLoading(false); // Hentikan loading setelah proses selesai
        }
      };

      fetchNotifications();
    } else {
      setLoading(false); // Tidak ada user, langsung set loading false
    }

    return () => {
      setLoading(false); // Cleanup untuk menghindari kebocoran memori
    };
  }, [apiUrl]);

  const handleNotificationClick = () => {
    navigate("/notification");
    setHasNewNotifications(false);
  };

  const TitleDivider = ({ title, onClick }) => (
    <div className="flex justify-between p-4">
      <div className="font-bold">{title}</div>
      {onClick && (
        <div onClick={onClick} className="cursor-pointer">
          Lihat semua
        </div>
      )}
    </div>
  );

  const MenuBantuan = ({ icon, title, color, onClick }) => (
    <div className="flex flex-row items-center gap-2 p-4 bg-green-100 rounded-xl cursor-pointer" onClick={onClick}>
      <FontAwesomeIcon className={color} icon={icon} />
      <span>{title}</span>
    </div>
  );

  const IconButton = ({ icon, label, onClick, color, hasNotification }) => (
    <button onClick={onClick} aria-label={label} className="p-4 relative icon-button-relative">
      <div className="flex flex-col items-center">
        <div className="relative">
          <FontAwesomeIcon
            icon={icon}
            className={`text-2xl ${color} ${hasNotification}`}
          />
          {hasNotification && (
            <>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
            </>
          )}
        </div>
        <span className="mt-2 text-sm">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col font-sans">
      <div className="bg-green-900 rounded-b-2xl p-9 relative">
        <button onClick={handleLogout} className="absolute top-5 right-5 text-lg text-white hover:text-gray-300">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
        <div className="flex flex-col py-5">
          <h2 className="text-xs font-bold text-white mb-0 pb-0">Selamat Datang,</h2>
          <div className="text-3xl font-semibold text-white mb-3">{username || "User"}</div>
          <div className="text-xs text-white font-semibold">{GetNamaDivisi(roleId)} • Kantor Palem</div>
        </div>
      </div>
      <TitleDivider title="Menu" />
      <div className="grid grid-cols-4 gap-4">
        <IconButton icon={faCalendarCheck} label="Absen" onClick={() => navigate("/absensi")} color="text-blue-500" />
        <IconButton icon={faClock} label="Lembur" onClick={() => navigate("/lembur")} color="text-blue-500" />
        <IconButton
          isTop={true}
          icon={faBell}
          label="Notifikasi"
          color="text-yellow-500"
          onClick={handleNotificationClick}
          hasNotification={hasNewNotifications}
        />
        <IconButton icon={faGrip} label="Lainnya" onClick={() => navigate("/menu")} color="text-gray-500" />
      </div>
      <TitleDivider title="Bantuan" />
      <div className="flex flex-col gap-2 px-5">
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
      <div className="fixed bottom-0 left-0 w-full flex justify-around bg-green-900 shadow-md text-white">
        <IconButton icon={faHome} label="Home" onClick={() => navigate("/home")} />
        <IconButton
          icon={faBell}
          label="Notifikasi"
          hasNotification={hasNewNotifications}
          onClick={handleNotificationClick}
        />
        <IconButton icon={faUser} label="Profil" onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};

export default HomeMobile;
