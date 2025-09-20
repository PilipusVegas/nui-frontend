import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { getUserFromToken } from "../utils/jwtHelper";
import DashboardCard from "../components/desktop/DashboardCard";
import cardInfo from "../data/cardInfo";
import { cardConfig } from "../data/menuConfig";

const HomeDesktop = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const roleId = user ? Number(user.id_role) : null;
  const perusahaanId = user ? Number(user.id_perusahaan) : null;
  const [localTime, setLocalTime] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [infoTitle, setInfoTitle] = useState("");

  // fungsi update jam
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
    if (!roleId) return;
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    return () => clearInterval(intervalId);
  }, [roleId]);

  // filter card berdasarkan role & perusahaan
  const filteredCards =
    roleId && perusahaanId
      ? cardConfig.filter(
          (card) =>
            card.roles.includes(roleId) &&
            (!card.perusahaan || card.perusahaan.includes(perusahaanId))
        )
      : [];

  return (
    <div className="flex bg-gray-100">
      <div className="flex-1 bg-white rounded-lg transition-all duration-300 ease-in-out">
        <div className="relative overflow-hidden p-4 sm:p-10 rounded-2xl shadow-xl border border-white/20 bg-gradient-to-br from-green-500 to-green-400 text-white duration-300 hover:shadow-xl group">
          {/* Glow Ambient */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />

          {/* Konten Profil */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-sm sm:text-base font-medium text-white/80 tracking-wide">
                Selamat Datang,
              </h2>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md capitalize">
                {user?.nama_user || "User"}
              </h3>
              <p className="text-white/80 text-xs sm:text-lg font-semibold mt-1">
                {localTime}
              </p>
            </div>

            {/* Role */}
            <div className="text-sm sm:text-base font-semibold text-white/90 sm:text-right">
              <span className="inline-block bg-white/20 px-4 py-1 rounded-full shadow-sm tracking-wide">
                {user?.role || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6">
          {filteredCards.length === 0 ? (
            <p className="text-center text-gray-400">
              Tidak ada data yang ditampilkan untuk role ini.
            </p>
          ) : (
            <div  className={`grid grid-cols-2 ${ filteredCards.length > 2 ? "md:grid-cols-4" : "md:grid-cols-2" } gap-4`}>
              {filteredCards.map((card, index) => (
                <DashboardCard key={index} title={card.title} icon={card.icon} color={card.color} onClick={() => navigate(card.link)} onInfoClick={(title) => { setInfoTitle(title); setInfoContent( cardInfo[title] || "Informasi belum tersedia."); setShowInfoModal(true); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Info */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between px-6 py-4 bg-green-500 border-b border-gray-200">
                <h2 className="text-xl font-bold text-white">Informasi Menu</h2>
                <button className="text-white hover:text-red-500 transition-colors" onClick={() => setShowInfoModal(false)} aria-label="Tutup">
                  <FontAwesomeIcon icon={faTimes} className="text-3xl" />
                </button>
              </div>
              <div className="px-6 pb-7 pt-5 space-y-2">
                <h3 className="text-base sm:text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                  {infoTitle}
                </h3>
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