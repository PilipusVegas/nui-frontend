import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faCheckSquare, faBook, faTimes, faArrowAltCircleLeft, faArrowRight, faArrowAltCircleRight, faLocationArrow, faPeopleGroup, faPenFancy, faUsersCog, faHome, faAngleDown,} from "@fortawesome/free-solid-svg-icons";

// Komponen untuk Tombol Ikon Menu
const IconButton = ({ icon, label, onClick, isActive, hiddenSidebar }) => (
  <button onClick={onClick} aria-label={label}
  className={`flex items-center transition-all duration-300 w-full rounded-xl ${
    hiddenSidebar
      ? "justify-center h-11"
      : "justify-start gap-3 px-4 py-3 text-sm tracking-wider"
  } ${isActive ? "bg-green-700/90 text-white shadow-inner" : "hover:bg-white/10 hover:scale-[1.02]"}`}
>
  <FontAwesomeIcon icon={icon} className="text-xl" />
  {!hiddenSidebar && <span className="truncate">{label}</span>}
</button>

);

const ButtonHide = ({ onClick, hidden }) => (
  <button onClick={onClick} className="text-right mb-4">
    <FontAwesomeIcon icon={hidden ? faArrowAltCircleRight : faArrowAltCircleLeft} className="text-3xl"/>
  </button>
);

