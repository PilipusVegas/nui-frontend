import React, { useEffect, useState } from "react";
import Header from "./header";
import MenuSidebar from "./menuSidebar";
import { getUserFromToken } from "../../utils/jwtHelper";

const DekstopLayout = ({ children }) => {
  const user = getUserFromToken();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 1024;
  });

  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isSidebarDesktopOpen, setIsSidebarDesktopOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarDesktopOpen(false);
      } else {
        setIsSidebarDesktopOpen(true);
        setIsSidebarMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarMobileOpen((prev) => !prev);
    } else {
      setIsSidebarDesktopOpen((prev) => !prev);
    }
  };

  if (!user) return null;

  const sidebarOpen = isMobile ? isSidebarMobileOpen : isSidebarDesktopOpen;

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      <div className="flex h-full w-full">
        {/* SIDEBAR DESKTOP (FULL HEIGHT) */}
        {!isMobile && isSidebarDesktopOpen && (
          <aside className="w-[255px] shrink-0 border-r border-emerald-200/70">
            <div className="h-full overflow-y-auto">
              <MenuSidebar
                user={user}
                toggleSidebar={toggleSidebar}
                isMobile={false}
              />
            </div>
          </aside>
        )}

        {/* RIGHT SIDE (HEADER + MAIN) */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* HEADER */}
          <Header
            user={user}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />

          {/* MAIN */}
          <main className="flex-1 min-h-0 bg-slate-50">
            <div className="h-full overflow-y-auto scrollbar-none">
              <div className="min-h-full bg-white px-4 py-4 sm:px-4 sm:py-2 sm:pb-10">
                {Array.isArray(children) ? (
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
                    {children}
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* SIDEBAR MOBILE */}
      {isMobile && isSidebarMobileOpen && (
        <div className="fixed inset-0 z-50">
          <div
            onClick={() => setIsSidebarMobileOpen(false)}
            className="absolute inset-0 bg-white/60 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white border-r border-slate-200 shadow-xl">
            <div className="h-full overflow-y-auto">
              <MenuSidebar
                user={user}
                toggleSidebar={toggleSidebar}
                isMobile={true}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default DekstopLayout;
