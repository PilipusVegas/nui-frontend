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

  const goPrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const goNext = () =>
    currentPage < totalPages && onPageChange(currentPage + 1);

  return (
    <div className={`mt-6 flex items-center justify-between ${className}`}>
      {/* PREV */}
      <button
        onClick={goPrev}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          text-sm font-medium transition-all duration-200
          ${
            currentPage === 1
              ? "border-slate-400 text-slate-400 cursor-not-allowed"
              : "border-green-400 text-green-600 hover:border-green-400 hover:bg-green-50"
          }
        `}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Prev</span>
      </button>

      {/* PAGE INFO */}
      <div
        className="
    px-4 py-2 rounded-md border border-green-200
    bg-gradient-to-br from-green-300 via-white to-green-300/50
    text-sm text-green-700
    shadow-[0_3px_10px_rgba(34,197,94,0.08)]
  "
      >
        <span className="text-green-600 font-semibold">{currentPage}</span>
        <span className="mx-1 text-green-400">/</span>
        <span className="text-green-700 font-medium">{totalPages}</span>
      </div>

      {/* NEXT */}
      <button
        onClick={goNext}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          text-sm font-medium transition-all duration-200
          ${
            currentPage === totalPages
              ? "border-slate-400 text-slate-400 cursor-not-allowed"
              : "border-green-400 text-green-600 hover:border-green-400 hover:bg-green-50"
          }
        `}
      >
        <span>Next</span>
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
};

export default Pagination;
