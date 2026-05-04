import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBarsStaggered,
  faUser,
  faPowerOff,
  faUserAstronaut,
  faH,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";

const Header = ({ user, toggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  if (!user) {
    return (
      <header className="h-14 w-full bg-white border-b border-gray-200/80" />
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 lg:px-3">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-600 bg-white text-green-600 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <FontAwesomeIcon icon={isSidebarOpen ? faBarsStaggered : faBars} />
          </button>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-green-600">
              {user.perusahaan ?? "-"}
            </p>
            <p className="truncate text-[11px] text-slate-600">
              Aplikasi Absensi Globalindo Group
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center">
          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileOpen((p) => !p)}
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-150 hover:bg-slate-100"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500 text-emerald-600 transition">
              <span className="text-xs font-semibold">
                {String(user.nama_user ?? "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            </div>

            {/* Nama */}
            <div className="hidden sm:flex flex-col leading-tight text-left">
              <span className="max-w-[130px] truncate text-sm font-medium text-slate-800">
                {user.nama_user}
              </span>
              <span className="text-[11px] text-slate-500">
                {user.role ?? "-"}
              </span>
            </div>
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 top-14 z-50 w-56"
            >
              {/* Caret / Arrow */}
              <div className="absolute right-4 -top-2 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white"></div>

              {/* Container */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                {/* Header */}
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user.nama_user}
                  </p>
                  <p className="text-xs text-slate-500">{user.role ?? "-"}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100" />
                {/* saya ingin menambahkan satu button ke profile sama dengan button dibawah ini navigate ke /profile */}
                <button
                  onClick={() => navigate("/profile")}
                  className="group flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50"
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-xs transition-transform duration-200 group-hover:translate-x-[1px]"
                  />
                  Profile
                </button>

                {/* Action */}
                <button
                  onClick={() =>
                    window.open("https://wa.me/6287788377420", "_blank")
                  }
                  className="group flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50"
                >
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className="text-xs transition-transform duration-200 group-hover:translate-x-[1px]"
                  />
                  Bantuan IT
                </button>

                {/* Divider */}
                <div className="h-px bg-slate-100" />

                {/* Action */}
                <button onClick={handleLogout} className="group flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-slate-50">
                  <FontAwesomeIcon
                    icon={faPowerOff}
                    className="text-xs transition-transform duration-200 group-hover:translate-x-[1px]"
                  />
                  Logout
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
