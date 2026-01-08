import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBarsStaggered, faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";

const Header = ({ user, toggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return <header className="h-14 bg-green-500" />;
  }

  const handleLogout = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan keluar dari akun Anda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) logout();
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-green-500 text-white border-b border-white/20">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-white/20">
            <FontAwesomeIcon icon={isSidebarOpen ? faBarsStaggered : faBars} />
          </button>
          <span className="font-semibold">{user.perusahaan ?? "-"}</span>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold">{user.nama_user}</span>
            <span className="text-xs opacity-80">{user.role}</span>
          </div>

          <button
            onClick={() => setIsProfileOpen((p) => !p)}
            className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faUser} />
          </button>

          {isProfileOpen && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 top-12 w-48 bg-white text-gray-800 rounded-xl shadow-xl"
            >
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
              >
                <FontAwesomeIcon icon={faPowerOff} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
