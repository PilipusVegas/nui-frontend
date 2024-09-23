import MobileLayout from "../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";


const Menu = () => {
  const navigate = useNavigate();
  return (
    <MobileLayout title="Menu">
      <div className="grid grid-cols-3 gap-4">
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
      </div>
    </MobileLayout>
  );
};

const ActionButton = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} aria-label={label} className="p-4">
    <div className="flex flex-col items-center">
      {/* sesuaikan warna tombol berdasarkan color */}
      <FontAwesomeIcon icon={icon} className={`text-2xl ${color}`} />
      <span className="mt-2 text-sm">{label}</span>
    </div>
  </button>
);

export default Menu;
