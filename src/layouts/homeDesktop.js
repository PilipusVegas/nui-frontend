import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faSun, faCloudSun, faCloud, faCloudRain, faCloudShowersHeavy, faBolt, faSmog,} from "@fortawesome/free-solid-svg-icons";
import { getUserFromToken } from "../utils/jwtHelper";
import DashboardCard from "../components/desktop/DashboardCard";
import { cardConfig } from "../data/menuConfig";
import { formatFullDate } from "../utils/dateUtils";

const HomeDesktop = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const roleId = user ? Number(user.id_role) : null;
  const perusahaanId = user ? Number(user.id_perusahaan) : null;

  const [weather, setWeather] = useState({
    city: "Memuat...",
    temp: "--",
    description: "Mengambil data...",
    icon: faCloudSun,
    accent: "text-yellow-500",
  });

  // Fetch cuaca
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=Asia%2FJakarta`
        );
        const data = await res.json();
        const code = data.current.weather_code;

        const { desc, icon, accent } = weatherCodeToDetail(code);
        setWeather({
          city: "Lokasi Anda",
          temp: `${Math.round(data.current.temperature_2m)}°C`,
          description: desc,
          icon,
          accent,
        });
      } catch {
        setWeather({
          city: "Jakarta",
          temp: "27°C",
          description: "Berawan",
          icon: faCloud,
          accent: "text-gray-400",
        });
      }
    });
  }, []);

  // Mapping kode cuaca → deskripsi + ikon + warna
  const weatherCodeToDetail = (code) => {
    const map = {
      0: { desc: "Cerah", icon: faSun, accent: "text-yellow-400" },
      1: { desc: "Cerah Berawan", icon: faCloudSun, accent: "text-yellow-500" },
      2: { desc: "Berawan", icon: faCloud, accent: "text-gray-400" },
      3: { desc: "Mendung", icon: faSmog, accent: "text-gray-500" },
      61: { desc: "Hujan Ringan", icon: faCloudRain, accent: "text-blue-400" },
      63: { desc: "Hujan Sedang", icon: faCloudRain, accent: "text-blue-500" },
      65: { desc: "Hujan Lebat", icon: faCloudShowersHeavy, accent: "text-blue-600" },
      80: { desc: "Hujan Lokal", icon: faCloudRain, accent: "text-blue-400" },
      95: { desc: "Badai Petir", icon: faBolt, accent: "text-yellow-300" },
    };
    return map[code] || { desc: "Berawan", icon: faCloud, accent: "text-gray-400" };
  };

  // Filter menu berdasarkan role & perusahaan
  const filteredCards =
    roleId && perusahaanId
      ? cardConfig.filter(
          (card) =>
            card.roles.includes(roleId) &&
            (!card.perusahaan || card.perusahaan.includes(perusahaanId))
        )
      : [];

  return (
    <div className="flex">
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-400 text-white p-8 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-70 blur-3xl" />
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-5 right-5">
              <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold shadow-md border border-white/10">
                {user?.role || "-"}
              </span>
            </div>
            <div className="relative z-10 space-y-3">
              <p className="text-sm text-white/90">Selamat Datang,</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold capitalize drop-shadow-sm">
                {user?.nama_user || "User"}
              </h2>
            </div>

            <div className="mt-6 w-16 h-[3px] bg-white/40 rounded-full" />
          </div>

          {/* Info Card hanya di desktop */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <InfoCard icon={faCalendarAlt} label="Tanggal" value={formatFullDate(new Date())}/>
            <InfoCard icon={weather.icon} label={weather.city} value={`${weather.description} • ${weather.temp}`} accent={weather.accent}/>
          </div>
        </div>

        {/* ===== Menu Dashboard ===== */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">
              Menu Utama
            </h3>
            <span className="text-xs sm:text-sm text-gray-400">
              {filteredCards.length} menu
            </span>
          </div>

          {filteredCards.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Tidak ada data yang ditampilkan untuk role ini.
            </p>
          ) : (
            <div className={`grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 transition-all duration-300`}>
              {filteredCards.map((card, index) => (
                <DashboardCard key={index} title={card.title} icon={card.icon} color={card.color} onClick={() => navigate(card.link)}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, accent = "text-green-600" }) => (
  <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 text-center">
    <FontAwesomeIcon icon={icon} className={`${accent} text-2xl mb-2`} />
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-gray-700">{value}</p>
  </div>
);

export default HomeDesktop;