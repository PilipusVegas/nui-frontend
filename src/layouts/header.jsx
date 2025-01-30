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
    <header className="bg-gradient-to-b from-green-600 to-green-400 text-white px-4 sm:px-8 py-2 sticky top-0 z-10 rounded-b-2xl">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex sm:hidden w-full items-center justify-center relative">
          <FontAwesomeIcon
            icon={faBars}
            className="text-white text-lg mr-3 p-2 bg-green-500 hover:bg-green-600 rounded-full transition duration-200 ease-in-out border-2 hover:border-white absolute left-1"
            onClick={toggleSidebar}
          />

          <div className="flex flex-col items-center justify-center pl-10">
            <img src={logo} alt="PT. Nico Urban Indonesia Logo" className="h-7 sm:h-7 mb-1" />
            <span className="text-xs font-medium text-green-700 text-center">
              PT. Nico Urban Indonesia
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-md font-bold text-white tracking-wider hidden sm:block">
          PT. Nico Urban Indonesia
        </h1>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={toggleProfile}
            className="flex items-center space-x-2 text-white focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex justify-center items-center border-2 border-white">
              <FontAwesomeIcon icon={faUser} className="text-xl" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg border border-transparent hover:border-gray-300 transition-all ease-in-out duration-300"
            >
              {/* Nama dan Role */}
              <div className="flex items-center px-4 py-3 text-green-600 font-semibold">
                <FontAwesomeIcon icon={faUser} className="text-2xl mr-2" />
                <div className="ml-2">
                  <div className="flex text-sm flex-col">
                    <span>{username}</span>
                    <span className="text-xs text-gray-500">{role}</span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 text-left hover:bg-green-50 rounded-b-md transition-all duration-200"
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
