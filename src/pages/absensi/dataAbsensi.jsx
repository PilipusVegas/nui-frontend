import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataAbsensi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [absenData, setAbsenData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleBackClick = () => navigate("/home");

  const filteredAbsen = absenData.filter((absen) => {
    return absen.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    const fetchAbsenData = async () => {
      try {
        const response = await fetch(`${apiUrl}/absen/`);
        const result = await response.json();
        console.log("API Response:", result);
        if (Array.isArray(result)) {
          setAbsenData(result);
        } else {
          setErrorMessage("Unexpected response format.");
        }
      } catch (error) {
        setErrorMessage("Kesalahan saat mengambil data absen.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAbsenData();
  }, [apiUrl]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
            <h1 className="text-4xl font-bold text-gray-800 pb-1">DATA ABSENSI</h1>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 font-bold rounded-md hover:bg-green-700 transition duration-150">Tambah Karyawan</button>
        </div>
        <input type="text" value={searchQuery} placeholder="Cari Karyawan..." className="border p-2 mb-4 w-full rounded-md" onChange={(e) => setSearchQuery(e.target.value)}/>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="mb-8">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
                <tr>
                  <th className="py-3 pl-3 text-left">No.</th>
                  <th className="py-3 pl-6 pr-6 text-left">Username</th>
                  <th className="py-3 pl-6 text-left">Lokasi</th>
                  <th className="py-3 pl-6 text-left">Deskripsi</th>
                  <th className="py-3 px-6 text-left">Jam Mulai</th>
                  <th className="py-3 px-6 text-left">Jam Selesai</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredAbsen.length > 0 ? (
                  filteredAbsen.map((absen, index) => (
                    <tr key={absen.id_absen} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 pl-6 text-left">{index + 1}</td>
                      <td className="py-3 pl-6 pr-6 text-left">{absen.username}</td>
                      <td className="py-3 pl-6 text-left">{absen.lokasi}</td>
                      <td className="py-3 pl-6 text-left">{absen.deskripsi}</td>
                      <td className="py-3 pl-6 text-left">{new Date(absen.jam_mulai).toLocaleString()}</td>
                      <td className="py-3 pl-6 text-left">{new Date(absen.jam_selesai).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-3 text-center">Tidak ada data absen ditemukan</td>
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

export default DataAbsensi;
