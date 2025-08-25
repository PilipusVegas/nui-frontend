import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faAngleDown, } from "@fortawesome/free-solid-svg-icons";
import { menuConfig } from "../data/menuConfig";

const IconButton = ({ icon, label, onClick, isActive }) => (
  <button onClick={onClick} aria-label={label} className={`flex items-center w-full px-3 py-2.5 my-1 rounded-lg text-sm font-medium tracking-wide ${isActive ? "bg-green-800/90 text-white shadow-inner font-semibold" : "text-white/90 hover:bg-white/10"} transition-colors duration-300 overflow-hidden `}>
    <div className="flex items-center gap-3 transition-transform duration-200 hover:translate-x-2">
      <FontAwesomeIcon icon={icon} className={`text-xl ${isActive ? "text-white" : "text-white/90"}`} />
      <span className="truncate">{label}</span>
    </div>
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

  const filteredMenuGroups = menuConfig.map(group => {
    const filteredItems = group.items.filter(item =>
      item.roles.includes(roleId) &&
      (!item.perusahaan || item.perusahaan.includes(perusahaanId))
    );
    return filteredItems.length ? { ...group, items: filteredItems } : null;
  }).filter(Boolean);


  return (
    <>
      <div className={`${isMobile ? `fixed top-0 left-0 h-full max-w-[80%] w-full bg-white/10 backdrop-blur-lg border-r border-white/20 text-white shadow-md z-50 pt-5 transition-transform duration-700 ${isOpen ? "translate-x-0" : "-translate-x-full"}` : `flex flex-col h-full left-0 py-5 px-0 bg-gradient-to-b from-green-600 to-green-700 text-white shadow-md transition-all duration-700`}`}>
        {/* Isi Menu */}
        <div className="overflow-y-auto h-full pr-2 pl-3 scrollbar-green">
          {filteredMenuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="gap-4 mb-4">

           {/* Section Title */}
            {group.sectionTitle && (
              <div className="mb-3 select-none">
                <div className="flex items-center">
                  {/* Accent bar hijau gradient */}
                  <div className="w-1 h-4 bg-gradient-to-b from-green-400 via-green-300 to-white/60 rounded-xl mr-2 shadow-sm"></div>
                  <p className="text-xs text-white/95 tracking-widest font-bold uppercase drop-shadow-sm">
                    {group.sectionTitle}
                  </p>
                </div>
              </div>
            )}

              {group.items.map((menu, index) => {
                const isActive = location.pathname === menu.path;
                const submenuKey = `${groupIndex}-${index}`;
                const isSubmenuOpen = openSubmenu === submenuKey;

                return (
                  <div key={index}>
                    {!menu.submenu ? (
                      <IconButton label={menu.label} icon={menu.icon} onClick={() => { menu.isAction ? menu.onClick() : navigate(menu.path); if (isMobile) toggleSidebar(); }} isActive={isActive} />
                    ) : (
                      <>
                        {/* Menu Induk */}
                        <button onClick={() => setOpenSubmenu(isSubmenuOpen ? null : submenuKey)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={menu.icon} className="text-xl text-white/90" />
                            <span className="text-sm font-bold text-white transition-transform duration-200 hover:translate-x-2">
                              {menu.label}
                            </span>
                          </div>
                          <FontAwesomeIcon icon={faAngleDown} className={`transition-transform duration-300 ${isSubmenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Submenu */}
                        {isSubmenuOpen && (
                          <div className="flex flex-col gap-2 ml-6 mt-2">
                            {menu.submenu.map((sub, subIndex) => (
                              <button key={subIndex} onClick={() => { navigate(sub.path); if (isMobile) toggleSidebar(); }} className={`group flex items-center w-full text-left text-sm rounded-md pl-4 pr-2 py-2 transition-all duration-300  ${location.pathname === sub.path ? "bg-white/20 text-white font-semibold" : "hover:bg-white/10 text-white"}`}>
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs mr-2 text-white/80" />
                                <span className="transition-all duration-200 group-hover:translate-x-2">
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
        <div onClick={toggleSidebar} className="fixed top-0 left-0 w-full h-full bg-black/40 z-40" />
      )}
    </>
  );
};

export default MenuSidebar;
