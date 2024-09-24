import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faHome, faBell, faUser, faCalendarCheck, faGrip, faMessage } from "@fortawesome/free-solid-svg-icons";
import logoNui from "../assets/logo.png"; // Ensure this asset path is correct

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

  const GetNamaDivisi = (id) => {
    let role = "";
    switch (id) {
      case "1":
        role = "Admin";
        break;
      case "2":
        role = "IT";
        break;
      case "3":
        role = "Teknisi";
        break;
      default:
        role = "Divisi Tidak Diketahui";
    }

    return <span className="bg-yellow-500 px-3 py-0 rounded-full text-xs text-primary">{role}</span>;
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("nama");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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
        <MenuBantuan color={"text-green-500"} icon={faWhatsapp} title="Team IT" onClick={() => window.open("https://wa.me/628980128222", "_blank")} />
        <MenuBantuan color={"text-green-500"} icon={faWhatsapp} title="Team Leader" onClick={() => window.open("https://wa.me/6287819999599", "_blank")} />
      </div>
      <div className="fixed bottom-0 left-0 w-full flex justify-around bg-green-900 shadow-md text-white">
        <IconButton icon={faHome} label="Home" onClick={() => navigate("/home")} />
        <IconButton icon={faBell} label="Notifikasi" onClick={() => navigate("/notification")} />
        <IconButton icon={faUser} label="Profil" onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};

export default Home;
