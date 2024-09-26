import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate(); // Initialize navigate using useNavigate

  const IconButtonDesktop = ({ icon, label, onClick, color }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-green-900 text-white rounded-xl shadow-lg hover:bg-green-800 transition duration-200"
    >
      <FontAwesomeIcon icon={icon} className={`text-3xl ${color} mb-2`} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-green-900 text-white flex flex-col justify-between p-6 shadow-lg">
      <div className="flex flex-col gap-4">
        <IconButtonDesktop label="Salary" color="text-white" icon={faCalendarCheck} onClick={() => navigate("/salary")} />
        <IconButtonDesktop icon={faBell} color="text-white" label="Notifikasi" onClick={() => navigate("/notification")} />
        <IconButtonDesktop icon={faUser} label="Profil" color="text-white" onClick={() => navigate("/profile")} />
        <IconButtonDesktop label="Logout" color="text-white" icon={faSignOutAlt} onClick={handleLogout} />
      </div>
    </div>
  );
};

export default MenuSidebar;
