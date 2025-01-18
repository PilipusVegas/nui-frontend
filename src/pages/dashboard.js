import { useNavigate } from "react-router-dom";

import HomeMobile from "../layouts/homeMobile";
import HomeDesktop from "../layouts/homeDesktop";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("nama");
  const roleId = localStorage.getItem("roleId");

  const handleLogout = () => {
    // Langsung jalankan fungsi logout tanpa konfirmasi
    onLogout();
  };

  const GetNamaDivisi = (id) => {
    let role = "";
    switch (id) {
      case "1":
        role = "Admin Utama";
        break;
      case "2":
        role = "IT";
        break;
      case "3":
        role = "Teknisi";
        break;
      case "4":
        role = "Manajer HRD";
        break;
      case "5":
        role = "PA";
        break;
      case "6":
        role = "Staff HRD";
        break;
      default:
        role = "Divisi Tidak Diketahui";
    }
    return (
      <span className="bg-yellow-500 px-3 py-0 rounded-full text-xs text-primary font-bold">
        {role}
      </span>
    );
  };

  const renderViewBasedOnRole = () => {
    if (roleId === "4" || roleId === "5" || roleId === "6" || roleId === "1") {
      return (
        <HomeDesktop
          username={username}
          roleId={roleId}
          GetNamaDivisi={GetNamaDivisi}
          handleLogout={handleLogout}
        />
      );
    } else {
      return (
        <HomeMobile
          username={username}
          roleId={roleId}
          handleLogout={handleLogout}
          GetNamaDivisi={GetNamaDivisi}
        />
      );
    }
  };

  return <div>{renderViewBasedOnRole()}</div>;
};

export default Home;
