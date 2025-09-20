import React from "react";

const LoadingSpinner = ({ message = "Mohon tunggu, data sedang diproses..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="w-14 h-14 border-4 border-green-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
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
