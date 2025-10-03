// src/components/Pagination.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ currentPage, totalItems, itemsPerPage = 10, onPageChange, className = "",}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const goPrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const goNext = () => currentPage < totalPages && onPageChange(currentPage + 1);

  return (
    <div
      className={`relative w-full flex justify-center items-center mt-8 text-gray-700 ${className}`}
    >
      {/* Tombol Sebelumnya */}
      <button onClick={goPrev} disabled={currentPage === 1} className={`absolute left-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white shadow-md"}`} title="Halaman Sebelumnya" >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      {/* Info Halaman */}
      <span className="text-sm font-medium px-6 py-2 rounded-full border border-gray-200 bg-white shadow-sm tracking-wide">
        Halaman {currentPage} <span className="text-gray-400">/</span> {totalPages}
      </span>

      {/* Tombol Berikutnya */}
      <button onClick={goNext} disabled={currentPage === totalPages} className={`absolute right-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700 text-white shadow-md"}`} title="Halaman Berikutnya">
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
};

export default Pagination;
