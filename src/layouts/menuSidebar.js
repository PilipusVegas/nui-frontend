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
  faArrowRight,
  faChevronDown,
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
    className={`flex items-center text-sm tracking-wider gap-1 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left ${
      isActive ? "bg-green-700/90 text-white shadow-inner" : "hover:bg-white/10 hover:scale-[1.02]"
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
  const [openSubmenu, setOpenSubmenu] = useState(null);

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

  const menuItems = [
    {
      label: "Dashboard",
      icon: faDashboard,
      path: "/home",
      roles: ["1", "2", "3", "4", "5", "6", "13"],
    },
    {
      label: "Data Absensi",
      icon: faCheckSquare,
      roles: ["1", "4", "5"],
      submenu: [
        {
          label: "Presensi Lapangan",
          path: "/data-absensi",
        },
        {
          label: "Presensi Kantor",
          path: "/absensi-kantor",
        },
      ],
    },

    {
      label: "Manajemen Karyawan",
      icon: faPeopleGroup,
      path: "/data-karyawan",
      roles: ["1", "4", "6", "13"],
    },
    {
      label: "Pengelolaan Gaji",
      icon: faBook,
      path: "/data-penggajian",
      roles: ["1", "4", "6", "13"],
    },
    {
      label: "Surat Tugas Dinas",
      icon: faPenFancy,
      path: "/surat-dinas",
      roles: ["1", "4", "5", "6", "13"],
    },
    {
      label: "Struktur Divisi",
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
      label: "Lokasi Absensi",
      icon: faLocationArrow,
      path: "/data-lokasi",
      roles: ["1", "5"],
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
            onClick={toggleSidebar}
            className="absolute top-5 right-5 px-3 py-2 bg-green-600 text-white rounded-full shadow-lg"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        )}

        {/* Tombol Hide (Desktop) */}
        {!isMobile && <ButtonHide onClick={() => setHidden(!hidden)} hidden={hidden} />}

        {/* Konten Sidebar */}
        {!hidden && (
          <>
            <p className="text-sm mt-12 sm:mt-0 mb-3">Menu</p>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 overflow-x-hidden scrollbar-none">
              {menuItems
                .filter((menu) => menu.roles.includes(roleId))
                .map((menu, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        if (menu.submenu) {
                          setOpenSubmenu(openSubmenu === index ? null : index);
                        } else {
                          navigate(menu.path);
                          if (isMobile) toggleSidebar();
                        }
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-md text-left transition-all ${
                        location.pathname === menu.path ||
                        (menu.submenu && menu.submenu.some((sub) => sub.path === location.pathname))
                          ? "bg-white/20 text-white font-semibold"
                          : "hover:bg-white/10 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={menu.icon} className="text-sm" />
                        <span>{menu.label}</span>
                      </div>

                      {/* Dropdown icon */}
                      {menu.submenu && (
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`text-xs transition-transform duration-300 ${
                            openSubmenu === index ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      )}
                    </button>

                    {/* Submenu */}
                    {menu.submenu && openSubmenu === index && (
                      <div className="ml-6 mt-1 flex flex-col gap-2">
                        {menu.submenu.map((sub, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={() => {
                              navigate(sub.path);
                              if (isMobile) toggleSidebar();
                            }}
                            className={`group flex items-center gap-2 text-left text-sm px-3 py-2 rounded-md transition-all ${
                              location.pathname === sub.path
                                ? "bg-white/20 text-white font-semibold"
                                : "hover:bg-white/10 text-white"
                            }`}
                          >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <FontAwesomeIcon icon={faArrowRight} className="text-white text-xs" />
                            </span>

                            <span className="transition-all duration-200 group-hover:translate-x-1">
                              {sub.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
          onClick={toggleSidebar}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
};

export default MenuSidebar;
