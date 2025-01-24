import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch, faEye, faMinus } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const DataPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [payrollData, setPayrollData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(sessionStorage.getItem("startDate") || "");
  const [endDate, setEndDate] = useState(sessionStorage.getItem("endDate") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/home");
  };

  const fetchPayrollData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/payroll?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setPayrollData(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [startDate, endDate]);

  useEffect(() => {
    sessionStorage.setItem("startDate", startDate);
  }, [startDate]);

  useEffect(() => {
    sessionStorage.setItem("endDate", endDate);
  }, [endDate]);

  const getFilteredData = () => {
    return payrollData.filter(
      (item) => !searchQuery || item.nama_user.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleDetailClick = (id_user) => {
    if (startDate && endDate) {
      const url = `/data-penggajian/${id_user}`;
      navigate(url);
    } else {
      Swal.fire(
        "Error",
        "Pilih rentang tanggal terlebih dahulu untuk melihat detail atau merekap data",
        "error"
      );
    }
  };

  return (
    <div className="flex-grow min-h-screen px-6 pt-4 pb-20  ">
      <div>
        <div className="space-y-4 mb-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon
                icon={faArrowLeft}
                title="Back to Home"
                onClick={handleBackClick}
                className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
              />
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Data Penggajian</h1>
            </div>
            {/* Date Filters */}
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {/* Start Date */}
              <div className="flex flex-col items-start">
                <label htmlFor="startDate" className="block text-sm text-gray-600 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-auto"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Separator Icon */}
              <FontAwesomeIcon icon={faMinus} className="text-gray-600 hidden sm:block mx-1 pt-6" />

              {/* End Date */}
              <div className="flex flex-col items-start">
                <label htmlFor="endDate" className="block text-sm text-gray-600 mb-1">
                  End Date:
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-auto"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-10">
            <span className="absolute left-3 top-2/4 transform -translate-y-2/4 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              value={searchQuery}
              placeholder="Cari Nama Karyawan..."
              className="border border-gray-300 rounded-md w-full pl-10 py-2 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {getFilteredData().length === 0 ? (
            <div className="text-center text-gray-500">
              Silahkan pilih rentang tanggal terlebih dahulu
            </div>
          ) : (
            <div>
              {/* Tampilan mobile */}
              <div className="block lg:hidden">
                {getFilteredData().map((item, index) => (
                  <div
                    key={item.id_user}
                    className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-200"
                  >
                    <div className="mb-2 text-gray-800 font-semibold">
                      {index + 1}. {item.nama_user}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Jumlah Kehadiran:</span>
                      <span>{item.total_absen} Hari</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Total Lembur:</span>
                      <span>{item.total_jam_lembur || "0:00"}</span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="text-white px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        title="Lihat Detail"
                        onClick={() => handleDetailClick(item.id_user)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Tampilan desktop */}
              <table className="hidden lg:table min-w-full bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="bg-green-500 text-white">
                    {["No.", "Nama Karyawan", "Jumlah Kehadiran", "Total Lembur", "Menu"].map(
                      (header, index) => (
                        <th
                          key={index}
                          className={`py-1 px-4 text-center font-semibold text-sm uppercase tracking-wider ${
                            index === 0 ? "first:rounded-tl-lg" : ""
                          } ${index === 4 ? "last:rounded-tr-lg" : ""}`}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Silahkan pilih rentang tanggal terlebih dahulu
                      </td>
                    </tr>
                  ) : (
                    getFilteredData().map((item, index) => (
                      <tr
                        key={item.id_user}
                        className={`hover:bg-gray-100 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="border-b px-4 text-center">{index + 1}</td>
                        <td className="border-b px-4 text-left">{item.nama_user}</td>
                        <td className="border-b px-4 text-center">{item.total_absen} Hari</td>
                        <td className="border-b px-4 text-center">
                          {item.total_jam_lembur || "0:00"}
                        </td>
                        <td className="border-b px-4 text-center">
                          <button
                            className="text-white hover:underline px-3 my-1 py-1 bg-blue-600 rounded-lg"
                            title="Lihat Detail"
                            onClick={() => handleDetailClick(item.id_user)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPenggajian;
