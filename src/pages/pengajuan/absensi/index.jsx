import React, { useEffect, useState } from "react";
import { faCheck, faEye, faExclamationTriangle, faCalendarAlt, faCheckCircle, faSortDown, faSortUp, faCalendarXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import SectionHeader from "../../../components/desktop/SectionHeader";
import { LoadingSpinner, ErrorState, SearchBar, Pagination, EmptyState, SummaryCard } from "../../../components";

const DataAbsensi = () => {
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [absenData, setAbsenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const user = getUserFromToken();

  const handleSortStatus = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const fetchAbsenData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithJwt(`${apiUrl}/absen`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result?.data;

      setAbsenData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching absen data:", err);
      setError(err.message);
      setAbsenData([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAbsenData();
  }, []);

  const filteredAbsenData = React.useMemo(() => {
    const term = searchName.toLowerCase();
    let data = absenData.filter(
      (absen) =>
        (absen.nama || "").toLowerCase().includes(term) ||
        (absen.role || "").toLowerCase().includes(term)
    );

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => Number(a.unapproved) - Number(b.unapproved));
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => Number(b.unapproved) - Number(a.unapproved));
    }
    return data;
  }, [absenData, searchName, sortOrder]);


  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredAbsenData.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );

  return (
    <div className="flex flex-col justify-start">
      <SectionHeader title="Persetujuan Absensi Lapangan" subtitle="Monitoring kehadiran karyawan lapangan secara real-time setiap hari." onBack={() => navigate("/home")} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard icon={faCheckCircle} title="Total Karyawan Lapangan" value={absenData.length} />
        <SummaryCard icon={faCalendarXmark} title="Data Absensi Abnormal" value={absenData.reduce((sum, d) => sum + Number(d.unapproved || 0), 0)} note={[1, 4].includes(user?.id_role) ? "Lihat semua Data" : undefined} onClick={[1, 4].includes(user?.id_role) ? () => navigate("/pengajuan-absensi/batch") : undefined} />
      </div>

      <SearchBar onSearch={(val) => { setSearchName(val); setCurrentPage(1); }} placeholder="Cari nama dan divisi..." className="mb-4" />

      <div className="hidden md:block rounded-lg shadow-md overflow-hidden">
        <table className="table-auto w-full border-collapse bg-white">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="py-3 px-4 font-semibold text-center text-sm">No.</th>
              <th className="py-3 px-4 font-semibold text-center text-sm">Nama Karyawan</th>
              <th className="py-3 px-4 font-semibold text-center text-sm">Total Absen</th>
              <th className="py-3 px-4 font-semibold text-center text-sm cursor-pointer" onClick={handleSortStatus}>
                <div className="flex items-center justify-center gap-3">
                  Status
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faSortUp : faSortDown} className="text-xs" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center text-sm">Menu</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-8">
                  <LoadingSpinner text="Memuat data absensi..." />
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="py-8">
                  <ErrorState message={error} onRetry={fetchAbsenData} />
                </td>
              </tr>
            )}
            {!loading && !error && currentItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8">
                  <EmptyState icon={faExclamationTriangle} title="Tidak ada data persetujuan presensi." />
                </td>
              </tr>
            )}
            {!loading && !error && currentItems.map((absen, idx) => (
              <tr key={absen.id_user} className="border-t hover:bg-gray-50 transition-colors duration-150">
                <td className="text-center px-4 py-0.5 text-sm">
                  {idx + 1 + (currentPage - 1) * itemsPerPage}
                </td>
                <td className="px-4 py-0.5 text-left">
                  <div className="font-semibold text-xs">
                    {absen.nama || "Unknown User"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {absen.role || "Unknown Role"}
                  </div>
                </td>
                <td className="text-center px-4 py-0.5 text-sm">
                  {absen.total_absen} Hari
                </td>
                <td className="text-center font-semibold px-3 py-1 text-xs">
                  <div className={`inline-flex items-center justify-center gap-2 px-2.5 py-1 rounded-full shadow-sm ${parseInt(absen.unapproved) === 0 ? "bg-green-500 text-white px-1" : "bg-red-500 text-white"}`}>
                    <span className={`w-[15px] h-[15px] flex items-center justify-center text-[9px] font-bold rounded-full bg-white ${parseInt(absen.unapproved) === 0 ? "text-green-600 mr-3" : "text-red-600"}`}>
                      {parseInt(absen.unapproved) === 0 ? (
                        <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                      ) : (
                        absen.unapproved
                      )}
                    </span>
                    <span className="text-[11px] tracking-wide">
                      {parseInt(absen.unapproved) === 0 ? "Approved" : "Unapproved"}
                    </span>
                  </div>
                </td>
                <td className="text-center px-4 py-1">
                  <button onClick={() => navigate(`/pengajuan-absensi/${absen.id_user}`)} className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 transition-colors duration-150">
                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {currentItems.map((absen) => {
          const isApproved = Number(absen.unapproved) === 0;

          return (
            <div key={absen.id_user} onClick={() => navigate(`/pengajuan-absensi/${absen.id_user}`)} className="cursor-pointer rounded-lg bg-white shadow hover:shadow-md hover:ring-1 hover:ring-blue-200 transition-all duration-150">
              <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900">{absen.nama}</h4>
                <p className="text-xs text-gray-500">{absen.role}</p>
              </div>

              <div className="flex justify-between items-center px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-sm font-semibold text-gray-800">
                      {absen.total_absen} Hari
                    </span>
                    <span className="text-[11px] text-gray-500">Total Hadir</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isApproved ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}`}>
                    <FontAwesomeIcon icon={isApproved ? faCheckCircle : faExclamationTriangle} className="text-sm" />
                  </div>
                  <div className="leading-tight">
                    {isApproved ? (
                      <span className="block text-sm font-medium text-gray-700">
                        Semua disetujui
                      </span>
                    ) : (
                      <span className="block text-sm font-medium text-red-500">
                        {absen.unapproved} Menunggu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination currentPage={currentPage} totalItems={filteredAbsenData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default DataAbsensi;
