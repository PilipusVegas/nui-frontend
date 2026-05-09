import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faPenFancy,
  faPeopleGroup,
  faClockFour,
  faTasks,
  faMotorcycle,
  faTableCellsLarge,
  faGrip,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import SectionCard from "../SectionCard";

const menuItems = [
  {
    key: "absensi",
    icon: faCalendarCheck,
    label: "Absensi",
    path: "/absensi",
    iconColor: "text-emerald-600",
    bgColor: "from-emerald-50 to-emerald-100",
  },
  {
    key: "lembur",
    icon: faClockFour,
    label: "Lembur",
    path: "/lembur",
    iconColor: "text-teal-600",
    bgColor: "from-teal-50 to-teal-100",
  },
  {
    key: "dinas",
    icon: faPenFancy,
    label: "Dinas",
    path: "/formulir-dinas-aplikasi",
    iconColor: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    key: "tugas",
    icon: faTasks,
    label: "Tugas",
    path: "/tugas",
    iconColor: "text-lime-600",
    bgColor: "from-lime-50 to-lime-100",
  },
  {
    key: "nos",
    image: "/NOS.png",
    label: "NOS",
    external: "https://nos.nicourbanindonesia.com/mypanel/maintenance",
    bgColor: "from-gray-50 to-gray-100",
  },
];

const MenuItem = ({
  icon,
  image,
  label,
  onClick,
  iconColor = "text-green-600",
  bgColor = "from-green-50 to-green-100",
  hasNotification,
}) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 cursor-pointer"
  >
    <div className="relative transition-transform duration-200 active:scale-90 hover:scale-105">
      {icon && (
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgColor} ${iconColor} shadow-sm`}
        >
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
      )}

      {image && (
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgColor} shadow-sm`}
        >
          <img src={image} alt={label} className="w-8 h-8 object-contain" />
        </div>
      )}

      {hasNotification && (
        <>
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
        </>
      )}
    </div>

    <span className="text-[11px] font-medium text-gray-600 select-none tracking-wide text-center leading-tight">
      {label}
    </span>
  </div>
);

const MainMenuCard = ({ user, isTripReady, loadingTripStatus }) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.external) {
      window.open(item.external, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.path);
    }
  };

  return (
    <SectionCard>
      <div className="mb-4 flex items-center gap-2 text-xs">
        <FontAwesomeIcon icon={faLayerGroup} className="text-green-700" />

        <p className="font-semibold tracking-wide">
          Menu Utama
        </p>
      </div>

      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            icon={item.icon}
            image={item.image}
            label={item.label}
            iconColor={item.iconColor}
            bgColor={item.bgColor}
            onClick={() => handleClick(item)}
          />
        ))}

        {user?.is_leader?.status === true && (
          <MenuItem
            icon={faPeopleGroup}
            label="Absensi Tim"
            iconColor="text-orange-600"
            bgColor="from-orange-50 to-orange-100"
            onClick={() => navigate("/absensi-tim")}
          />
        )}

        {!loadingTripStatus && isTripReady && (
          <MenuItem
            icon={faMotorcycle}
            label="Kunjungan"
            iconColor="text-indigo-600"
            bgColor="from-indigo-50 to-indigo-100"
            onClick={() => navigate("/kunjungan")}
          />
        )}
      </div>
    </SectionCard>
  );
};

export default MainMenuCard;
