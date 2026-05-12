import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faPenFancy,
  faPeopleGroup,
  faClockFour,
  faTasks,
  faMotorcycle,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import SectionCard from "../SectionCard";

const menuItems = [
  {
    key: "absensi",
    icon: faCalendarCheck,
    label: "Absensi",
    path: "/absensi",
    iconColor: "text-emerald-700",
    bgColor: "from-emerald-100 via-emerald-200 to-emerald-200",
  },
  {
    key: "lembur",
    icon: faClockFour,
    label: "Formulir Lembur",
    path: "/lembur",
    iconColor: "text-teal-700",
    bgColor: "from-teal-100 via-teal-200 to-teal-200",
  },
  {
    key: "dinas",
    icon: faPenFancy,
    label: "Formulir Dinas",
    path: "/formulir-dinas-aplikasi",
    iconColor: "text-blue-700",
    bgColor: "from-blue-100 via-blue-200 to-blue-200",
  },
  {
    key: "tugas",
    icon: faTasks,
    label: "Tugas",
    path: "/tugas",
    iconColor: "text-lime-700",
    bgColor: "from-lime-100 via-lime-200 to-lime-200",
  },
  {
    key: "nos",
    image: "/NOS.png",
    label: "NOS",
    external: "https://nos.nicourbanindonesia.com/mypanel/maintenance",
    bgColor: "from-slate-100 via-slate-200 to-slate-300",
  },
];

const MenuItem = ({
  icon,
  image,
  label,
  onClick,
  iconColor = "text-green-600",
  bgColor = "from-green-100 via-green-200 to-green-300",
  hasNotification,
}) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer select-none transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0.5">
    <div className="relative">
      <div
        className={`
          w-11 h-11 flex items-center justify-center
          rounded-lg
          bg-gradient-to-br ${bgColor}
          ${iconColor}
          shadow-sm
          border border-white/50

          transition-all duration-200 ease-out

          hover:brightness-110 hover:shadow-md hover:scale-[1.05]
          active:scale-95 active:brightness-95
        `}
      >
        {icon && <FontAwesomeIcon icon={icon} className="text-[18px]" />}

        {image && (
          <img src={image} alt={label} className="w-6 h-6 object-contain" />
        )}
      </div>

      {/* NOTIFICATION */}
      {hasNotification && (
        <>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-600 border border-white" />
        </>
      )}
    </div>

    {/* Label */}
    <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">
      {label.split(" ").map((word, index) => (
        <span key={index} className="block">
          {word}
        </span>
      ))}
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
      {/* HEADER */}
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-gray-700">
        <FontAwesomeIcon
          icon={faLayerGroup}
          className="text-green-600 text-[12px]"
        />
        Menu Utama
      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-x-1.5 gap-y-4">
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
