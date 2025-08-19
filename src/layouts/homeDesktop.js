import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow, faBriefcase, faFileSignature, faSackDollar, faCheckCircle, faMapPin, faUserGroup, faNetworkWired, faClockRotateLeft, faCity,faCircleInfo, faTimes  } from "@fortawesome/free-solid-svg-icons";
import { getUserFromToken } from "../utils/jwtHelper";
import DashboardCard from "../components/DashboardCard";
import cardInfo from "../data/cardInfo";
import { cardConfig } from "../data/menuConfig";

const HomeDesktop = () => {
  const navigate = useNavigate();
  const [localTime, setLocalTime] = useState("");
  const [profile, setProfile] = useState({});
  const [roleId, setRoleId] = useState(null);
  const [perusahaanId, setPerusahaanId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [infoTitle, setInfoTitle] = useState("");

  const handleCardClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setProfile({
        nama: user.nama_user,
        role: user.role,
      });
      setRoleId(Number(user.id_role));
      setPerusahaanId(Number(user.id_perusahaan));
    } else {
      console.error("Token tidak ditemukan atau invalid.");
    }
  }, []);

  const updateLocalTime = () => {
    const time = new Date().toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    setLocalTime(time);
  };

  useEffect(() => {
    if (roleId === null) return;
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    return () => clearInterval(intervalId);
  }, [roleId]);
  
  // const allCards = [
  //   { title: "Persetujuan Presensi Harian", icon: faLocationArrow, color: "text-emerald-500", link: "/persetujuan-presensi", roles: [1, 4, 5, 6, 13, 20],},
  //   { title: "Kelola Presensi Karyawan", icon: faBriefcase, color: "text-blue-500", link: "/kelola-presensi", roles: [1, 4, 5, 6 ],},
  //   { title: "Surat Dinas", icon: faFileSignature,  color: "text-sky-500", link: "/surat-dinas", roles: [1, 4, 5, 6],},
  //   { title: "Penggajian", icon: faSackDollar, color: "text-yellow-500", link: "/penggajian",  roles: [1, 4, 6],},
  //   { title: "Persetujuan Lembur", icon: faCheckCircle, color: "text-teal-500", link: "/persetujuan-lembur", roles: [1, 4, 5, 6, 20],},
  //   { title: "Data Lokasi Presensi", icon: faMapPin, color: "text-orange-500", link: "/lokasi-presensi", roles: [1, 5],},
  //   { title: "Karyawan", icon: faUserGroup, color: "text-violet-500", link: "/karyawan", roles: [1, 4, 6],},
  //   { title: "Divisi", icon: faNetworkWired, color: "text-indigo-500", link: "/divisi", roles: [1, 4, 6],},
  //   { title: "Shift", icon: faClockRotateLeft, color: "text-rose-500", link: "/shift", roles: [1, 4, 6],},
  //   { title: "Perusahaan", icon: faCity, color: "text-blue-700", link: "/perusahaan", roles: [1, 4, 6]},
  // ];

const filteredCards = (roleId !== null && perusahaanId !== null)
  ? cardConfig.filter(card => 
      card.roles.includes(roleId) &&
      (!card.perusahaan || card.perusahaan.includes(perusahaanId))
    )
  : [];


  return (
    <div className="flex bg-gray-100">
      <div className="flex-1 bg-white rounded-lg transition-all duration-300 ease-in-out">
      <div className="relative overflow-hidden p-4 sm:p-10 rounded-2xl shadow-xl border border-white/20 bg-gradient-to-br from-green-600 to-green-500 text-white duration-300 hover:shadow-xl group">
        {/* Glow Ambient */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />

        {/* GIF Kucing di kanan bawah */}
        <div className="absolute bottom-2 right-4 w-20 sm:w-32 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none z-0">
          {/* <img src="https://i.pinimg.com/originals/fa/05/75/fa057582f44b477206a32e255bb8ca18.gif" alt="Kucing lucu" className="w-full h-auto object-contain"/> */}
        </div>

        {/* Konten */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6">
          {/* Profil & Waktu */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-sm sm:text-base font-medium text-white/80 tracking-wide">
              Selamat Datang,
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md capitalize">
              {profile.nama || "User"}
            </h3>
            <p className="text-white/80 text-xs sm:text-lg font-semibold mt-1">
              {localTime}
            </p>
          </div>

          {/* Role */}
          <div className="text-sm sm:text-base font-semibold text-white/90 sm:text-right">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full shadow-sm tracking-wide">
              {profile.role || "-"}
            </span>
          </div>
        </div>
      </div>

        <div className="mt-6">
          {filteredCards.length === 0 ? (
            <p className="text-center text-gray-400">Tidak ada data yang ditampilkan untuk role ini.</p>
          ) : (
            <div className={`grid grid-cols-2 ${filteredCards.length > 2 ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
              {filteredCards.map((card, index) => (
                <DashboardCard key={index} title={card.title} icon={card.icon} color={card.color} onClick={() => handleCardClick(card.link)} onInfoClick={(title) => {  setInfoTitle(title);   setInfoContent(cardInfo[title] || "Informasi belum tersedia.");   setShowInfoModal(true);}}/>
              ))}
            </div>

          )}
        </div>

        {showInfoModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-2xl overflow-hidden relative">
              
              {/* Header Section */}
              <div className="flex items-center justify-between px-6 py-4 bg-green-500 border-b border-gray-200">
                <h2 className="text-xl font-bold text-white">Informasi Menu</h2>
                <button className="text-white hover:text-red-500 transition-colors" onClick={() => setShowInfoModal(false)} aria-label="Tutup">
                  <FontAwesomeIcon icon={faTimes} className="text-3xl" />
                </button>
              </div>

              {/* Konten */}
              <div className="px-6 pb-7 pt-5 space-y-2">
                <h3 className="text-base sm:text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                  {infoTitle}
                </h3>
                
                {/* Wrapper untuk teks dengan scroll jika tinggi melebihi batas */}
                <div className="max-h-80 overflow-y-auto scrollbar-green pr-1">
                  <p className="text-xs sm:text-base text-gray-700 leading-relaxed whitespace-pre-line tracking-wide">
                    {infoContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDesktop;
