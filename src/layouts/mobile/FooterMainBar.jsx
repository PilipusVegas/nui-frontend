import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faHistory, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";

const menus = [
  {
    icon: faHome,
    label: "Beranda",
    to: "/home",
  },
  {
    icon: faHistory,
    label: "Riwayat",
    to: "/riwayat-pengguna",
  },
  {
    icon: faUser,
    label: "Profil",
    to: "/profile",
  },
];

const FooterMainButton = ({ icon, label, to, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center flex-1 py-3 transition-all duration-200 active:scale-95"
    >
      <FontAwesomeIcon
        icon={icon}
        className={`text-[14px] mb-[7px] transition-all duration-200 ${
          isActive ? "text-green-600 scale-110" : "text-gray-400"
        }`}
      />

      <span
        className={`text-[11px] leading-none transition-all ${
          isActive ? "text-green-600 font-semibold" : "text-gray-400"
        }`}
      >
        {label}
      </span>

      <div
        className={`mt-[5px] h-[2px] w-10 rounded-full transition-all duration-300 ${
          isActive ? "bg-green-600 opacity-100" : "bg-transparent opacity-0"
        }`}
      />
    </button>
  );
};

export default function FooterMainBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between px-2 py-0">
        {menus.map((menu) => {
          const isActive = location.pathname.startsWith(menu.to);

          return (
            <FooterMainButton
              key={menu.to}
              icon={menu.icon}
              label={menu.label}
              to={menu.to}
              isActive={isActive}
              onClick={() => navigate(menu.to)}
            />
          );
        })}
      </div>
    </div>
  );
}