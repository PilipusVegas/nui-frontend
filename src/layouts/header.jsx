import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser, faSignOutAlt, faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getUserFromToken } from "../utils/jwtHelper";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
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
    <header className="bg-green-600 text-white px-3 sm:px-6 py-2 sticky top-0 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between">
        {/* Sidebar & Brand */}
        <div className="flex items-center gap-3">
          {/* Tombol Toggle Sidebar - Timeless, tanpa warna tapi timbul */}
          <FontAwesomeIcon icon={isSidebarOpen ? faBars : faBarsStaggered} className="text-white text-xl p-2 rounded-xl border border-white/30 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200 active:scale-95 backdrop-blur-sm" onClick={toggleSidebar} />
          {/* Brand */}
          <h1 className="text-sm sm:text-xl font-semibold tracking-wide whitespace-nowrap text-white drop-shadow-md">
            {user.perusahaan}
          </h1>
        </div>

        <div className="relative flex items-center gap-2.5">
          {/* Info User */}
          <div className="hidden sm:flex flex-col items-end text-sm text-white leading-tight">
            <span className="font-semibold tracking-tight tracking-wide capitalize">{user.nama_user}</span>
            <span className="text-white/80 text-xs italic">{user.role}</span>
          </div>

          {/* Tombol Profil */}
          <button onClick={toggleProfile} className="relative w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 flex items-center justify-center group border-double border-white/80 border-2" aria-label="Buka Profil">
            <FontAwesomeIcon icon={faUser} className="text-white text-base" />
            <div className="absolute inset-0 rounded-full border border-white/40 group-hover:border-white/80 transition-all duration-300 pointer-events-none" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div ref={profileMenuRef} className="absolute right-0 top-14 w-60 bg-white text-gray-800 text-sm rounded-xl shadow-xl ring-1 ring-black/10 animate-fade-in-up overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <FontAwesomeIcon icon={faUser} className="text-green-600 text-lg" />
                <div className="flex flex-col">
                  <span className="font-semibold leading-snug">{user.nama_user}</span>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red-50 text-red-600 font-medium transition-all duration-200">
                <FontAwesomeIcon icon={faSignOutAlt} className="text-red-500" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
