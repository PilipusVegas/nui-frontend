import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const SummaryCard = ({
    icon,
    title,
    value,
    note,
    onClick,
    showArrow = true,
}) => {
    const isClickable = typeof onClick === "function";

    return (
        <div
            onClick={isClickable ? onClick : undefined}
            className={`relative bg-white rounded-lg border border-gray-200/60 
                        p-3 sm:p-4 transition
                        ${isClickable 
                            ? "cursor-pointer hover:shadow-md hover:border-green-400" 
                            : "cursor-default"
                        }`}
        >
            {/* Ikon + Text */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <FontAwesomeIcon icon={icon} className="text-lg" />
                </div>

                <div className="flex flex-col leading-tight">
                    <p className="text-[10px] sm:text-xs font-medium text-gray-700 tracking-wide">
                        {title}
                    </p>

                    <p className="text-sm sm:text-lg font-semibold text-gray-900">
                        {value}
                    </p>
                </div>
            </div>

            {/* NOTE DI POJOK KANAN BAWAH */}
            {note && (
                <div className="absolute bottom-2 right-3 flex items-center gap-1">
                    <span className="text-[10px] sm:text-[11px] text-green-600 font-medium hover:underline">
                        {note}
                    </span>

                    {showArrow && (
                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-[8px] sm:text-[9px] text-green-600"
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SummaryCard;
