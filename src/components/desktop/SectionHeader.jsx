import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const SectionHeader = ({ title, subtitle, onBack, actions }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 w-full gap-4">
            {/* Kiri: Back di tengah, Text (title+subtitle) */}
            <div className="flex items-center space-x-3">
                {onBack && (
                    <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-500 hover:bg-green-600 transition rounded-full p-3.5 sm:p-4 shadow-lg self-center" onClick={onBack} title="Kembali"/>
                )}
                <div className="flex flex-col justify-center">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Kanan: Actions */}
            {actions && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default SectionHeader;
