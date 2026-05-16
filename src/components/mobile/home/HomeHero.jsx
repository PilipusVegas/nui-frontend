import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faPeopleGroup,
  faMapMarkedAlt,
  faClock,
  faMotorcycle,
  faMapMarkerAlt,
  faMoon,
  faSun,
  faClockRotateLeft,
  faUserTie,
  faHelmetSafety,
} from "@fortawesome/free-solid-svg-icons";
import { formatTime, formatDate, toWIB } from "../../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

const dinasConfig = {
  1: {
    label: "Jabodetabek",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  2: {
    label: "Pulau Jawa & Bali",
    sub: "Non-Jabodetabek",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  3: {
    label: "Luar Jawa & Bali",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

/* ===== MINI BADGE ===== */
const MiniBadge = ({ icon, children }) => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 rounded-md text-[9px] border bg-green-50 text-green-700 border-green-200">
      <FontAwesomeIcon icon={icon} className="text-[9px]" />
      <span className="leading-none font-medium">{children}</span>
    </div>
  );
};

/* ===== MODERN COMPACT NAVBAR ===== */
const Navbar = ({ onLogout, user }) => {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100">
      <div className="h-12 px-4 flex items-center justify-between">
        <div className="min-w-0 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="text-[12px] font-semibold text-gray-900 truncate">
              Aplikasi Absensi Online
            </h1>
            <p
              title={user?.perusahaan}
              className="text-[10px] text-gray-500 truncate max-w-[180px]"
            >
              {user?.perusahaan || "Perusahaan"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <button
          onClick={onLogout}
          className="group shrink-0 h-7 px-3 rounded-md border border-red-300 bg-red-50/70 hover:bg-red-100 text-red-600 transition-all duration-200 flex items-center gap-2"
        >
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="text-[11px] group-hover:translate-x-[1px] transition-transform"
          />
          <span className="text-[11px] font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

/* ===== ATTENDANCE CARD ===== */
const AttendanceCard = ({ attendanceData, navigate }) => {
  if (!attendanceData) return null;
  const startDate = attendanceData?.jam_mulai
    ? toWIB(attendanceData.jam_mulai)
    : null;
  const endDate = attendanceData?.jam_selesai
    ? toWIB(attendanceData.jam_selesai)
    : null;
  const isOvernight =
    startDate && endDate && startDate.toDateString() !== endDate.toDateString();
  const isNightShift = attendanceData?.shift?.toLowerCase().includes("malam");
  const startLabel = startDate ? formatDate(startDate, "EEE, dd MMM") : "-";
  const endLabel = endDate ? formatDate(endDate, "EEE, dd MMM") : null;
  const statusDinas = attendanceData?.status_dinas;

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl border border-green-300 bg-white shadow-sm">
        <div className="hover:cursor-pointer" onClick={() => navigate("/riwayat-pengguna")}>
          <div className="px-3 py-2 border-b border-green-300 bg-green-100/40">
            <div className="text-[11px] font-semibold text-green-700 leading-none">
              Aktivitas Absensi Terakhir
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="text-[10px] text-gray-700 font-medium whitespace-nowrap">
                {startLabel}
                {isOvernight && endLabel && ` → ${endLabel}`}
              </div>

              {/* RIGHT: badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                {attendanceData.shift && (
                  <div className="h-5 inline-flex items-center rounded-full bg-green-100 px-2 text-[9px] font-medium text-green-700 border border-green-200 leading-none whitespace-nowrap">
                    {attendanceData.shift}
                  </div>
                )}

                {isOvernight && (
                  <div className="h-5 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 text-[9px] font-semibold text-amber-700 leading-none whitespace-nowrap">
                    Lintas Hari
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-2 divide-x divide-green-300">
            <div className="p-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Masuk
                  </span>
                </div>
                <span className="text-[9px] text-gray-600 font-medium">
                  {startLabel}
                </span>
              </div>
              <div className="text-[16px] font-bold text-gray-900 leading-none">
                {attendanceData.jam_mulai
                  ? formatTime(attendanceData.jam_mulai)
                  : "--:--"}
              </div>

              <div className="mt-2 flex items-start gap-1 min-w-0">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mt-[2px] shrink-0 text-[10px] text-green-600"
                />
                <span className="text-[9px] text-gray-600 leading-snug line-clamp-2 break-words">
                  {attendanceData.lokasi_mulai || "Lokasi belum tersedia"}
                </span>
              </div>
            </div>

            {/* PULANG */}
            <div className="p-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Pulang
                  </span>
                </div>

                <span className="text-[9px] text-gray-600 font-medium">
                  {endLabel || "Menunggu"}
                </span>
              </div>

              <div className={`text-[16px] font-bold leading-none ${attendanceData.jam_selesai ? "text-gray-900" : "text-gray-300"}`}>
                {attendanceData.jam_selesai
                  ? formatTime(attendanceData.jam_selesai)
                  : "--:--"}
              </div>

              <div className="mt-2 flex items-start gap-1 min-w-0">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className={`mt-[2px] shrink-0 text-[10px] ${
                    attendanceData.jam_selesai
                      ? "text-green-600"
                      : "text-gray-300"
                  }`}
                />

                <span className="text-[9px] text-gray-600 leading-snug line-clamp-2 break-words">
                  {attendanceData.jam_selesai
                    ? attendanceData.lokasi_selesai || "Lokasi tidak tersedia"
                    : "Belum melakukan absen pulang"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS DINAS */}

        {statusDinas > 0 && dinasConfig[statusDinas] && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-semibold w-full justify-start ${dinasConfig[statusDinas].color}`}
          >
            <FontAwesomeIcon icon={faMapMarkedAlt} className="text-[10px]" />
            <span className="leading-tight">
              Sedang Dinas - {dinasConfig[statusDinas].label}
            </span>
            {dinasConfig[statusDinas].sub && (
              <span className="opacity-80 font-normal">
                ({dinasConfig[statusDinas].sub})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===== HOME HERO ===== */
const HomeHero = ({ user, onLogout, attendanceData }) => {
  const navigate = useNavigate();
  return (
    <>
      <Navbar onLogout={onLogout} user={user} />
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 border border-green-100 shadow-sm px-5 py-3 pb-5">
        <div className="flex items-start gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="text-xs text-green-600 font-semibold tracking-wide">
              Selamat bekerja
            </div>

            <div className="text-lg font-semibold text-gray-900 break-words leading-snug">
              {user?.nama_user || "User"}
            </div>

            {/* ROLE + STATUS */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <MiniBadge icon={faPeopleGroup}>{user?.role || "User"}</MiniBadge>
              {user?.is_leader?.status && (
                <div className="flex items-center gap-1.5 px-2 py-2 rounded-md text-[9px] border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
                  <FontAwesomeIcon
                    icon={faHelmetSafety}
                    className="text-[10px]"
                  />
                  <span className="leading-none font-semibold">
                    SPV / Kepala Tim
                  </span>
                </div>
              )}

              {/* KEPALA DIVISI */}
              {user?.is_kadiv?.status && (
                <div className="flex items-center gap-1.5 px-2 py-2 rounded-md text-[9px] border border-violet-200 bg-violet-50 text-violet-700 shadow-sm">
                  <FontAwesomeIcon icon={faUserTie} className="text-[9px]" />

                  <span className="leading-none font-semibold">
                    Kepala Divisi
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ATTENDANCE */}
        <AttendanceCard attendanceData={attendanceData} navigate={navigate} />
      </div>
    </>
  );
};

export default HomeHero;
