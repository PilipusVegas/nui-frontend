import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faDashboard,
  faCheckSquare,
  faBook,
  faChevronRight,
  faTimes,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faLocationArrow,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";

// Komponen untuk Tombol Ikon Menu
const IconButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex items-center p-3 transition-colors duration-300 rounded-full w-full text-left ${
      isActive ? "bg-green-700" : "hover:bg-green-900"
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

// Komponen Sidebar
const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const roleId = localStorage.getItem("roleId"); // Dapatkan roleId dari localStorage

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
      roles: ["1", "2", "3", "4", "5", "6"],
    },
    {
      label: "Data Absensi",
      icon: faCheckSquare,
      path: "/data-absensi",
      roles: ["1","4"], // Contoh hanya role 4 dan 6 yang bisa akses
    },
    {
      label: "Data Karyawan",
      icon: faPeopleGroup,
      path: "/data-karyawan",
      roles: [ "1","6"], // Contoh hanya role 4 dan 6 yang bisa akses
    },
    {
      label: "Data Penggajian",
      icon: faBook,
      path: "/data-penggajian",
      roles: ["1","4","6"], // Contoh hanya role 4 dan 6 yang bisa akses
    },
    {
      label: "Persetujuan Lembur",
      icon: faCheckSquare,
      path: "/data-approval",
      roles: ["1","5"], // Contoh hanya role 4 dan 6 yang bisa akses
    },
    {
      label: "Data Lokasi Gerai",
      icon: faLocationArrow,
      path: "/data-lokasi",
      roles: [ "1","5"], // Contoh hanya role 4 dan 6 yang bisa akses
    },
  ];

  return (
    <>
      {/* Toggle Button untuk Mobile */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed top-[600px] left-[-9px] z-50 px-2 py-5 bg-green-600 text-white rounded-lg shadow-lg"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full bg-gradient-to-b from-green-600 to-green-700 text-white p-4 shadow-md z-40 transition-transform duration-700 ${
                isOpen ? "translate-x-0 w-full" : "-translate-x-full"
              }`
            : `flex ${
                hidden ? "w-16" : "w-60"
              } h-screen sticky top-0 left-0 bg-gradient-to-b from-green-600 to-green-700 text-white flex-col p-4 shadow-md transition-all duration-700`
        }`}
      >
        {/* Tombol Close (Mobile) */}
        {isMobile && isOpen && (
          <button
            onClick={() => setIsOpen(false)}
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
                      if (isMobile) setIsOpen(false);
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
          onClick={() => setIsOpen(false)}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
};

export default MenuSidebar;
