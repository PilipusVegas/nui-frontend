import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSignOutAlt, 
  faDashboard, 
  faArrowCircleLeft, 
  faArrowCircleRight // Import icon baru
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
      icon={hidden ? faArrowCircleRight : faArrowCircleLeft} // Kondisi ikon
      className="text-3xl"
    />
  </button>
);

const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false); // Inisialisasi state

  const hideAction = () => setHidden((prev) => !prev); // Fungsi untuk toggle sidebar

  return (
    <div
      className={`flex ${
        hidden ? "w-16" : "w-64"
      } h-screen bg-green-800 text-white flex-col p-4 shadow-md transition-all duration-300`}
    >
      <ButtonHide onClick={hideAction} hidden={hidden} /> {/* Toggle button */}
      {!hidden && ( // Tampilkan menu hanya jika tidak tersembunyi
        <>
          <h2 className="text-2xl font-semibold mb-6">Menu</h2>
          <div className="flex flex-col gap-2">
            <IconButton
              icon={faDashboard}
              label="Dashboard"
              onClick={() => navigate("/home")}
            />
            {/* Uncomment jika dibutuhkan */}
            {/* <IconButton icon={faBell} label="Notifikasi" onClick={() => navigate("/notification")} /> */}
            {/* <IconButton icon={faUser} label="Profil" onClick={() => navigate("/profile")} /> */}
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
