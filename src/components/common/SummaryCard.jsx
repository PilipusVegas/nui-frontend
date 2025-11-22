import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SummaryCard = ({ icon, title, value }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200/60 p-3 sm:p-3.5 sm:py-2.5 flex items-center gap-3">

            <div className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FontAwesomeIcon icon={icon} className="text-base md:text-lg" />
            </div>

            <div className="flex flex-col leading-[1.1]">
                <p className="text-[10px] sm:text-xs md:text-xs text-gray-700 font-medium tracking-wide">
                    {title}
                </p>
                <p className="text-sm sm:text-lg md:text-lg font-semibold text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default SummaryCard;
