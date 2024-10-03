import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataApproval = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(0); // Default to "Belum Disetujui"
  const [selectedDay, setSelectedDay] = useState(""); // Day filter
  const [selectedMonth, setSelectedMonth] = useState(""); // Month filter
  const [selectedYear, setSelectedYear] = useState(""); // Year filter
  const [errorMessage, setErrorMessage] = useState("");

  const handleBackClick = () => navigate("/home");

  const fetchApprovalData = async () => {
    try {
      const response = await fetch(`${apiUrl}/overtime/`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setApprovalData(result);
      } else {
        setErrorMessage("Unexpected response format.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, [apiUrl]);

  // Generate arrays for day, month and year
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { name: "Januari", value: "01" },
    { name: "Februari", value: "02" },
    { name: "Maret", value: "03" },
    { name: "April", value: "04" },
    { name: "Mei", value: "05" },
    { name: "Juni", value: "06" },
    { name: "Juli", value: "07" },
    { name: "Agustus", value: "08" },
    { name: "September", value: "09" },
    { name: "Oktober", value: "10" },
    { name: "November", value: "11" },
    { name: "Desember", value: "12" },
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Function to filter by name, status, and date
  const filteredApproval = approvalData.filter((approval) => {
    const matchesSearch = approval.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = approval.status === selectedStatus;
    const matchesDate =
      (selectedDay === "" || new Date(approval.tanggal).getDate() === parseInt(selectedDay)) &&
      (selectedMonth === "" || new Date(approval.tanggal).getMonth() + 1 === parseInt(selectedMonth)) &&
      (selectedYear === "" || new Date(approval.tanggal).getFullYear() === parseInt(selectedYear));

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Function to handle approval action
  const handleApprove = (id) => {
    Swal.fire("Approved!", "", "success");
  };

  // Function to handle rejection action
  const handleReject = (id) => {
    Swal.fire("Rejected!", "", "error");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-start p-6">
      <div className="flex items-center space-x-3 mb-6 justify-between">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon
            icon={faArrowLeft}
            onClick={handleBackClick}
            className="text-gray-600 cursor-pointer hover:text-green-600 transition duration-200"
          />
          <h1 className="text-3xl font-semibold text-gray-800">Overview Data Approval</h1>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          placeholder="Cari Nama Karyawan..."
          className="border border-gray-300 p-2 rounded-lg w-full max-w-md"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-6 flex justify-between items-center">
        {/* Status Toggle */}
        <div className="flex space-x-3">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStatus === 0 ? "bg-yellow-400 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus(0)}
          >
            Permohonan Lembur
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStatus === 1 ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus(1)}
          >
            Disetujui
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStatus === 2 ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus(2)}
          >
            Ditolak
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex space-x-2">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
          >
            <option value="" className="text-gray-400">
              Tanggal
            </option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
          >
            <option value="" className="text-gray-400">
              Bulan
            </option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
          >
            <option value="" className="text-gray-400">
              Tahun
            </option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : errorMessage ? (
        <p className="text-red-500 text-center">{errorMessage}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-green-600 text-white uppercase text-sm">
              <tr>
                <th className="py-3 px-4 text-left">No.</th>
                <th className="py-3 px-4 text-left">Nama Karyawan</th>
                <th className="py-3 px-4 text-left">Tanggal</th>
                <th className="py-3 px-4 text-left">Lokasi</th>
                <th className="py-3 px-4 text-left">Deskripsi</th>
                <th className="py-3 px-4 text-left">Jam Mulai</th>
                <th className="py-3 px-4 text-left">Jam Selesai</th>
                {/* Remove Status column when selectedStatus is 0 */}
                {selectedStatus !== 0 && <th className="py-3 px-4 text-left">Status</th>}
                {selectedStatus === 0 && <th className="py-3 px-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredApproval.length > 0 ? (
                filteredApproval.map((approval, index) => (
                  <tr key={approval.id} className="hover:bg-gray-100 border-b border-gray-200">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{approval.nama}</td>
                    <td className="py-3 px-4">{new Date(approval.tanggal).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{approval.lokasi}</td>
                    <td className="py-3 px-4">{approval.deskripsi}</td>
                    <td className="py-3 px-4">{approval.jam_mulai}</td>
                    <td className="py-3 px-4">{approval.jam_selesai}</td>
                    {/* Show Status or Action based on selectedStatus */}
                    {selectedStatus !== 0 ? (
                      <td
                        className={`py-3 px-4 font-semibold ${
                          approval.status === 0
                            ? "text-yellow-500"
                            : approval.status === 1
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {approval.status === 0 ? "Belum Disetujui" : approval.status === 1 ? "Disetujui" : "Ditolak"}
                      </td>
                    ) : (
                      <td className="py-3 px-4 flex justify-center space-x-2">
                        <button
                          className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 transition duration-200"
                          onClick={() => handleApprove(approval.id)}
                        >
                          Setujui
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200"
                          onClick={() => handleReject(approval.id)}
                        >
                          Tolak
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedStatus === 0 ? 7 : 8} className="py-3 px-4 text-center">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataApproval;
