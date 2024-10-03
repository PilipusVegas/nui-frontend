import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ROLE_IDS = {
  APPROVAL: "5",
  SALARY: "4",
};

const IconButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center p-4 transition-colors duration-300 rounded-md hover:bg-green-700 w-full text-left"
    aria-label={label} // Accessibility improvement
  >
    <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
    <span className="text-lg font-medium">{label}</span>
  </button>
);

const MenuSidebar = ({ handleLogout, roleId }) => {
  const navigate = useNavigate(); // Hook untuk navigasi
  // console.log("Current roleId:", roleId); 

  // Mapping roleId to menu items
  const menuItems = {
    [ROLE_IDS.APPROVAL]: (
      <IconButton 
        label="Approval" 
        icon={faCalendarCheck} 
        onClick={() => navigate("/data-approval")} 
      />
    ),
    [ROLE_IDS.SALARY]: (
      <IconButton 
        label="Salary" 
        icon={faCalendarCheck} 
        onClick={() => navigate("/salary")} 
      />
    ),
  };

  return (
    <div className="w-64 bg-green-800 text-white flex flex-col p-4 shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Menu</h2>
      <div className="flex flex-col gap-2">
        {menuItems[roleId] || null} {/* Render role-specific menu item */}
        
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
