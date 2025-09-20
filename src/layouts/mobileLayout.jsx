import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

const MobileLayout = ({ title, children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1) ? navigate(-1) : navigate("/home");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="relative flex items-center justify-between px-4 py-2 bg-green-500 text-white shadow-sm">
        <button onClick={handleBack} className="px-2 py-1 rounded-full hover:bg-white/50 transition-all">
          <FontAwesomeIcon icon={faArrowLeftLong} className="h-4 w-4" />
        </button>

        {/* Title selalu center */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-medium tracking-wider text-center">
          {title}
        </h1>

        {/* Spacer biar tombol kiri ga ganggu justify-between */}
        <div className="w-7"></div>
      </header>


      {/* Main content */}
      <main className="flex-grow px-3 py-2 overflow-auto rounded-t-xl bg-white shadow-inner">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;