import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser, faKey, faSignOutAlt, faTag } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";

const Header = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const GetNamaDivisi = (id) => {
    const roles = {
      1: "Admin Utama",
      2: "IT",
      3: "Teknisi",
      4: "Manajer HRD",
      5: "PA",
      6: "Staff HRD",
    };
    return roles[id] || "Divisi Tidak Diketahui";
  };

  const username = localStorage.getItem("nama") || "Guest";
  const roleId = localStorage.getItem("roleId");
  const role = roleId ? GetNamaDivisi(roleId) : "No Role";

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
        localStorage.clear();
        navigate("/login");
        window.location.reload();
        Swal.fire("Logout berhasil!", "Anda telah keluar dari akun.", "success");
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
  <header className="bg-gradient-to-b from-green-600 to-green-400 text-white px-4 sm:px-8 py-3 sticky top-0 z-50 rounded-b-2xl shadow-md backdrop-blur-md">
    <div className="flex items-center justify-between">
      {/* Logo + Sidebar Toggle (Mobile) */}
      <div className="flex sm:hidden w-full items-center justify-center relative">
        <FontAwesomeIcon
          icon={faBars}
          className="text-white text-lg p-2 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-300 border-2 border-transparent hover:border-white absolute left-2 active:scale-95"
          onClick={toggleSidebar}
        />

        <div className="flex flex-col items-center justify-center pl-10 select-none">
          <img src={logo} alt="PT. Nico Urban Indonesia Logo" className="h-7 sm:h-8 mb-1" />
          <span className="text-xs font-medium text-green-900 text-center drop-shadow-sm">
            PT. Nico Urban Indonesia
          </span>
        </div>
      </div>

      {/* Title (Desktop Only) */}
      <h1 className="text-lg sm:text-xl font-bold hidden sm:block tracking-wide drop-shadow-md">
        PT. Nico Urban Indonesia
      </h1>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={toggleProfile}
          className="flex items-center gap-2 text-white hover:text-green-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white shadow-inner hover:scale-105 transition-transform duration-200">
            <FontAwesomeIcon icon={faUser} className="text-xl" />
          </div>
        </button>

        {/* Profile Menu Dropdown */}
        {isProfileOpen && (
          <div
            ref={profileMenuRef}
            className="absolute right-0 mt-3 w-52 bg-white text-black rounded-xl shadow-xl border border-gray-100 animate-fade-in-up z-50"
          >
            {/* Info Pengguna */}
            <div className="flex items-center px-4 py-3 text-green-600 font-semibold">
              <FontAwesomeIcon icon={faUser} className="text-xl mr-3" />
              <div className="flex flex-col text-sm">
                <span>{username}</span>
                <span className="text-xs text-gray-500">{role}</span>
              </div>
            </div>

            <hr className="border-t border-gray-200" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-green-50 rounded-b-xl transition-all duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-green-600" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  </header>
);

};

export default Header;
