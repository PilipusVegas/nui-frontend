// src/components/common/Pagination.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={prevDisabled}
        title="Halaman Sebelumnya"
        className={`absolute left-0 w-10 h-10 flex items-center justify-center rounded-full transition
          ${
            prevDisabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white shadow-md"
          }`}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <span className="px-6 py-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm">
        Halaman {currentPage} <span className="text-gray-400">/</span> {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={nextDisabled}
        title="Halaman Berikutnya"
        className={`absolute right-0 w-10 h-10 flex items-center justify-center rounded-full transition
          ${
            nextDisabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-md"
          }`}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
};

export default Pagination;
