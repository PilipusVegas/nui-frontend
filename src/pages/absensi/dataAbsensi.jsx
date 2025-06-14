  import React, { useEffect, useState } from "react";
  import { faArrowLeft, faSearch, faExclamationTriangle, faEye, faCalendarAlt} from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { useNavigate } from "react-router-dom";

  const DataAbsensi = () => {
    const navigate = useNavigate();
    const [absenData, setAbsenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [searchDivisi, setSearchDivisi] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const handleBackClick = () => {
      navigate("/home");
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

    useEffect(() => {
      fetchAbsenData();
    }, []);

    const handleDetailClick = (id) => {
      navigate(`/data-absensi/${id}`);
    };

    const filteredAbsenData = absenData.filter((absen) => {
      const searchTerm = searchName.toLowerCase();
      return (
        absen.nama_user.toLowerCase().includes(searchTerm) ||
        absen.role.toLowerCase().includes(searchTerm)
      );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAbsenData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAbsenData.length / itemsPerPage);

    return (
      <div className="max-h-screen flex flex-col justify-start px-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          {/* Kembali ke Home dan Judul */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
            <h2 className="text-3xl font-bold text-gray-800 pb-1">Data Absensi Lapangan</h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input type="text" placeholder="Search by Name or Divisi" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="border border-gray-300 rounded-lg p-1 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-green-600"/>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
        </div>

        {/* Tabel untuk Desktop */}
        <div className="hidden md:block rounded-lg shadow-md overflow-hidden">
          <table className="table-auto w-full border-collapse rounded-lg bg-white">
            <thead>
              <tr className="bg-green-600 text-white">
                {["No.", "Nama Karyawan", "Divisi", "Total Absen", "Status", "Menu"].map(
                  (header) => (
                    <th key={header} className="py-1 px-4 font-semibold text-center text-sm">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((absen, index) => (
                  <tr key={absen.id_user} className="border-t hover:bg-gray-50 transition-colors duration-150">
                    <td className="text-center px-4 py-1 text-sm">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-1 text-sm">{absen.nama_user}</td>
                    <td className="text-center px-4 py-1 text-sm">{absen.role}</td>
                    <td className="text-center px-4 py-1 text-sm">{absen.total_absen} Hari</td>
                    <td className="text-center text-gray-600 font-bold px-2 py-1 text-xs">
                      <span className="text-white bg-gray-500 text-[10px] rounded-full py-1 px-2 mr-2">
                        {absen.unapproved}
                      </span>
                      Unapproved
                    </td>

                    <td className="text-center px-4 py-1">
                      <button onClick={() => handleDetailClick(absen.id_user)} className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 transition-colors duration-150">
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Detail
                      </button>
                    </td> 
                  </tr>
                ))
              ) : (
                <tr>
              <td colSpan={6} className="text-center px-6 py-8 text-lg text-gray-400 animate-pulse">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mb-1" />
                  <span>Data tidak ditemukan</span>
                </div>
              </td>
            </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-2">
        {currentItems.length > 0 ? (
          currentItems.map((absen, index) => (
            <div key={absen.id_user} className="px-4 py-3 rounded-lg shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-gray-800">{absen.nama_user}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-white bg-green-500 px-2 py-1 rounded-full">
                    {absen.role}
                  </span>
                  <button onClick={() => handleDetailClick(absen.id_user)} className="flex items-center justify-center bg-blue-500 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-600 transition-all duration-150">
                  <FontAwesomeIcon icon={faEye} className=" text-sm" />
                  Detail
                </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <p className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 mr-2" />
                  <span>
                    Total Absen: <strong>{absen.total_absen} Hari</strong>
                  </span>
                </p>
                <p className="flex items-center text-sm text-red-600">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
                  <span>
                    Unapproved: <strong>{absen.unapproved}</strong>
                  </span>
                </p>
              </div>

              {/* Button */}
              <div className="mt-4 flex justify-end">
                
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm">No Data Found</p>
        )}
      </div>

        {/* Pagination Controls */}
        <div className="flex justify-center pb-6 pt-3 space-x-2">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
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
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-5 rounded-full font-xl transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
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