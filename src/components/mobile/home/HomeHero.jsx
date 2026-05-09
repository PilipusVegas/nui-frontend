import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faPeopleGroup,
  faMapMarkedAlt,
  faClock,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "../../common/Badge";

const statusConfig = {
  dinas: {
    label: "Sedang Dinas",
    icon: <FontAwesomeIcon icon={faMapMarkedAlt} />,
    variant: "warning",
  },
  lembur: {
    label: "Sedang Lembur",
    icon: <FontAwesomeIcon icon={faClock} />,
    variant: "danger",
  },
  kunjungan: {
    label: "Sedang Kunjungan",
    icon: <FontAwesomeIcon icon={faMotorcycle} />,
    variant: "purple",
  },
};

const HomeHero = ({ user, onLogout, activityStatus }) => {
  const status = activityStatus ? statusConfig[activityStatus] : null;

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-700 px-5 pt-10 pb-14 relative">
      <button
        onClick={onLogout}
        title="Logout"
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-md bg-white/70 text-red-500 hover:bg-white hover:text-red-600 transition-colors"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
      </button>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-medium text-white/90 tracking-wide">
          Selamat Bekerja,
        </h2>

        <div className="text-2xl font-bold text-white drop-shadow-sm">
          {user?.nama_user || "User"}
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          <Badge
            variant="white"
            tone="soft"
            size="md"
            icon={<FontAwesomeIcon icon={faPeopleGroup} />}
            rounded="lg"
          >
            {user?.role || "N/A"}
          </Badge>

          {status && (
            <Badge
              variant={status.variant}
              tone="solid"
              size="md"
              icon={status.icon}
              rounded="lg"
            >
              {status.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeHero;