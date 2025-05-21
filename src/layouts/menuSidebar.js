import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faDashboard,
  faCheckSquare,
  faBook,
  faTimes,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faLocationArrow,
  faPeopleGroup,
  faPenFancy,
  faUsersCog,
} from "@fortawesome/free-solid-svg-icons";

// Komponen untuk Tombol Ikon Menu
const IconButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left ${
       isActive
         ? "bg-green-700/90 text-white shadow-inner"
         : "hover:bg-white/10 hover:scale-[1.02]"
     }`}
  >
    <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
    <span>{label}</span>
  </button>
);

// Komponen untuk Tombol Hide Sidebar
const ButtonHide = ({ onClick, hidden }) => (
  <button onClick={onClick} className="text-right mb-4">
    <FontAwesomeIcon
      icon={hidden ? faArrowAltCircleRight : faArrowAltCircleLeft}
      className="text-3xl"
    />
  </button>
);


const MenuSidebar = ({ handleLogout, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const roleId = localStorage.getItem("roleId");

  // Deteksi layar mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Konfirmasi Logout
  const confirmLogout = () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  // Daftar Menu berdasarkan Role
  const menuItems = [
    {
      label: "Dashboard",
      icon: faDashboard,
      path: "/home",
      roles: ["1", "2", "3", "4", "5", "6","13"],
    },
    {
      label: "Data Absensi",
      icon: faCheckSquare,
      path: "/data-absensi",
      roles: ["1", "4"], 
    },
    {
      label: "Data Karyawan",
      icon: faPeopleGroup,
      path: "/data-karyawan",
      roles: [ "1","4", "6","13"], 
    },
    {
      label: "Data Penggajian",
      icon: faBook,
      path: "/data-penggajian",
      roles: ["1", "4", "6", "13"], 
    },
    {
      label: "Data Surat Dinas",
      icon: faPenFancy,
      path: "/surat-dinas",
      roles: ["1", "4", "6", "13"], 
    },
    {
      label: "Data Divisi",
      icon: faUsersCog,
      path: "/divisi",
      roles: ["1", "4", "6"], 
    },
    {
      label: "Persetujuan Lembur",
      icon: faCheckSquare,
      path: "/data-approval",
      roles: ["1", "5"], 
    },
    {
      label: "Data Lokasi Gerai",
      icon: faLocationArrow,
      path: "/data-lokasi",
      roles: [ "1", "5"], 
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full bg-white/10 backdrop-blur-lg border-r border-white/20 text-white p-4 shadow-md z-40 transition-transform duration-700 ${
                isOpen ? "translate-x-0 w-full" : "-translate-x-full"
              }`
            : `flex ${
                hidden ? "w-16" : "w-64 "
              } h-screen sticky top-0 left-0 bg-gradient-to-b from-green-600 to-green-700 text-white flex-col p-4 shadow-md transition-all duration-700`
        }`}
      >
        {/* Tombol Close (Mobile) */}
        {isMobile && isOpen && (
          <button
            onClick={toggleSidebar} // Memanggil fungsi toggleSidebar
            className="absolute top-5 right-5 px-3 py-2 bg-green-600 text-white rounded-full shadow-lg"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        )}

        {/* Tombol Hide (Desktop) */}
        {!isMobile && (
          <ButtonHide onClick={() => setHidden(!hidden)} hidden={hidden} />
        )}

        {/* Konten Sidebar */}
        {!hidden && (
          <>
            <p className="text-sm mt-12 sm:mt-0 mb-3">Menu</p>
            <div className="flex flex-col gap-2">
              {menuItems
                .filter((menu) => menu.roles.includes(roleId)) // Tampilkan menu berdasarkan roleId
                .map((menu, index) => (
                  <IconButton
                    key={index}
                    icon={menu.icon}
                    label={menu.label}
                    onClick={() => {
                      navigate(menu.path);
                      if (isMobile) toggleSidebar(); // Pastikan sidebar ditutup setelah memilih menu
                    }}
                    isActive={location.pathname === menu.path}
                  />
                ))}
            </div>
            <p className="text-sm my-4">Lainnya</p>
            <div className="flex flex-col gap-2">
              <IconButton
                label="Logout"
                icon={faSignOutAlt}
                onClick={confirmLogout}
                isActive={false}
              />
            </div>
          </>
        )}
      </div>

      {/* Background Overlay untuk Mobile */}
      {isMobile && isOpen && (
        <div
          onClick={toggleSidebar} // Memanggil fungsi toggleSidebar untuk menutup sidebar ketika klik di luar
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
};

export default MenuSidebar;

