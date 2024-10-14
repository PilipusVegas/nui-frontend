import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";

const DataPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [payrollData, setPayrollData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(new Date("2024-10-01"));
  const [endDate, setEndDate] = useState(new Date("2024-10-10"));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const fetchPayrollData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/payroll/`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        const aggregatedData = result.reduce((acc, current) => {
          const existing = acc[current.id_user] || {
            id_user: current.id_user,
            nama_user: current.nama_user,
            total_absen: 0,
            total_jam_lembur: "00:00",
          };

          existing.total_absen += current.total_absen;
          existing.total_jam_lembur = addTimes(existing.total_jam_lembur, current.total_jam_lembur);
          acc[current.id_user] = existing;

          return acc;
        }, {});

        setPayrollData(Object.values(aggregatedData)); // Convert object to array
      } else {
        throw new Error("Unexpected response format.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to sum time strings in the format "HH:MM"
  const addTimes = (time1, time2) => {
    const [hours1, minutes1] = time1.split(":").map(Number);
    const [hours2, minutes2] = time2.split(":").map(Number);

    let totalMinutes = minutes1 + minutes2;
    let totalHours = hours1 + hours2 + Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    return `${String(totalHours).padStart(2, "0")}:${String(totalMinutes).padStart(2, "0")}`;
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const handleDownload = () => {
    // Implement your download logic here
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              title="Back to Home"
              onClick={handleBackClick}
              className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
            />
            <h1 className="text-3xl font-bold text-gray-800 pb-1">Data Penggajian Bulanan</h1>
          </div>
          <div className="flex-grow flex justify-end">
            <input
              type="text"
              value={searchQuery}
              placeholder="Cari Nama Karyawan..."
              className="border p-2 rounded-md w-100"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex mb-4 items-center justify-between space-x-4">
          <div className="flex space-x-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                if (date) {
                  setStartDate(date);
                  if (date > endDate) {
                    setEndDate(date);
                  }
                }
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="border p-2 rounded-md"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                if (date) {
                  setEndDate(date);
                }
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="border p-2 rounded-md"
            />
            <button onClick={handleDownload} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Unduh Data
            </button>
          </div>

          <div className="flex space-x-4">
            <button onClick={handlePreviousDay} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span>{currentDate.toLocaleDateString()}</span>
            <button onClick={handleNextDay} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-green-500 text-white">
                {["No.", "Nama", "Total Absen", "Jam Lembur", "Aksi"].map((header, index) => (
                  <th key={index} className="py-2 px-4 font-semibold text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                payrollData
                  .filter((item) => item.nama_user.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, index) => (
                    <tr key={item.id_user} className="hover:bg-gray-100">
                      <td className="border px-4 py-2 text-center">{index + 1}</td>
                      <td className="border px-4 py-2 text-left">{item.nama_user}</td>
                      <td className="border px-4 py-2 text-center">{item.total_absen} Hari</td>
                      <td className="border px-4 py-2 text-center">{item.total_jam_lembur}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => navigate(`/data-penggajian/${item.id_user}`)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataPenggajian;
