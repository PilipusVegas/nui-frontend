import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSignOutAlt, 
  faDashboard, 
  faBars,
  faTimes,
  faChevronRight,
  faChevronLeft,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";

const IconButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex items-center p-4 transition-colors duration-300 rounded-md hover:bg-green-700 w-full text-left"
  >
    <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
    <span className="text-lg font-medium">{label}</span>
  </button>
);

const ButtonHide = ({ onClick, hidden }) => (
  <button onClick={onClick} className="text-right mb-4">
      <FontAwesomeIcon
        icon={hidden ? faArrowAltCircleRight : faArrowAltCircleLeft} // Ikon berubah sesuai status hidden
        className="text-3xl"
      />
    </button>
);

const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  const hideAction = () => setHidden((prev) => !prev);

  return (
    <div
      className={`flex ${
        hidden ? "w-16" : "w-64"
      } h-screen sticky top-0 left-0 bg-green-800 text-white flex-col p-4 shadow-md transition-all duration-300`}
    >
      <ButtonHide onClick={hideAction} hidden={hidden} />
      {!hidden && (
        <>
          <h2 className="text-2xl font-semibold mb-6">Menu</h2>
          <div className="flex flex-col gap-2">
            <IconButton
              icon={faDashboard}
              label="Dashboard"
              onClick={() => navigate("/home")}
            />
            <IconButton
              label="Logout"
              icon={faSignOutAlt}
              onClick={handleLogout}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MenuSidebar;
