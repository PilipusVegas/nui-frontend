import React, { useEffect, useState } from "react";
import Header from "./header";
import MenuSidebar from "./menuSidebar";
import { getUserFromToken } from "../utils/jwtHelper";

const SidebarLayout = ({ children }) => {
    const user = getUserFromToken();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
    const [isSidebarDesktopOpen, setIsSidebarDesktopOpen] = useState(true);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSidebarMobileOpen((prev) => !prev);
        } else {
            setIsSidebarDesktopOpen((prev) => !prev);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);

            if (!mobile) {
                setIsSidebarDesktopOpen(true);
                setIsSidebarMobileOpen(false);
            } else {
                setIsSidebarMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!user) {
        return null; // atau <Navigate to="/login" />
    }

    return (
        <div className="min-h-screen bg-green-900 p-1 gap-2 overflow-x-clip">
            <div className="bg-transparent rounded-2xl flex flex-col h-[calc(100vh-0.7rem)] overflow-hidden">
                <div className="h-14 bg-green-900 z-50">
                    <Header user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isMobile ? isSidebarMobileOpen : isSidebarDesktopOpen} />
                </div>

                {/* BODY */}
                <div className="flex flex-1 overflow-hidden bg-green-900 gap-3 pt-2">
                    {/* SIDEBAR DESKTOP */}
                    {!isMobile && isSidebarDesktopOpen && (
                        <div className="min-w-64 bg-white rounded-2xl shadow-lg border border-green-400 overflow-hidden">
                            <div className="h-full overflow-y-auto scrollbar-green">
                                <MenuSidebar user={user} isOpen={isSidebarDesktopOpen} toggleSidebar={toggleSidebar} isMobile={false} />
                            </div>
                        </div>
                    )}

                    {isMobile && isSidebarMobileOpen && (
                        <div className="fixed inset-0 z-50 flex">
                            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsSidebarMobileOpen(false)} />
                            <div className="h-full overflow-y-auto scrollbar-green bg-white">
                                <MenuSidebar user={user} isOpen={isSidebarMobileOpen} toggleSidebar={toggleSidebar} isMobile={true} />
                            </div>
                        </div>
                    )}

                    <main className="flex-grow h-full overflow-hidden">
                        <div className="h-full overflow-y-auto scrollbar-none">
                            {Array.isArray(children) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                                    {children.map((child, i) => (
                                        <div key={i} className="bg-white rounded-2xl shadow-md h-full overflow-y-auto scrollbar-none">
                                            {child}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-md h-full overflow-y-auto p-3 sm:p-5 scrollbar-none">
                                    {children}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SidebarLayout;
