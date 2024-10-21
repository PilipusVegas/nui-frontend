import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft,faSearch } from "@fortawesome/free-solid-svg-icons";


const DataPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [payrollData, setPayrollData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/home");
  };

  const fetchPayrollData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/payroll/`);
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
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faArrowLeft}
              title="Back to Home"
              onClick={handleBackClick}
              className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
            />
            <h1 className="text-3xl font-bold text-gray-800">Overview Data Penggajian</h1>
          </div>
        </div>

        <div className="flex mb-4 items-center relative w-full">
      <span className="absolute left-3 top-2 text-gray-500">
        <FontAwesomeIcon icon={faSearch} />
      </span>
      <input
        type="text"
        value={searchQuery}
        placeholder="Cari Nama Karyawan..."
        className="border border-gray-300 p-2 rounded-md w-full pl-10" // padding kiri untuk ikon
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-green-500 text-white">
                {["No.", "Nama Karyawan", "Jumlah Kehadiran", "Total Lembur", "Aksi"].map((header, index) => (
                  <th key={index} className="py-3 px-4 text-center font-semibold text-sm uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!loading &&
                !error &&
                payrollData
                  .filter((item) => item.nama_user.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, index) => (
                    <tr key={item.id_user} className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="border-b px-4 py-3 text-center">{index + 1}</td>
                      <td className="border-b px-4 py-3 text-left">{item.nama_user}</td>
                      <td className="border-b px-4 py-3 text-center">{item.total_absen} Hari</td>
                      <td className="border-b px-4 py-3 text-center">{item.total_jam_lembur || "0:00"}</td>
                      <td className="border-b px-4 py-3 text-center">
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