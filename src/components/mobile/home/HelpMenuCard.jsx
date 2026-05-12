import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import SectionCard from "../SectionCard";
import { getUserFromToken } from "../../../utils/jwtHelper";

const helpItems = [
  {
    key: "it",
    icon: faWhatsapp,
    label: "Tim IT",
    phone: "6287788377420",
    message:
      "Halo Tim IT, saya mengalami kendala pada sistem aplikasi dan membutuhkan bantuan. Mohon arahan dan solusinya. Terima kasih.",
  },
  {
    key: "hrd",
    icon: faWhatsapp,
    label: "Tim HRD",
    phone: "6282181525235",
    message:
      "Halo Tim HRD, saya ingin menyampaikan pertanyaan terkait data atau kepegawaian. Mohon informasi dan bantuannya. Terima kasih.",
  },
];

const HelpMenuCard = ({ items = helpItems }) => {
  // Ambil user langsung dari token
  const user = getUserFromToken();

  const handleOpenWhatsapp = (phone, message) => {
    const name = user?.nama_user || "User";

    const finalMessage = encodeURIComponent(
      `Halo, saya ${name}.\n\n${message}`
    );

    window.open(
      `https://wa.me/${phone}?text=${finalMessage}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <SectionCard>
      {/* HEADER */}
      <div className="flex items-center gap-2 text-xs mb-4">
        <FontAwesomeIcon
          icon={faHeadset}
          className="text-green-600 text-sm"
        />
        <p className="font-semibold text-gray-900 tracking-wide">
          Bantuan & Support
        </p>
      </div>

      {/* HORIZONTAL CARDS */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() =>
              handleOpenWhatsapp(item.phone, item.message)
            }
            className="min-w-[190px] flex items-center gap-3 px-4 py-3
                       bg-white border border-gray-200 rounded-xl
                       hover:border-green-400 hover:bg-green-50
                       transition-all duration-200 active:scale-[0.98]"
          >
            {/* ICON */}
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-green-600 text-lg"
              />
            </div>

            {/* TEXT */}
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[11px] text-gray-500">
                Klik untuk chat
              </span>

              <span className="text-sm font-semibold text-gray-800 truncate">
                {item.label}
              </span>

              <span className="text-[10px] text-green-600 font-medium">
                WhatsApp Support
              </span>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
};

export default HelpMenuCard;