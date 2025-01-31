import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeMobile from "../layouts/homeMobile";
import HomeDesktop from "../layouts/homeDesktop";
import MenuSidebar from "../layouts/menuSidebar";
import Header from "../layouts/header";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("nama");
  const roleId = localStorage.getItem("roleId");

  const handleLogout = () => {
    onLogout(); // Logout langsung tanpa konfirmasi
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

  const SidebarLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk sidebar

    const toggleSidebar = () => {
      setIsSidebarOpen((prevState) => !prevState); // Toggle sidebar
    };

    return (
      <div className="flex min-h-screen">
        {/* Sidebar hanya muncul jika roleId memenuhi kriteria */}
        {["1", "4", "5", "6"].includes(roleId) && (
          <MenuSidebar
            handleLogout={handleLogout}
            roleId={roleId}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}
        <div className="flex-grow flex flex-col sticky z-10">
          {/* Header dengan tombol untuk toggle sidebar */}
          <Header toggleSidebar={toggleSidebar} />
          {/* Main Content */}
          <main className="flex-grow bg-gray-100">{children}</main>
        </div>
      </div>
    );
  };

  const renderViewBasedOnRole = () => {
    if (["1", "4", "5", "6"].includes(roleId)) {
      // Tampilkan Sidebar pada HomeDesktop jika roleId valid
      return (
        <SidebarLayout>
          <HomeDesktop
            username={username}
            roleId={roleId}
            GetNamaDivisi={GetNamaDivisi}
            handleLogout={handleLogout}
          />
        </SidebarLayout>
      );
    } else {
      // Tidak ada Sidebar untuk HomeMobile
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
