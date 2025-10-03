import React from "react";

const LoadingSpinner = ({ message = "Mohon tunggu, data sedang diproses..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-4 border-green-500 rounded-full opacity-30"></div>
                <div className="absolute inset-0 border-4 border-t-green-600 border-b-green-600 rounded-full animate-spin"></div>
            </div>

            <p className="mt-4 text-gray-700 font-medium text-sm text-center animate-pulse">
                {message}
            </p>
            <span className="mt-2 text-xs text-gray-500 text-center">
                Terima kasih atas kesabaran Anda :)
            </span>
        </div>
    );
};

export default LoadingSpinner;
