import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DashboardCard = ({ title, icon, color = "text-green-600", onClick }) => {
  return (
    <div onClick={onClick} className="group flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100/90 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 cursor-pointer p-4 sm:p-5 md:p-6 hover:-translate-y-1 active:scale-[0.98]">
      {/* Ikon */}
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
        <FontAwesomeIcon
          icon={icon}
          className={`text-2xl sm:text-3xl ${color} group-hover:scale-110 transition-transform duration-300`}
        />
      </div>

      {/* Judul */}
      <p className="mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-700 group-hover:text-green-700 text-center truncate max-w-[90%] transition-colors duration-300">
        {title}
      </p>
    </div>
  );
};

export default DashboardCard;
