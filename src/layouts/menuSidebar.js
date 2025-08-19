import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faCheckSquare, faBook, faArrowRight, faLocationArrow, faPeopleGroup, faPenFancy, faUsersCog, faHome, faAngleDown, faBuilding, faUserCheck,} from "@fortawesome/free-solid-svg-icons";
import { menuConfig } from "../data/menuConfig";

const IconButton = ({ icon, label, onClick, isActive }) => (
  <button onClick={onClick} aria-label={label} className={`flex items-center transition-all duration-300 w-full rounded-lg gap-3 p-3 my-1 text-sm tracking-wider ${isActive ? "bg-green-800/90 text-white shadow-inner font-semibold tracking-wide" : "hover:bg-white/10 hover:scale-[1.02]"}`}>
    <FontAwesomeIcon icon={icon} className="text-xl" />
    <span className="truncate">{label}</span>
  </button>
);

const MenuSidebar = ({ handleLogout, perusahaanId, roleId, isOpen, toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

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

  // const menuGroups = [
  //   {
  //     // sectionTitle: "Menu Utama",
  //     items: [
  //       { label: "Dashboard", icon: faHome, path: "/home", roles: [1, 2, 3, 4, 5, 6, 13, 20] },
  //     ],
  //   },
  //   {
  //     sectionTitle: "Manajemen Karyawan",
  //     items: [
  //       { label: "Kelola Karyawan", icon: faPeopleGroup, path: "/karyawan", roles: [1, 4, 6] },
  //       { label: "Kelola Struktur Divisi", icon: faUsersCog, path: "/divisi", roles: [1, 4, 6] },
  //     ],
  //   },
  //   {
  //     sectionTitle: "Manajemen Presensi",
  //     items: [
  //       { label: "Persetujuan Presensi", icon: faCheckSquare, path: "/persetujuan-presensi", roles: [1, 4, 5, 6, 13, 20], perusahaan: [1, 4]},
  //       {
  //         label: "Presensi Karyawan", icon: faUserCheck, roles: [1, 4, 5, 6],
  //         submenu: [
  //           { label: "Kelola Presensi", path: "/kelola-presensi", roles: [1, 4, 5, 6] },
  //           { label: "Kelola Jam Kerja", path: "/shift", roles: [1, 4, 6] },
  //         ],
  //       },
  //       { label: "Kelola Penggajian", icon: faBook, path: "/penggajian", roles: [1, 4, 6] },
  //     ],
  //   },
  //   {
  //     sectionTitle: "E-Form",
  //     items: [
  //       { label: "Dinas Keluar Kantor", icon: faPenFancy, path: "/surat-dinas", roles: [1, 4, 5, 6] },
  //     ],
  //   },
  //   {
  //     sectionTitle: "Lainnya",
  //     items: [
  //       { label: "Persetujuan Lembur", icon: faCheckSquare, path: "/persetujuan-lembur", roles: [1, 4, 5, 6, 20], perusahaan: [1, 4]},
  //       { label: "Titik Lokasi Absensi", icon: faLocationArrow, path: "/lokasi-presensi", roles: [1, 5] },
  //       { label: "Kelola Perusahaan", icon: faBuilding, path: "/perusahaan", roles: [1, 4, 6] },
  //     ],
  //   },
  //   {
  //     sectionTitle: "Logout",
  //     items: [
  //       { label: "Logout", icon: faSignOutAlt, onClick: confirmLogout, isAction: true, roles: [1, 2, 3, 4, 5, 6, 13, 20] },
  //     ],
  //   },
  // ];

const filteredMenuGroups = menuConfig.map(group => {
  const filteredItems = group.items.filter(item =>
    item.roles.includes(roleId) &&
    (!item.perusahaan || item.perusahaan.includes(perusahaanId))
  );
  return filteredItems.length ? { ...group, items: filteredItems } : null;
}).filter(Boolean);
  

  return (
    <>
    <div className={`${isMobile ? `fixed top-0 left-0 h-full max-w-[80%] w-full bg-white/10 backdrop-blur-lg border-r border-white/20 text-white shadow-md z-50 pt-5 transition-transform duration-700 ${isOpen ? "translate-x-0" : "-translate-x-full"}` : `flex flex-col h-full left-0 py-6 px-0 bg-gradient-to-b from-green-600 to-green-700 text-white shadow-md transition-all duration-700`}`}>
        {/* Tombol Close (Mobile Only) */}
        {/* {isMobile && isOpen && (
          <button onClick={toggleSidebar} className="absolute top-4 right-4 z-50 bg-white hover:bg-green-800 text-green-700 hover:text-white hover:border hover:border-white p-1 px-2.5 rounded-full shadow-lg">
            <FontAwesomeIcon icon={faClose} className="text-xl pt-1" />
          </button>
        )} */}

        {/* Isi Menu */}
        <div className="overflow-y-auto h-full pr-2 pl-3 scrollbar-green">
          {filteredMenuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="gap-4 mb-4">
              {group.sectionTitle && (
                <p className="text-xs text-white/80 tracking-wide font-semibold uppercase mb-2">
                  {group.sectionTitle}
                </p>
              )}
                  {group.items.map((menu, index) => {
                    const isActive = location.pathname === menu.path;
                    const submenuKey = `${groupIndex}-${index}`;
                    const isSubmenuOpen = openSubmenu === submenuKey;

                    return (
                      <div key={index}>
                        {!menu.submenu ? (
                          <IconButton label={menu.label} icon={menu.icon} onClick={() => { menu.isAction ? menu.onClick() : navigate(menu.path); if (isMobile) toggleSidebar(); }} isActive={isActive}/>
                        ) : (
                          <>
                            {/* Menu induk */}
                            <button onClick={() => setOpenSubmenu(isSubmenuOpen ? null : submenuKey) } className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={menu.icon} className="text-xl" />
                                <span className="text-sm">{menu.label}</span>
                              </div>
                              <FontAwesomeIcon icon={faAngleDown} className={`transition-transform duration-300 ${ isSubmenuOpen ? "rotate-180" : "" }`}/>
                            </button>

                            {/* Submenu */}
                            {isSubmenuOpen && (
                              <div className="flex flex-col gap-2 ml-6 mt-2">
                                {menu.submenu.map((sub, subIndex) => (
                                  <button key={subIndex} onClick={() => {navigate(sub.path); if (isMobile) toggleSidebar();}} className={`group flex items-center w-full text-left text-sm rounded-md pl-4 pr-2 py-2 transition-all duration-300 ${location.pathname === sub.path ? "bg-white/20 text-white font-semibold" : "hover:bg-white/10 text-white"}`}>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-xs mr-2"/>
                                    <span className="transition-all duration-200 group-hover:translate-x-1">
                                      {sub.label}
                                    </span>
                                  </button>
                                ))}
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
      </div>
      {/* Overlay Hitam Saat Sidebar Terbuka */}
      {isMobile && isOpen && (
        <div onClick={toggleSidebar} className="fixed top-0 left-0 w-full h-full bg-black/40 z-40"/>
      )}
    </>
  );
};

export default MenuSidebar;
