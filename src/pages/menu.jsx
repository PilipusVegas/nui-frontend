import MobileLayout from "../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faCalendarCheck,faHistory } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout title="Menu">
      <div className="min-h-screen py-6 px-4 bg-white rounded-xl"> 
        <h2 className="text-lg font-semibold mb-4">Menu</h2> 
        <div className="grid grid-cols-4 gap-4"> 
          <ActionButton
            icon={faCalendarCheck}
            label="Absensi"
            onClick={() => navigate("/absensi")}
            color="text-blue-500"
          />
          <ActionButton
            icon={faBell}
            label="Notifikasi"
            onClick={() => navigate("/notification")}
            color="text-yellow-500"
          />
          <ActionButton
            icon={faUser}
            label="Profil"
            onClick={() => navigate("/profile")}
            color="text-blue-500"
          />
          <ActionButton
            icon={faHistory}
            label="Riwayat"
            onClick={() => navigate("/riwayat-absensi")}
            color="text-teal-600"
          />
        </div>
      </div>
    </MobileLayout>
  );
};

const ActionButton = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="rounded-md focus:outline-none transition"
  >
    <div className="flex flex-col items-center">
      {/* Bagian untuk ikon dengan background hijau */}
      <div className={`py-4 px-6 rounded-md bg-green-100 mb-1 hover:bg-green-200 transition`}>
        <FontAwesomeIcon icon={icon} className={`text-xl ${color}`} />
      </div>
      {/* Teks label */}
      <span className="text-sm text-center font-medium">{label}</span>
    </div>
  </button>
);

export default Menu;
