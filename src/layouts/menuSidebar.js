import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faDashboard,
  faCheckSquare,
  faBook,
  faBars,
  faChevronRight,
  faTimes, 
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";

const IconButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex items-center p-3 transition-colors duration-300 rounded-full w-full text-left ${
      isActive ? "bg-green-700" : "hover:bg-green-900"
    }`}
  >
    <FontAwesomeIcon icon={icon} className="text-xl mr-3" />
    <span>{label}</span>
  </button>
);

const ButtonHide = ({ onClick, hidden }) => (
  <button onClick={onClick} className="text-right mb-4">
    <FontAwesomeIcon icon={hidden ? faArrowAltCircleRight :faArrowAltCircleLeft } className="text-3xl" />
  </button>
);

const MenuSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false); // State untuk collapse/expand sidebar
  const [isMobile, setIsMobile] = useState(false); // State untuk mendeteksi layar mobile
  const [isOpen, setIsOpen] = useState(false); // State untuk toggle sidebar di mobile

  // Deteksi apakah layar adalah mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Cek saat pertama kali
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Toggle Button (Hanya untuk Mobile, jika sidebar tertutup) */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed top-[300px] left-[-9px] z-50 px-2 py-5 bg-green-600 text-white rounded-lg shadow-lg"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full bg-gradient-to-b from-green-900 to-green-600 text-white p-4 shadow-md z-40 transition-transform duration-300 ${
                isOpen ? "translate-x-0 w-full" : "-translate-x-full"
              }`
            : `flex ${
                hidden ? "w-16" : "w-64"
              } h-screen sticky top-0 left-0 bg-gradient-to-b from-green-900 to-green-600 text-white flex-col p-4 shadow-md transition-all duration-300`
        }`}
      >
        {/* Tombol Close (Mobile, jika sidebar terbuka) */}
        {isMobile && isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 px-3 py-2 bg-green-600 text-white rounded-full shadow-lg"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        )}

        {/* Tombol Hide (Desktop) */}
        {!isMobile && <ButtonHide onClick={() => setHidden(!hidden)} hidden={hidden} />}

        {/* Konten Sidebar */}
        {!hidden && (
          <>
            <p className="text-sm mt-12 sm:mt-0 mb-3">Menu</p>
            <div className="flex flex-col gap-2">
              <IconButton
                icon={faDashboard}
                label="Dashboard"
                onClick={() => {
                  navigate("/home");
                  if (isMobile) setIsOpen(false); // Tutup sidebar jika di mobile
                }}
                isActive={location.pathname === "/home"}
              />
              <IconButton
                icon={faCheckSquare}
                label="Absensi"
                onClick={() => {
                  navigate("/data-absensi");
                  if (isMobile) setIsOpen(false);
                }}
                isActive={location.pathname === "/data-absensi"}
              />
              <IconButton
                icon={faBook}
                label="Penggajian"
                onClick={() => {
                  navigate("/data-penggajian");
                  if (isMobile) setIsOpen(false);
                }}
                isActive={location.pathname === "/data-penggajian"}
              />
            </div>
            <p className="text-sm my-4">Lainnya</p>
            <div className="flex flex-col gap-2">
              <IconButton
                label="Logout"
                icon={faSignOutAlt}
                onClick={handleLogout}
                isActive={false} // Logout biasanya tidak memiliki status aktif
              />
            </div>
          </>
        )}
      </div>

      {/* Background Overlay untuk Mobile */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
};

export default MenuSidebar;
