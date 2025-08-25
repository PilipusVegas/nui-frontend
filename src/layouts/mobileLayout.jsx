import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const MobileLayout = ({ title, children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1) ? navigate(-1) : navigate("/home");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-green-700 text-white shadow-md rounded-b-2xl">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-green-600 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-semibold tracking-wide">
          {title}
        </h1>

        {/* Spacer biar seimbang */}
        <div className="w-9"></div>
      </header>

      {/* Main content */}
      <main className="flex-grow px-4 py-3 overflow-auto rounded-t-3xl bg-white shadow-inner">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
