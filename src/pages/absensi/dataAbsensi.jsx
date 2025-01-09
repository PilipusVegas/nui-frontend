import React, { useEffect, useState } from "react";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailAbsensi from "./DetailAbsensi";
import { useNavigate } from "react-router-dom";

const DataAbsensi = () => {
  const navigate = useNavigate();
  const [absenData, setAbsenData] = useState([]);
  const [selectedAbsen, setSelectedAbsen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchDivisi, setSearchDivisi] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const handleBackClick = () => {
    if (selectedAbsen) {
      setSelectedAbsen(null);
    } else {
      navigate("/home");
    }
  };

  const fetchAbsenData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/absen`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAbsenData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching absen data:", err.message);
      setError(err.message);
      setAbsenData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsenDetail = async (id) => {
    if (!id) {
      console.error("Error: Missing id_absen");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/absen/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedAbsen(data);
    } catch (err) {
      console.error("Error fetching absen detail:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAbsenData();
  }, []);

  const handleDetailClick = (id) => {
    fetchAbsenDetail(id);
  };

  const filteredAbsenData = Array.isArray(absenData) ? absenData.filter((absen) => {
    const matchesName = absen.nama_user.toLowerCase().includes(searchName.toLowerCase());
    const matchesDivisi = absen.role.toLowerCase().includes(searchDivisi.toLowerCase());
    return matchesName && matchesDivisi;
  }) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAbsenData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAbsenData.length / itemsPerPage);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (selectedAbsen) {
    return <DetailAbsensi absen={selectedAbsen} onBackClick={handleBackClick} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-start p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h2 className="text-3xl font-bold text-gray-800 pb-1">Data Absensi</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border border-gray-300 rounded-lg p-1 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by Divisi"
              value={searchDivisi}
              onChange={(e) => setSearchDivisi(e.target.value)}
              className="border border-gray-300 rounded-lg p-1 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <table className="table-auto w-full border-collapse rounded-lg">
          <thead>
            <tr className="bg-green-500 text-white">
              {["No.", "Nama Karyawan", "Divisi", "Total Absen", "Data Unapproved", "Aksi"].map((header) => (
                <th key={header} className="py-1 px-4 font-semibold text-center text-sm">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((absen, index) => (
                <tr key={absen.id_user} className="border-t hover:bg-gray-50 transition-colors duration-150">
                  <td className="text-center px-4 py-1 text-sm">{indexOfFirstItem + index + 1}</td>
                  <td className="text-center px-4 py-1 text-sm">{absen.nama_user}</td>
                  <td className="text-center px-4 py-1 text-sm">{absen.role}</td>
                  <td className="text-center px-4 py-1 text-sm">{absen.total_absen} Hari</td>
                  <td className="text-center text-red-600 font-bold px-4 py-1 text-sm">{absen.unapproved} Unapproved</td>
                  <td className="text-center px-4 py-1 text-sm">
                    <button onClick={() => handleDetailClick(absen.id_user)} className="bg-blue-500 text-white px-4 py-1 text-sm rounded hover:bg-blue-600 transition-colors duration-150">
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center px-4 py-1 text-sm">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-5 rounded-full font-medium transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          &#8592;
        </button>
        <span className="px-4 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm">
         {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-5 rounded-full font-xl transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed "
              : "bg-green-600 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
         &#8594;
        </button>
      </div>
    </div>
  );
};

export default DataAbsensi;
