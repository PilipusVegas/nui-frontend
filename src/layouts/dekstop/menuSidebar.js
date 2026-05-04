import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faCircleInfo,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { menuConfig } from "../../data/menuConfig";
import { SearchBar } from "../../components";

/* ================= ITEM ================= */
const MenuItemButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`group flex w-full items-center gap-2 px-2 py-2 text-[14px] transition rounded-md
      ${
        isActive
          ? "bg-green-500 text-white font-bold"
          : "text-gray-800 hover:bg-green-50 font-semibold"
      }`}
  >
    <span
      className={`flex h-6 w-6 items-center justify-center rounded
        ${isActive ? " text-white" : "text-gray-700"}`}
    >
      <FontAwesomeIcon icon={icon} className="text-[14px]" />
    </span>

    <span className="truncate">{label}</span>
  </button>
);

/* ================= MAIN ================= */
const MenuSidebar = ({ user, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const role = Number(user?.id_role ?? 0);
  const perusahaan = Number(user?.id_perusahaan ?? 0);

  const filteredMenuGroups = useMemo(() => {
    if (!user) return [];

    const query = searchQuery.toLowerCase();

    return menuConfig
      .map((group) => {
        const items = group.items
          .map((item) => {
            // filter submenu dulu
            const filteredSubmenu = item.submenu
              ? item.submenu.filter(
                  (sub) =>
                    sub.roles.includes(role) &&
                    (!sub.perusahaan || sub.perusahaan.includes(perusahaan)) &&
                    sub.label.toLowerCase().includes(query),
                )
              : [];

            const isMatch = item.label.toLowerCase().includes(query);

            // logic:
            // tampilkan jika:
            // - menu match
            // - ATAU ada submenu yang match
            if (isMatch || filteredSubmenu.length > 0) {
              return {
                ...item,
                submenu:
                  filteredSubmenu.length > 0 ? filteredSubmenu : item.submenu,
              };
            }

            return null;
          })
          .filter(Boolean)
          .filter(
            (item) =>
              item.roles.includes(role) &&
              (!item.perusahaan || item.perusahaan.includes(perusahaan)),
          );

        return items.length ? { ...group, items } : null;
      })
      .filter(Boolean);
  }, [user, role, perusahaan, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setOpenSubmenu(null); // reset dulu
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;

    let foundKey = null;

    filteredMenuGroups.forEach((group, groupIndex) => {
      group.items.forEach((menu, index) => {
        if (menu.submenu?.some((sub) => sub.path === location.pathname)) {
          foundKey = `${groupIndex}-${index}`;
        }
      });
    });

    if (foundKey) setOpenSubmenu(foundKey);
  }, [location.pathname, filteredMenuGroups, user]);

  if (!user) return null;

  return (
    <div className="flex h-full flex-col bg-white text-green-800">
      <div className="border-b border-green-200/70 px-3 py-2.5">
        <div className="space-y-2.5">
          {/* USER INFO */}
          <div
            onClick={() => navigate("/profile")}
            className="group flex items-center gap-3 cursor-pointer select-none"
          >
            {/* AVATAR */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-green-400/60 bg-gradient-to-br from-green-200 via-white to-green-200/60 text-green-900 shadow-[0_2px_6px_rgba(16,185,129,0.12)] ring-1 ring-green-400/10">
              <span className="absolute inset-0 rounded-xl bg-white/30 opacity-40 pointer-events-none" />
              <span className="relative text-xs font-semibold tracking-[0.08em]">
                {String(user.nama_user ?? "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            </div>

            {/* TEXT */}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13.5px] font-semibold text-green-900 group-hover:underline">
                {user.nama_user}
              </p>
              <p className="truncate text-[11px] font-medium text-green-700/70">
                {user.perusahaan ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 py-3">
        {" "}
        <div className="py-0">

        {/* SEARCH */}
        <SearchBar
          placeholder="Telusuri menu..."
          className="w-full"
          inputClassName="
          rounded-full
          border-green-300
          focus:border-green-500
          focus:ring-green-200
        "
          onSearch={(val) => setSearchQuery(val)}
        />
        </div>
        {filteredMenuGroups.length === 0 ? (
          <div className="text-center text-sm text-slate-400 mt-4 break-words">
            Menu "{searchQuery}" tidak ditemukan
          </div>
        ) : (
          filteredMenuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-2">
              {/* SECTION */}
              {group.sectionTitle && (
                <div className="px-2 pt-2 pb-1">
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-500">
                    {group.sectionTitle}
                  </span>
                </div>
              )}

              <div className="space-y-[2px]">
                {group.items.map((menu, index) => {
                  const isActive = location.pathname === menu.path;
                  const submenuKey = `${groupIndex}-${index}`;
                  const isSubmenuOpen = searchQuery
                    ? true
                    : openSubmenu === submenuKey;
                  const activeSubmenu = menu.submenu?.some(
                    (sub) => location.pathname === sub.path,
                  );

                  const visibleSubmenu = menu.submenu ?? [];

                  return (
                    <div key={index}>
                      {!menu.submenu ? (
                        <MenuItemButton
                          label={menu.label}
                          icon={menu.icon}
                          onClick={() => {
                            navigate(menu.path);
                            if (isMobile) toggleSidebar();
                          }}
                          isActive={isActive}
                        />
                      ) : (
                        <>
                          {/* PARENT */}
                          <button
                            onClick={() =>
                              setOpenSubmenu(isSubmenuOpen ? null : submenuKey)
                            }
                            className={`flex w-full items-center justify-between px-2 py-2 text-[13px] transition rounded-md
                            ${
                              activeSubmenu
                                ? "bg-green-500 text-white font-bold"
                                : "text-slate-900 hover:bg-green-50 font-semibold"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded
                                ${
                                  activeSubmenu
                                    ? "text-white"
                                    : "text-slate-600"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={menu.icon}
                                  className="text-[14px]"
                                />
                              </span>
                              <span>{menu.label}</span>
                            </div>
                            <FontAwesomeIcon
                              icon={faAngleDown}
                              className={`text-[10px] transition ${isSubmenuOpen ? "rotate-180" : ""}`}
                            />
                          </button>

                          {/* SUBMENU */}
                          {isSubmenuOpen && visibleSubmenu.length > 0 && (
                            <div className="ml-4 mt-1 relative">
                              {/* MAIN VERTICAL LINE */}
                              <div className="absolute left-0 top-2 bottom-2 w-[1.5px] bg-slate-500" />

                              <div className="space-y-[2px]">
                                {visibleSubmenu.map((sub, subIndex) => {
                                  const isActiveSubmenu =
                                    location.pathname === sub.path;

                                  const isLast =
                                    subIndex === visibleSubmenu.length - 1;

                                  return (
                                    <div key={subIndex} className="relative pl-4">
                                      {/* CUT LINE (BIAR GA SAMPAI BAWAH) */}
                                      {isLast && (
                                        <span className="absolute left-0 top-1/2 bottom-0 w-[2px] bg-white" />
                                      )}

                                      {/* HORIZONTAL CONNECTOR */}
                                      <span className="absolute left-0 top-1/2 h-[1.5px] w-3 -translate-y-1/2 bg-slate-500" />

                                      <button
                                        onClick={() => {
                                          navigate(sub.path);
                                          if (isMobile) toggleSidebar();
                                        }}
                                        className={`relative flex w-full items-center px-2 py-1 text-[12.5px] transition-all duration-200
                                      ${isActiveSubmenu ? "text-slate-900 font-bold before:opacity-100 before:translate-x-0" : "text-slate-800 font-normal before:opacity-0 before:-translate-x-1"}
                                      before:content-['']
                                      before:absolute before:left-[-3px] before:top-1/2 before:-translate-y-1/2
                                      before:border-t-[4px] before:border-b-[4px] before:border-l-[6px]
                                      before:border-t-transparent before:border-b-transparent before:border-l-slate-600
                                      before:transition-all before:duration-200
                                    `}
                                      >
                                        {sub.label}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuSidebar;
