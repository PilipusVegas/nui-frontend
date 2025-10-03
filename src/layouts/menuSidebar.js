import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faAngleDown, } from "@fortawesome/free-solid-svg-icons";
import { menuConfig } from "../data/menuConfig";

const IconButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`
        flex items-center w-full p-2.5 my-1 rounded-xl text-sm font-medium tracking-wide
        transition-all duration-200 ease-in-out overflow-hidden
        ${isActive
        ? `
              bg-white/20
              backdrop-blur-xl
              border border-white/20
              shadow-sm shadow-black/20
              text-white font-semibold
              ring-1 ring-white/10
            `
        : `
              text-white/80
              hover:text-white
              hover:bg-white/10
              hover:backdrop-blur-sm
              hover:shadow-md hover:shadow-black/10
            `
      }
      `}
  >
    <div className="flex items-center gap-3 transition-transform duration-500 ease-in-out group-hover:translate-x-1">
      <div className="w-6 h-6 flex items-center justify-center">
        <FontAwesomeIcon icon={icon} className={`text-xl transition-colors duration-500 ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}`} />
      </div>
      <span className="truncate">{label}</span>
    </div>
  </button>
);


const MenuSidebar = ({ perusahaanId, roleId, isOpen, toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const filteredMenuGroups = menuConfig.map(group => {
    const filteredItems = group.items.filter(item =>
      item.roles.includes(roleId) &&
      (!item.perusahaan || item.perusahaan.includes(perusahaanId))
    );
    return filteredItems.length ? { ...group, items: filteredItems } : null;
  }).filter(Boolean);


  return (
    <>
      <div className={`${isMobile ? `fixed top-0 left-0 h-full max-w-[80%] w-full bg-white/10 backdrop-blur-lg border-r border-white/20 text-white shadow-md z-50 pt-5 transition-transform duration-700 ${isOpen ? "translate-x-0" : "-translate-x-full"}` : `flex flex-col h-full left-0 py-5 px-0 bg-green-500 text-white shadow-md transition-all duration-700`}`}>
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
                    <p className="text-xs text-white/95 tracking-widest font-semibold uppercase drop-shadow-sm">
                      {group.sectionTitle}
                    </p>
                  </div>
                </div>
              )}

              {group.items.map((menu, index) => {
                const isActive = location.pathname === menu.path;
                const hasActiveSubmenu = menu.submenu?.some(sub => location.pathname === sub.path) || false;
                const submenuKey = `${groupIndex}-${index}`;
                const isSubmenuOpen = openSubmenu === submenuKey;

                return (
                  <div key={index}>
                    {!menu.submenu ? (
                      <IconButton label={menu.label} icon={menu.icon} onClick={() => { menu.isAction ? menu.onClick() : navigate(menu.path); if (isMobile) toggleSidebar(); }} isActive={isActive} />
                    ) : (
                      <>
                        {/* Menu Induk */}
                        <button onClick={() => setOpenSubmenu(isSubmenuOpen ? null : submenuKey)} className={`w-full flex items-center justify-between p-3 p-2.5 my-0.5 rounded-xl transition-all duration-300 ${hasActiveSubmenu ? "bg-green-400/30 backdrop-blur-md border border-white/30 text-white font-extrabold shadow-xl shadow-green-500/20" : "hover:bg-white/10 text-white/90"}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center">
                              <FontAwesomeIcon icon={menu.icon} className="text-lg" />
                            </div>
                            <span className={`text-sm font-medium transition-transform duration-200 hover:translate-x-2 ${hasActiveSubmenu ? "font-extrabold" : ""}`}>
                              {menu.label}
                            </span>
                          </div>
                          <FontAwesomeIcon icon={faAngleDown} className={`transition-transform duration-300 ${isSubmenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Submenu */}
                        {menu.submenu &&
                          menu.submenu
                            .filter(
                              sub =>
                                sub.roles.includes(roleId) &&
                                (!sub.perusahaan || sub.perusahaan.includes(perusahaanId))
                            ).length > 0 &&
                          isSubmenuOpen && (
                            <div className="flex flex-col ml-3.5 mt-2 space-y-1">
                              {menu.submenu
                                .filter(
                                  sub =>
                                    sub.roles.includes(roleId) &&
                                    (!sub.perusahaan || sub.perusahaan.includes(perusahaanId))
                                )
                                .map((sub, subIndex) => {
                                  const isActiveSubmenu = location.pathname === sub.path;
                                  return (
                                    <button key={subIndex} onClick={() => {
                                      if (sub.target === "_blank") {
                                        window.open(sub.path, "_blank", "noopener,noreferrer");
                                      } else {
                                        navigate(sub.path);
                                      }
                                      if (isMobile) toggleSidebar();
                                    }}
                                      className={`group flex items-center w-full text-left text-sm rounded-xl p-2.5 pl-5 transition-all duration-300 ${isActiveSubmenu ? `bg-white/25 backdrop-blur-lg border border-white/20 shadow-md shadow-green-400/30 text-white font-semibold ring-1 ring-white/10` : `hover:bg-white/10 hover:backdrop-blur-sm text-white/80 hover:text-white`}`}>
                                      <FontAwesomeIcon icon={faArrowRight} className={`mr-1.5 text-xs transition-transform duration-300  ${isActiveSubmenu ? "text-white rotate-0" : "group-hover:translate-x-1"}`} />
                                      <span className={`transition-transform duration-300  ${isActiveSubmenu ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                                        {sub.label}
                                      </span>
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

      </div>
      {/* Overlay Hitam Saat Sidebar Terbuka */}
      {isMobile && isOpen && (
        <div onClick={toggleSidebar} className="fixed top-0 left-0 w-full h-full bg-black/40 z-40" />
      )}
    </>
  );
};

export default MenuSidebar;
