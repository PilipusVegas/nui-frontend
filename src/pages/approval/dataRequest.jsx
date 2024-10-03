import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataRequest = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [RequestData, setRequestData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleBackClick = () => navigate("/home");

  const filteredRequest = RequestData.filter((Request) => {
    const matchesSearch = Request.id_user.toString().includes(searchQuery);
    const RequestDate = new Date(Request.tanggal);
    const matchesDate =
      (selectedDay ? RequestDate.getDate() === Number(selectedDay) : true) &&
      (selectedMonth ? RequestDate.getMonth() + 1 === Number(selectedMonth) : true) &&
      (selectedYear ? RequestDate.getFullYear() === Number(selectedYear) : true);
    return matchesSearch && matchesDate;
  });

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await fetch(`${apiUrl}/overtime/`);
        const result = await response.json();
        console.log("API Response:", result);
        if (Array.isArray(result)) {
          // Filter only requests with status 0 (belum disetujui)
          const pendingRequests = result.filter(request => request.status === 0);
          setRequestData(pendingRequests);
        } else {
          setErrorMessage("Unexpected response format.");
        }
      } catch (error) {
        setErrorMessage("Kesalahan saat mengambil data Request.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequestData();
  }, [apiUrl]);

  // Generate options for day, month, and year
  const generateOptions = (count, offset = 1) => {
    return Array.from({ length: count }, (_, i) => (
      <option key={i + offset} value={i + offset}>
        {i + offset}
      </option>
    ));
  };

  // Function to handle Request status update
  const handleRequestUpdate = async (id) => {
    const RequestItem = RequestData.find(item => item.id === id);
    const newStatus = 1; // Approving request, so setting status to 1

    try {
      const response = await fetch(`${apiUrl}/overtime/status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      // Update local state
      setRequestData((prev) =>
        prev.filter((item) => item.id !== id) // Remove approved request from the list
      );
    } catch (error) {
      setErrorMessage("Kesalahan saat memperbarui status.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center"> 
            <FontAwesomeIcon
              icon={faArrowLeft}
              title="Back to Home"
              onClick={handleBackClick}
              className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
            />
            <h1 className="text-4xl font-bold text-gray-800 pb-1">Overview Request Lembur</h1>
          </div>
          {/* Filter by date using selects */}
          <div className="flex mb-4 items-center space-x-4">
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border px-2 py-2 rounded-md">
              <option value="">Tanggal</option>
              {generateOptions(31)}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-2 py-2 rounded-md"
            >
              <option value="">Bulan</option>
              {generateOptions(12)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border px-2 py-2 rounded-md">
              <option value="">Tahun</option>
              {generateOptions(5, new Date().getFullYear() - 4)}
            </select>
          </div>
        </div>

        <input
          type="text"
          value={searchQuery}
          placeholder="Cari Karyawan..."
          className="border p-2 mb-4 w-full rounded-md"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="mb-8">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
                <tr>
                  <th className="py-3 pl-3 text-center">No.</th>
                  <th className="py-3 pl-6 pr-6 text-center">Nama Karyawan</th>
                  <th className="py-3 pl-6 text-center">Tanggal</th>
                  <th className="py-3 pl-6 text-center">Lokasi</th>
                  <th className="py-3 pl-6 text-center">Deskripsi</th>
                  <th className="py-3 pl-6 text-center">Jam Mulai</th>
                  <th className="py-3 pl-6 text-center">Jam Selesai</th>
                  <th className="py-3 pl-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredRequest.length > 0 ? (
                  filteredRequest.map((Request, index) => (
                    <tr key={Request.id} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 pl-6 text-center">{index + 1}</td>
                      <td className="py-3 pl-6 pr-6 text-center">{Request.nama}</td>
                      <td className="py-3 pl-6 text-center">{new Date(Request.tanggal).toLocaleDateString()}</td>
                      <td className="py-3 pl-6 text-center">{Request.lokasi}</td>
                      <td className="py-3 pl-6 text-center">{Request.deskripsi}</td>
                      <td className="py-3 pl-6 text-center">{Request.jam_mulai}</td>
                      <td className="py-3 pl-6 text-center">{Request.jam_selesai}</td>
                      <td className="py-3 pl-6 text-center space-x-2">
                        <button
                          onClick={() => handleRequestUpdate(Request.id)}
                          className="text-white font-bold px-5 py-1 rounded bg-green-500 hover:bg-green-600"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRequest;
