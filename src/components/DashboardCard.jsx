import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

const DashboardCard = ({ title, icon, color = "text-green-600", onClick, onInfoClick }) => (
  <div onClick={onClick} className="group relative flex flex-col justify-between p-5 bg-white rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-green-300/50 hover:-translate-y-1">
    {/* Tombol Info */}
    <button onClick={(e) => { e.stopPropagation(); onInfoClick(title);}} className="absolute top-2 right-2 text-blue-400 hover:text-blue-500">
      <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
    </button>

    {/* Ikon */}
    <div className="relative w-14 h-14 mx-auto flex items-center justify-center mb-4">
      <div className="absolute inset-0 rounded-full bg-white shadow-inner border border-gray-100 group-hover:scale-95" />
      <FontAwesomeIcon icon={icon} className={`relative z-10 text-2xl ${color} group-hover:scale-125 group-hover:rotate-[6deg]`}/>
    </div>

    {/* Judul */}
    <div className="text-center">
      <p className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-green-700 tracking-wide line-clamp-2">
        {title}
      </p>
    </div>
  </div>
);

export default DashboardCard;
