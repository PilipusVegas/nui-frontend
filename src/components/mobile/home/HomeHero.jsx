import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faPeopleGroup,
  faMapMarkedAlt,
  faClock,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";

const statusConfig = {
  dinas: {
    label: "Sedang Dinas",
    icon: faMapMarkedAlt,
  },
  lembur: {
    label: "Sedang Lembur",
    icon: faClock,
  },
  kunjungan: {
    label: "Sedang Kunjungan",
    icon: faMotorcycle,
  },
};

/* ===== GREEN MINIMAL BADGE ===== */
const MiniBadge = ({ icon, children, active = false }) => {
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-2 rounded-md text-[9px] border transition
      ${
        active
          ? "bg-green-500 text-white border-green-500 shadow-sm"
          : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="text-[9px]" />
      <span className="leading-none font-medium">{children}</span>
    </div>
  );
};

const HomeHero = ({ user, onLogout, activityStatus }) => {
  const active = activityStatus ? statusConfig[activityStatus] : null;

  return (
    <div className="bg-white border border-green-100 shadow-sm px-5 py-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        {/* USER INFO */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="text-sm text-green-600 font-semibold tracking-wide">
            Selamat bekerja
          </div>

          <div className="text-lg font-semibold text-gray-900 break-words leading-snug">
            {user?.nama_user || "User"}
          </div>

          {/* ROLE + STATUS */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <MiniBadge icon={faPeopleGroup}>{user?.role || "User"}</MiniBadge>
            {active && (
              <MiniBadge icon={active.icon} active>
                {active.label}
              </MiniBadge>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="shrink-0">
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs hover:bg-green-700 transition shadow-sm whitespace-nowrap">
            <FontAwesomeIcon icon={faSignOutAlt} />
            Keluar
          </button>
        </div>
      </div>

      {/* STATUS GRID */}
      <div className="mt-5">
        <div className="text-xs text-green-600 mb-2 font-medium">
          Status Aktivitas
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(statusConfig).map(([key, item]) => {
            const isActive = active?.label === item.label;

            return (
              <MiniBadge key={key} icon={item.icon} active={isActive}>
                {item.label}
              </MiniBadge>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
