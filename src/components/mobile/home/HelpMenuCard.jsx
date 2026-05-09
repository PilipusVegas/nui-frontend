import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import SectionCard from "../SectionCard";

const helpItems = [
  {
    key: "it",
    icon: faWhatsapp,
    label: "Team IT",
    sublabel: "Hubungi",
    phone: "6287788377420",
  },
  {
    key: "hrd",
    icon: faWhatsapp,
    label: "HRD Office",
    sublabel: "Hubungi",
    phone: "6282181525235",
  },
];

const HelpMenuCard = ({ items = helpItems }) => {
  const handleOpenWhatsapp = (phone) => {
    window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer");
  };

  return (
    <SectionCard>
      <div className="mb-4">
        <p className="text-sm font-semibold text-black">Menu Bantuan</p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => handleOpenWhatsapp(item.phone)}
            className="group flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 hover:shadow-md hover:border-green-300 hover:bg-green-50 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-center w-11 h-11 bg-green-100 rounded-full shrink-0 group-hover:bg-green-200 transition-colors duration-200">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-green-600 text-xl"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-gray-400 leading-tight">
                {item.sublabel}
              </span>
              <span className="text-sm font-semibold text-gray-800 truncate">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default HelpMenuCard;