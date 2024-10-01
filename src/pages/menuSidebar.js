import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();

  // IconButton component for sidebar buttons
  const IconButton = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center p-4 transition-colors duration-300 rounded-md hover:bg-green-700 w-full text-left"
    >
      <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
      <span className="text-lg font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-green-800 text-white flex flex-col p-4 shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Menu  </h2>
      <div className="flex flex-col gap-2">
        <IconButton 
          label="Salary" 
          icon={faCalendarCheck} 
          onClick={() => navigate("/salary")} 
        />
        <IconButton 
          label="Notifikasi" 
          icon={faBell} 
          onClick={() => navigate("/notification")} 
        />
        <IconButton 
          label="Profil" 
          icon={faUser} 
          onClick={() => navigate("/profile")} 
        />
        <IconButton 
          label="Logout" 
          icon={faSignOutAlt} 
          onClick={handleLogout} 
        />
      </div>
    </div>
  );
};

export default MenuSidebar;
