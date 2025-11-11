import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const SectionHeader = ({ title, subtitle, onBack, actions }) => {
    return (
        <div className=" w-full mb-4 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink">
                {onBack && (
                    <FontAwesomeIcon icon={faArrowLeft} onClick={onBack} title="Kembali" className="cursor-pointer text-white bg-green-500 hover:bg-green-600 transition rounded-full p-2.5 sm:p-4 shadow-lg" />
                )}

                <div className="flex flex-col leading-tight">
                    <h1 className="text-sm sm:text-xl font-bold text-gray-800">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[11px] sm:text-sm text-gray-600 tracking-tight">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Kanan: Actions sejajar penuh */}
            {actions && (
                <div className="flex items-center flex-shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default SectionHeader;
