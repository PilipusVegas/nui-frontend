import {
  faSun,
  faCloudSun,
  faCloud,
  faSmog,
  faCloudRain,
  faCloudShowersHeavy,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

export const weatherCodeToDetail = (code) => {
  const map = {
    0: { desc: "Cerah", icon: faSun, accent: "text-yellow-400" },
    1: { desc: "Cerah Berawan", icon: faCloudSun, accent: "text-yellow-500" },
    2: { desc: "Berawan", icon: faCloud, accent: "text-slate-400" },
    3: { desc: "Mendung", icon: faSmog, accent: "text-slate-500" },
    61: { desc: "Hujan Ringan", icon: faCloudRain, accent: "text-sky-400" },
    63: { desc: "Hujan Sedang", icon: faCloudRain, accent: "text-sky-500" },
    65: { desc: "Hujan Lebat", icon: faCloudShowersHeavy, accent: "text-sky-600" },
    80: { desc: "Hujan Lokal", icon: faCloudRain, accent: "text-sky-400" },
    95: { desc: "Badai Petir", icon: faBolt, accent: "text-amber-400" },
  };

  return map[code] || { desc: "Berawan", icon: faCloud, accent: "text-slate-400" };
};