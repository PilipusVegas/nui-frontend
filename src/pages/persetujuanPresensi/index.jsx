  import React, { useEffect, useState } from "react";
  import { faArrowLeft, faSearch, faExclamationTriangle, faEye, faCalendarAlt, faArrowRight,faCheck} from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { useNavigate } from "react-router-dom";
  import { fetchWithJwt, getUserFromToken  } from "../../utils/jwtHelper";

  const DataAbsensi = () => {
    const navigate = useNavigate();
    const [absenData, setAbsenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [searchDivisi, setSearchDivisi] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const handleBackClick = () => {
      navigate("/home");
    };

    const fetchAbsenData = async () => {
      setLoading(true);
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const user = getUserFromToken();
        const userRole = user?.id_role;
        let filteredData = [];
        if ([1, 4, 6,].includes(userRole)) {
          filteredData = data; // tampilkan semua
        } else if (userRole === 20) {
          filteredData = data.filter(item => item.id_role === 22);
        } else if (userRole === 5) {
          filteredData = data.filter(item => item.id_role === 3);
        } else if (userRole === 13) {
          filteredData = data.filter(item => item.id_role === 22);
        }
    
        setAbsenData(Array.isArray(filteredData) ? filteredData : []);
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
      navigate(`/persetujuan-presensi/${id}`);
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
      <div className="flex flex-col justify-start">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          {/* Kembali ke Home dan Judul */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2 sm:p-3 shadow-lg"/>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800 pb-1">Persetujuan Presensi Lapangan</h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input type="text" placeholder="Cari nama dan divisi...." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="border border-gray-300 rounded-lg p-1 py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-green-600"/>
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
                {["No.", "Nama Karyawan", "Total Absen", "Status", "Menu"].map(
                  (header) => (
                    <th key={header} className="py-2 px-4 font-semibold text-center text-sm">
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
                    <td className="text-center px-4 py-0.5 text-sm">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-0.5 tracking-wide text-left">
                      <div className="font-semibold text-xs">{absen.nama_user || "Unknown User"}</div>
                      <div className="text-xs text-gray-500">{absen.role || "Unknown Role"}</div>
                    </td>
                    <td className="text-center px-4 py-0.5 text-sm">{absen.total_absen} Hari</td>
                    <td className="text-center text-gray-700 font-semibold px-3 py-1 text-xs">
                      <div className={`inline-flex items-center justify-center gap-2 px-2.5 py-1 rounded-full shadow-sm ${parseInt(absen.unapproved) === 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                        <span className={` w-[15px] h-[15px] flex items-center justify-center  text-[9px] font-bold rounded-full bg-white  ${parseInt(absen.unapproved) === 0 ? "text-green-600" : "text-red-600"} `}>
                          {parseInt(absen.unapproved) === 0 ? (
                            <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                          ) : (
                            absen.unapproved
                          )}
                        </span>
                        <span className={`text-[11px] tracking-wide ${parseInt(absen.unapproved) === 0 ? "pr-3.5 pl-0" : "pr-0.5"}`}>
                          {parseInt(absen.unapproved) === 0 ? "Approved" : "Unapproved"}
                        </span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-1">
                      <button onClick={() => handleDetailClick(absen.id_user)} className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 transition-colors duration-150 tracking-wide">
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Detail
                      </button>
                    </td> 
                  </tr>
                ))
              ) : (
                <tr>
              <td colSpan={6} className="text-center px-6 py-8 text-lg text-gray-400">
                <div className="flex flex-col items-center justify-center space-y-2 font-semibold">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-1" />
                  <span>Tidak ada data persetujuan presensi.</span>
                </div>
              </td>
            </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile  */}
        <div className="md:hidden space-y-3">
          {currentItems.length > 0 ? (
            currentItems.map((absen) => (
              <div key={absen.id_user} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                {/* Section: Header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{absen.nama_user}</h4>
                    <span className="inline-block mt-[2px] text-[8px] font-medium text-white bg-green-500 px-2 py-[2px] rounded-full">
                      {absen.role}
                    </span>
                  </div>
                  <button onClick={() => handleDetailClick(absen.id_user)} className="flex items-center gap-1 text-sm px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-150">
                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                    Detail
                  </button>
                </div>

                {/* Section: Divider */}
                <div className="border-t border-gray-100" />

                {/* Section: Info Absen - Horizontal, sejajar */}
                <div className="px-3 py-2 text-sm text-gray-700 flex flex-wrap gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 text-xs" />
                    <span>Total: <strong>{absen.total_absen}</strong> Hari</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-xs" />
                    <span>Unapproved: <strong>{absen.unapproved}</strong></span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm">No Data Found</p>
          )}
        </div>

     {/* Pagination Modern di Bawah */}
      <div className="w-full mt-10 flex items-center justify-between relative">
        {/* Tombol Sebelumnya */}
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
            ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow-md"
            }`}
          title="Halaman Sebelumnya"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
        </button>

        {/* Indikator Tengah */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="px-6 py-2 text-sm rounded-full bg-white shadow border border-gray-200 text-gray-700 font-semibold">
            Halaman {currentPage} <span className="text-gray-400">/</span> {totalPages}
          </span>
        </div>

        {/* Tombol Selanjutnya */}
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
            ${ currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white shadow-md" }`}
          title="Halaman Berikutnya"
        >
          <FontAwesomeIcon icon={faArrowRight} className="text-lg" />
        </button>
      </div>
      </div>
    );
  };

  export default DataAbsensi;