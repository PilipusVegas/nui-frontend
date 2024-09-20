import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faHome, faBell, faUser, faCalendarCheck, faClock } from "@fortawesome/free-solid-svg-icons";
import { height } from "@fortawesome/free-solid-svg-icons/fa0";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      onLogout();
    }
  };

  const renderStep = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <ActionButton icon={faCalendarCheck} label="Absensi" onClick={() => navigate("/absensi")} color="text-blue-500" />
        <ActionButton icon={faClock} label="Overtime" onClick={() => navigate("/overtime")} color="text-green-500" />
        <ActionButton icon={faSignOutAlt} label="Log Out" onClick={handleLogout} color="text-yellow-500" />
      </div>
    );
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("userName");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen font-sans">
      <div style={{ height: 200, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} className="flex-0 p-5 bg-green-900 border-b-2 border-gray-300 shadow-md">
        <div >
          <h2 className="text-2xl font-bold text-white">Halo, {username || "User"}</h2>
        </div>
      </div>
      <div></div>
      <div className="flex-1 p-5 bg-white shadow-md mb-4">
        {renderStep()}
      </div>
      <div style={{borderTopLeftRadius: 20, borderTopRightRadius: 20 }} className="flex justify-around p-4 bg-green-900 shadow-md">
        <IconButton icon={faHome} label="Home" onClick={() => navigate("/home")} />
        <IconButton icon={faBell} label="Notification" onClick={() => navigate("/notification")} />
        <IconButton icon={faUser} label="Profile" onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};

const ActionButtonOld = ({ icon, label, onClick }) => (
  <button onClick={onClick} aria-label={label} className="p-4 bg-green-900 text-white rounded-lg transition duration-300 flex flex-col items-center justify-center hover:bg-green-700">
    <div className="flex flex-col items-center">
      <FontAwesomeIcon icon={icon} className="text-xl" />
      <span className="mt-2 text-sm">{label}</span>
    </div>
  </button>
);

const ActionButton = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} aria-label={label} className="p-4">
    <div className="flex flex-col items-center">
      {/* sesuaikan warna tombol berdasarkan color */}
      <FontAwesomeIcon icon={icon} className={`text-2xl ${color}`} />
      <span className="mt-2 text-sm">{label}</span>
    </div>
  </button>
);

const IconButton = ({ icon, label, onClick }) => (
  <button className="flex flex-col items-center bg-transparent cursor-pointer" onClick={onClick} aria-label={label}>
    <FontAwesomeIcon icon={icon} className="text-2xl text-white" />
    <span className="text-xs text-white">{label}</span>
  </button>
);

export default Home;
