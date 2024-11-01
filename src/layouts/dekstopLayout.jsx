import React from "react";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DekstopLayout = ({ title, header, body, customElements, currentPage, totalPages, handlePageChange }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBack}
            className="mr-4 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h2 className="text-3xl font-bold text-gray-800 pb-1">{title}</h2>
        </div>
        <div className="flex items-center space-x-2">{customElements}</div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <table className="table-auto w-full border-collapse rounded-lg">
          <thead>
            <tr className="bg-green-500 text-white">{header}</tr>
          </thead>
          <tbody>
            {body.length > 0 ? (
              body
            ) : (
              <tr>
                <td colSpan={6} className="text-center px-4 py-2">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-4">
        {totalPages > 0 ? (
          <>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-5 py-2 font-medium text-white rounded-lg shadow-md transition-colors duration-200 
        ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              Previous
            </button>
            <span className="px-5 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg shadow-md">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-5 py-2 font-medium text-white rounded-lg shadow-md transition-colors duration-200 
        ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              Next
            </button>
          </>
        ) : (
          <span className="px-5 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg shadow-md">0 / 0</span>
        )}
      </div>
    </div>
  );
};

export default DekstopLayout;
