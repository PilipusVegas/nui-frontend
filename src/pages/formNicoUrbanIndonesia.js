import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import HomeMobile from "./homeMobile";
import HomeDesktop from "./homeDesktop";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  
  const [roleId, setRoleId] = useState("");
  const [username, setUsername] = useState("");
  
  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {onLogout()}
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
      case "4":
        role = "HRD";
        break;
      default:
        role = "Divisi Tidak Diketahui";
    }
    return <span className="bg-yellow-500 px-3 py-0 rounded-full text-xs text-primary font-bold">{role}</span>;
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("nama");
    const storedRoleId = localStorage.getItem("roleId");
    if (storedUsername) {setUsername(storedUsername)}
    if (storedRoleId) {setRoleId(storedRoleId)}
  }, []);

  const renderViewBasedOnRole = () => {
    if (roleId === "4") {
      return <HomeDesktop username={username} roleId={roleId} GetNamaDivisi={GetNamaDivisi} handleLogout={handleLogout} />;
    } else {
      return <HomeMobile username={username} roleId={roleId} handleLogout={handleLogout} GetNamaDivisi={GetNamaDivisi} />;
    }
  };

  return (
    <div>
      {renderViewBasedOnRole()}
    </div>
  );
};

export default Home;
