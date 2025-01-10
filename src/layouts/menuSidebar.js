import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faDashboard,
  faCheckSquare,
  faBook,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";

const IconButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex items-center p-3 transition-colors duration-300 rounded-full w-full text-left ${
      isActive ? "bg-green-700" : "hover:bg-green-900"
    }`}
  >
    <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
    <span className="">{label}</span>
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
  const location = useLocation(); // Menambahkan useLocation
  const [hidden, setHidden] = useState(false);

  const hideAction = () => setHidden((prev) => !prev);

  return (
    <div
      className={`flex ${
        hidden ? "w-16" : "w-64"
      } h-screen sticky top-0 left-0 bg-gradient-to-b from-green-900 to-green-600 text-white flex-col p-4 shadow-md transition-all duration-300`}
    >
      <ButtonHide onClick={hideAction} hidden={hidden} />
      {!hidden && (
        <>
          <p className="text-sm my-4">Menu</p>
          <div className="flex flex-col gap-2">
            <IconButton
              icon={faDashboard}
              label="Dashboard"
              onClick={() => navigate("/home")}
              isActive={location.pathname === "/home"}
            />
            <IconButton
              icon={faCheckSquare}
              label="Absensi"
              onClick={() => navigate("/data-absensi")}
              isActive={location.pathname === "/data-absensi"}
            />
            <IconButton
              icon={faBook}
              label="Penggajian"
              onClick={() => navigate("/data-penggajian")}
              isActive={location.pathname === "/data-penggajian"}
            />
          </div>
          <p className="text-sm my-4">Lainnya</p>
          <div className="flex flex-col gap-2">
            <IconButton
              label="Logout"
              icon={faSignOutAlt}
              onClick={handleLogout}
              isActive={false} // Logout biasanya tidak memiliki status aktif
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MenuSidebar;
