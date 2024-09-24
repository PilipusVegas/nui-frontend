import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faHome, faBell, faUser, faCalendarCheck, faGrip, faMessage, faBuildingUser  } from "@fortawesome/free-solid-svg-icons";
import logoNui from "../assets/logo.png"; // Pastikan jalur aset sudah benar

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roleName, setRoleName] = useState(""); // Tambahkan state untuk role_name
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const storedUsername = localStorage.getItem("nama");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const id_user = localStorage.getItem("userId");
    if (!id_user) return console.error("User ID not found in localStorage.");

    fetch(`${apiUrl}/profil/user/${id_user}`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(({ data: userProfile }) => {
        if (userProfile) {
          setRoleName(userProfile.role_name || "Divisi Tidak Diketahui");

          return <span className="bg-yellow-500 px-3 py-0 rounded-full text-xs text-primary">{roleName}</span>;
        }
      })
      .catch((error) => console.error("Error fetching profile data:", error));
  }, [apiUrl]);

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {
      onLogout();
    }
  };

  return (
    <div className="flex flex-col font-sans">
      <div className="bg-green-900 rounded-b-2xl p-9 relative">
        <button onClick={handleLogout} className="absolute top-5 right-5 text-lg text-white hover:text-gray-300">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
        <div className="flex flex-col py-5">
          <h2 className="text-xs font-bold text-white mb-0 pb-0">Selamat Datang,</h2>
          <div className="text-3xl font-semibold text-white mb-3">{username || "User"}</div>


          <div className="text-xs text-black font-bold">
            <span className="bg-yellow-400 px-3 py-0 rounded-full text-primary">{roleName || "Divisi Tidak Diketahui"}</span>
            
            <span className=" py-1 rounded-full text-white font-semibold"> •<FontAwesomeIcon className="ml-1" icon={faBuildingUser} /> Kantor Palem</span>
          </div>
        </div>
      </div>

      <TitleDivider title="Menu" />
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
      <div className="fixed bottom-0 left-0 w-full flex justify-around bg-green-900 shadow-md text-white">
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

const TitleDivider = ({ title, onClick }) => (
  <div className="flex justify-between p-4">
    <div className="font-bold">{title}</div>
    {onClick && (
      <div onClick={onClick} className="cursor-pointer">
        Lihat semua
      </div>
    )}
  </div>
);

const MenuBantuan = ({ icon, title, color, onClick }) => (
  <div className={"flex flex-row items-center gap-2 p-4 bg-green-100 rounded-xl"} onClick={onClick}>
    <FontAwesomeIcon className={color} icon={icon} />
    <span>{title}</span>
  </div>
);

export default Home;
