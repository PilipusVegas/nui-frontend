// components/SectionHeader.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const SectionHeader = ({ title, subtitle, onBack, actions }) => {
    return (
        <div className="flex items-center justify-between mb-5 w-full">
            {/* Kiri: Back + Judul + Subtitle */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
                {onBack && (
                    <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition rounded-full p-2.5 sm:p-4 shadow-lg" onClick={onBack} title="Kembali" />
                )}
                <div className="flex flex-col justify-center">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[9px] sm:text-sm text-gray-600 leading-relaxed font-medium -mt-0.5">
                            {subtitle}  
                        </p>
                    )}
                </div>
            </div>

            {/* Kanan: Actions (button/filter/apa saja) */}
            <div className="flex items-center space-x-2">{actions}</div>
        </div>
    );
};

export default SectionHeader;
