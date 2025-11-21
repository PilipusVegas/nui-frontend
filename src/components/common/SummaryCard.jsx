import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SummaryCard = ({ icon, title, value }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-green-200">
            <div className=" hidden sm:flex w-11 h-11  md:w-12 md:h-12 items-center justify-center  rounded-xl  bg-green-50  text-green-600  shadow-inner">
                <FontAwesomeIcon icon={icon} className="text-lg md:text-xl" />
            </div>

            <div className="flex flex-col">
                <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-600 tracking-wide">
                    {title}
                </p>

                <p className="text-md sm:text-lg md:text-xl font-bold  text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default SummaryCard;