const MenuSidebar = ({ handleLogout, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const roleId = localStorage.getItem("roleId");
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    const isSubmenuPath = menuGroups.some((group) =>
      group.items.some((menu) => menu.submenu?.some((sub) => sub.path === location.pathname))
    );
    if (isSubmenuPath && hidden) {
      setHidden(false);
    }
  }, [location.pathname]);

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

  const menuGroups = [
    {
      sectionTitle: "Menu Utama",
      items: [
        {
          label: "Dashboard",
          icon: faHome,
          path: "/home",
          roles: ["1", "2", "3", "4", "5", "6", "13"],
        },
      ],
    },
    {
      sectionTitle: "Manajemen Karyawan",
      items: [
        {
          label: "Karyawan",
          icon: faPeopleGroup,
          path: "/data-karyawan",
          roles: ["1", "4", "6", "13"],
        },
        {
          label: "Kelola Struktur Divisi",
          icon: faUsersCog,
          path: "/divisi",
          roles: ["1", "4", "6"],
        },
      ],
    },
    {
      sectionTitle: "Manajemen Presensi",
      items: [
        {
          label: "Presensi",
          icon: faCheckSquare,
          roles: ["1", "4", "5"],
          submenu: [
            { label: "Presensi Lapangan", path: "/data-absensi", roles: ["1", "4", "5"] },
            { label: "Presensi Kantor", path: "/absensi-kantor", roles: ["1", "4", "5"] },
            { label: "Kelola Jam Kerja", path: "/shift", roles: ["1", "4"] },
          ],
        },
        {
          label: "Penggajian",
          icon: faBook,
          path: "/data-penggajian",
          roles: ["1", "4", "6", "13"],
        },
      ],
    },

    {
      sectionTitle: "E-Form",
      items: [
        {
          label: "Dinas Keluar Kantor",
          icon: faPenFancy,
          path: "/surat-dinas",
          roles: ["1", "4", "5", "6", "13"],
        },
      ],
    },
    {
      sectionTitle: "Lainnya",
      items: [
        {
          label: "Persetujuan Lembur",
          icon: faCheckSquare,
          path: "/data-approval",
          roles: ["1", "5"],
        },
        {
          label: "Titik Lokasi Absensi",
          icon: faLocationArrow,
          path: "/data-lokasi",
          roles: ["1", "5"],
        },
      ],
    },
    {
      sectionTitle: "Logout",
      items: [
        {
          label: "Logout",
          icon: faSignOutAlt,
          onClick: confirmLogout,
          isAction: true,
          roles: ["1", "2", "3", "4", "5", "6", "13"],
        },
      ],
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`${
          isMobile
            ? `fixed top-0 left-0 h-full w-full bg-white/10 backdrop-blur-lg border-r border-white/20 text-white p-4 shadow-md z-40 transition-transform duration-700 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `flex flex-col h-screen sticky top-0 left-0 ${
                hidden ? "w-24" : "w-64"
              } bg-gradient-to-b from-green-600 to-green-700 text-white p-4 shadow-md transition-all duration-700`
        }`}
      >
        {/* Tombol Close (Mobile) */}
        {isMobile && isOpen && (
          <button onClick={toggleSidebar} className="absolute top-5 right-5 px-3 py-2 bg-green-600 text-white rounded-full shadow-lg">
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        )}

        {/* Tombol Hide (Desktop) */}
        {!isMobile && <ButtonHide onClick={() => setHidden(!hidden)} hidden={hidden} />}

        {/* Konten Sidebar */}
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {!hidden && (
              <p className="text-xs text-white/70 uppercase tracking-wider mb-1">
                {group.sectionTitle}
              </p>
            )}

            {group.items
              .filter((menu) => menu.roles?.includes(roleId))
              .map((menu, index) => {
                const isActive = location.pathname === menu.path;
                const submenuKey = `${groupIndex}-${index}`;
                const isSubmenuOpen = openSubmenu === submenuKey;

                return (
                  <div key={index}>
                    {/* Item tanpa submenu */}
                    {!menu.submenu ? (
                      <IconButton label={menu.label} icon={menu.icon}
                        onClick={() => {
                          if (menu.isAction) {
                            menu.onClick();
                          } else {
                            navigate(menu.path);
                            if (isMobile) toggleSidebar();
                          }
                        }}
                        isActive={isActive}
                        hiddenSidebar={hidden}
                      />
                    ) : (
                      <>
                        {/* Item dengan submenu */}
                        <button onClick={() => {
                            if (hidden && !isMobile) setHidden(false); 
                            setOpenSubmenu(isSubmenuOpen ? null : submenuKey);
                          }}
                          className={`w-full rounded-xl transition-all duration-300 ${
                            hidden
                              ? "h-11 flex items-center justify-center"
                              : "flex items-center justify-between px-4 py-3 hover:bg-white/10"
                          }`}
                        >
                          <div className={`flex items-center ${hidden ? "justify-center" : "gap-3"}`}>
                            <FontAwesomeIcon icon={menu.icon} className="text-xl" />
                            {!hidden && <span className="text-sm">{menu.label}</span>}
                          </div>

                          {!hidden && (
                            <FontAwesomeIcon icon={faAngleDown} className={`transition-transform duration-300 ${ isSubmenuOpen ? "rotate-180" : "" }`}/>
                          )}
                        </button>

                        {/* Submenu */}
                        {isSubmenuOpen && (
                          <div className={`flex flex-col gap-2 transition-all duration-300 ${hidden ? "absolute left-full top-0 ml-2 bg-green-700 p-2 rounded-xl z-50 shadow-lg w-48" : "ml-6 mt-1"}`} >
                            {menu.submenu
                              .filter((sub) => sub.roles?.includes(roleId))
                              .map((sub, subIndex) => {
                                const isSubActive = location.pathname === sub.path;
                                return (
                                  <button key={subIndex} onClick={() => { navigate(sub.path); if (isMobile) toggleSidebar(); }}
                                    className={`group flex items-center w-full text-left text-sm rounded-md transition-all duration-300 ${hidden ? "justify-start h-9 px-3" : "pl-4 pr-2 py-2"} ${ isSubActive ? "bg-white/20 text-white font-semibold" : "hover:bg-white/10 text-white" }`}>
                                    <FontAwesomeIcon icon={faArrowRight} className={`text-xs ${ hidden ? "block" : "opacity-0 group-hover:opacity-100 transition-opacity" }`}/>
                                    {!hidden && (
                                      <span className="transition-all duration-200 group-hover:translate-x-1">
                                        {sub.label}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Background Overlay untuk Mobile */}
      {isMobile && isOpen && (
        <div onClick={toggleSidebar} className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30"/>
      )}
    </>
  );
};

export default MenuSidebar;
