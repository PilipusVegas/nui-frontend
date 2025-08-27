import React from "react";

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            {/* Spinner lingkaran */}
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>

            {/* Teks dengan animasi blink */}
            <p className="mt-4 text-gray-600 font-medium tracking-wide animate-pulse">
                Sedang memuat data...
            </p>
        </div>
    );
};

export default LoadingSpinner;
