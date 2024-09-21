import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faHome, faBell, faUser, faCalendarCheck, faClock, faGrip, faMessage } from "@fortawesome/free-solid-svg-icons";
import { height } from "@fortawesome/free-solid-svg-icons/fa0";
import logoNui from "../assets/logo.png";

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

  const GetNamaDivisi = (id) => {
    let role = "";
    if (id === "1") {
      role = "Admin";
    } else if (id === "2") {
      role = "IT";
    } else if (id === "3") {
      role = "Teknisi";
    } else {
      role = "Divisi Tidak Diketahui";
    }

    return (
      <span className="bg-yellow-500 px-2 py-1 rounded-full text-xs text-primary">{role}</span>
    )
  };


  useEffect(() => {
    const storedUsername = localStorage.getItem("nama");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen font-sans">
      <div style={{borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} className="flex-0 p-5 bg-green-900">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-white">{username || "User"}</h2>
            <div>{GetNamaDivisi(localStorage.getItem("roleId"))}</div>
            <div className="text-xs text-gray-100">Kantor Palem</div>
          </div>
          <div className="">
            <button onClick={handleLogout} className="text-white">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </div>
      <TitleDivider title="Menu"  />
      <div className="grid grid-cols-3 gap-4">
        <IconButton icon={faCalendarCheck} label="Absensi" onClick={() => navigate("/absensi")} color="text-blue-500" />
        <IconButton icon={faBell} label="Notifikasi" onClick={() => navigate("/notification")} color="text-yellow-500" />
        <IconButton icon={faGrip} label="Lainnya" onClick={() => navigate("/menu")} color="text-gray-500" />
      </div>
      <TitleDivider title="Bantuan" />
      <div className="flex flex-col gap-2 px-5">
        <MenuBantuan color={"text-primary"} icon={faMessage} title="Tim IT" />
        <MenuBantuan color={"text-primary"} icon={faMessage} title="Leader" />
      </div>
      <div className="flex-1 bg-white shadow-md mb-4"></div>
      <div className="flex justify-around p-4 bg-green-900 shadow-md text-white">
        <IconButton icon={faHome} label="Home" onClick={() => navigate("/home")} />
        <IconButton icon={faBell} label="Notifikasi" onClick={() => navigate("/notification")} />
        <IconButton icon={faUser} label="Profil" onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};


const IconButton = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} aria-label={label} className="p-4">
    <div className="flex flex-col items-center">
      <FontAwesomeIcon icon={icon} className={`text-2xl ${color}`} />
      <span className="mt-2 text-sm">{label}</span>
    </div>
  </button>
);


const TitleDivider = ( {title, onClick } ) => (
  <div className="flex justify-between p-4">
    <div className="font-bold">{title}</div>
    {onClick && <div onClick={onClick} className="cursor-pointer">Lihat semua</div>}
  </div>
);

const MenuBantuan = ({icon, title, color, onClick}) => (
  <div className={"flex flex-row items-center gap-2 p-4 bg-green-100 rounded-xl"} onClick={onClick}>
    <FontAwesomeIcon className={color} icon={icon} />
    <span>{title}</span>
  </div>
);

export default Home;
