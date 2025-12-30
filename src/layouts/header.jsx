import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser, faBarsStaggered, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { getUserFromToken } from "../utils/jwtHelper";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const user = getUserFromToken();
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleLogout = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan keluar dari akun Anda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // Bersihkan token
        localStorage.removeItem("token");

        // Redirect paksa ke login
        window.location.href = "/login";

        // ❌ Jangan pakai Swal.fire lagi di sini, karena halaman akan berubah
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-green-500 text-white px-3 sm:px-6 py-2.5 sticky top-0 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <FontAwesomeIcon icon={isSidebarOpen ? faBarsStaggered : faBars} className="text-white text-lg sm:text-xl p-2 rounded-2xl border border-white/20 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200 active:scale-95 backdrop-blur-sm bg-white/5" onClick={toggleSidebar} />
          <div className="flex flex-col">
            <span className="text-md sm:text-lg font-bold tracking-wide text-white/90 drop-shadow-sm hover:text-white transition-colors duration-200">
              {user.perusahaan}
            </span>
          </div>

        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="hidden sm:flex flex-col items-end text-sm text-white leading-tight">
            <span className="font-semibold tracking-wide capitalize">{user.nama_user}</span>
            <span className="text-white/80 text-xs italic">{user.role}</span>
          </div>

          <button onClick={toggleProfile} className="relative w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 flex items-center justify-center group border-double border-white/80 border-2" aria-label="Buka Profil">
            <FontAwesomeIcon icon={faUser} className="text-white text-base" />
            <div className="absolute inset-0 rounded-full border border-white/40 group-hover:border-white/80 transition-all duration-300 pointer-events-none" />
          </button>

          {isProfileOpen && (
            <div ref={profileMenuRef} className="absolute right-0 top-14 w-64 bg-white text-gray-800 text-sm rounded-2xl shadow-2xl ring-1 ring-black/10 animate-fade-in-up overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                  <FontAwesomeIcon icon={faUser} className="text-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 leading-snug">
                    {user.nama_user}
                  </span>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>
              </div>

              <div className="py-1.5">
                <button onClick={handleLogout} className="w-full px-5 py-1 flex items-center gap-3 hover:bg-red-50 text-red-600 font-medium transition-all duration-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500">
                    <FontAwesomeIcon icon={faPowerOff} />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
