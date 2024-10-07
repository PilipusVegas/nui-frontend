import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const IconButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} aria-label={label} className="flex items-center p-4 transition-colors duration-300 rounded-md hover:bg-green-700 w-full text-left">
    <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
    <span className="text-lg font-medium">{label}</span>
  </button>
);

const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  return (
    <div className="w-64 bg-green-800 text-white flex flex-col p-4 shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Menu</h2>
      <div className="flex flex-col gap-2">
        <IconButton icon={faBell} label="Notifikasi" onClick={() => navigate("/notification")} />
        <IconButton icon={faUser} label="Profil" onClick={() => navigate("/profile")} />
        <IconButton label="Logout" icon={faSignOutAlt} onClick={handleLogout} />
      </div>
    </div>
  );
};

export default MenuSidebar;
