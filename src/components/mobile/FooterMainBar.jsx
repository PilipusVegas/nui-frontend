import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faHistory, faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";

const FooterMainButton = ({ icon, label, to, activePath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.startsWith(activePath);

  return (
    <button onClick={() => navigate(to)} className="group relative flex flex-col items-center justify-center text-white transition-all duration-300 px-3">
      {/* Background aktif */}
      <div
        className={`absolute w-9 h-9 rounded-full transition-all duration-300 ease-in-out z-0 ${
          isActive ? "bg-white scale-125 -translate-y-8 border-2 border-green-600/90" : "scale-0"
        }`}
      ></div>

      {/* Icon */}
      <div
        className={`relative z-10 flex items-center justify-center w-8 h-8 text-lg transition-all duration-300 ease-in-out ${
          isActive
            ? "text-green-600 -translate-y-5 group-hover:text-green-800"
            : "text-white/80 group-hover:text-white"
        }`}
      >
        <FontAwesomeIcon icon={icon} />
      </div>

      {/* Label */}
      <span
        className={`relative z-10 text-[10px] font-medium mt-2 tracking-widest transition-all duration-300 ${
          isActive ? "-translate-y-5 text-white" : "-translate-y-2 text-white/80 group-hover:text-white"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default function FooterMainBar() {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-green-600/90 backdrop-blur-lg border border-white/10 shadow-lg flex justify-around items-center px-4 py-1 rounded-full z-50">
      <FooterMainButton icon={faHome} label="Beranda" to="/home" activePath="/home" />
      <FooterMainButton icon={faHistory} label="Riwayat" to="/riwayat-pengguna" activePath="/riwayat-pengguna" />
      <FooterMainButton icon={faBell} label="Notifikasi" to="/notification" activePath="/notification" />
      <FooterMainButton icon={faUser} label="Profil" to="/profile" activePath="/profile" />
    </div>
  );
}
