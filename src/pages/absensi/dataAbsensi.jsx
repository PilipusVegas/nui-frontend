import * as XLSX from "xlsx";
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
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const handleBackClick = () => navigate("/home");
  const handleCloseModal = () => setSelectedImage(null);

  const filteredAbsen = absenData.filter((absen) =>
    absen.nama ? absen.nama.toLowerCase().includes(searchQuery.toLowerCase()) : false
  );

  const openGoogleMaps = (lat, lon) => {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, "_blank");
  };

  const toggleRowExpansion = (id_absen) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [id_absen]: !prevExpandedRows[id_absen],
    }));
  };

  const downloadData = () => {
    const header = ["NO.", "NAMA", "LOKASI", "TUGAS", "TANGGAL IN", "JAM IN", "LOKASI IN", "TANGGAL OUT", "JAM OUT", "LOKASI OUT", "FOTO IN", "FOTO OUT"];
    const data = filteredAbsen.map((absen, index) => [
      index + 1,
      absen.nama,
      absen.lokasi,
      absen.deskripsi,
      new Date(absen.jam_mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
      new Date(absen.jam_mulai).toLocaleTimeString("id-ID"),
      absen.lokasi_mulai,
      new Date(absen.jam_selesai).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
      new Date(absen.jam_selesai).toLocaleTimeString("id-ID"),
      absen.lokasi_selesai,
      absen.foto_mulai ? absen.foto_mulai : "Tidak ada foto",
      absen.foto_selesai ? absen.foto_selesai : "Tidak ada foto",
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Absensi");
    XLSX.writeFile(workbook, "data_absensi.xlsx");
  };

  useEffect(() => {
    const fetchAbsenData = async () => {
      try {
        const response = await fetch(`${apiUrl}/absen/`);
        const result = await response.json();
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              title="Back to Home" 
              onClick={handleBackClick} 
              className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2"
            />
            <h1 className="text-3xl font-bold text-gray-800">DATA ABSENSI</h1>
          </div>
          <button 
            onClick={downloadData} 
            className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-150"
          >
            Download Data
          </button>
        </div>
        <input 
          type="text" 
          value={searchQuery} 
          placeholder="Cari Nama Karyawan..." 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="border p-2 mb-4 w-full rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-green-500 text-white uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Lokasi</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {filteredAbsen.length > 0 ? (
                  filteredAbsen.map((absen, index) => (
                    <>
                      <tr key={absen.id_absen} className="border-b border-gray-200 hover:bg-gray-100 transition duration-150">
                        <td className="py-3 px-4 text-left">{index + 1}</td>
                        <td className="py-3 px-4 text-left">{absen.nama}</td>
                        <td className="py-3 px-4 text-left">{absen.lokasi}</td>
                        <td className="py-3 px-4 text-left">
                          <button 
                            onClick={() => toggleRowExpansion(absen.id_absen)} 
                            className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition duration-150"
                          >
                            {expandedRows[absen.id_absen] ? "TUTUP" : "DETAIL"}
                          </button>
                        </td>
                      </tr>
                      {expandedRows[absen.id_absen] && (
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <td colSpan="4" className="px-4 py-3">
                            <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-300">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Tugas:</strong>
                                  <span className="text-gray-800">{absen.deskripsi}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Tanggal IN:</strong>
                                  <span className="text-gray-800">{new Date(absen.jam_mulai).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Jam IN:</strong>
                                  <span className="text-gray-800">
                                    {`${new Date(absen.jam_mulai).getHours().toString().padStart(2, '0')}:${new Date(absen.jam_mulai).getMinutes().toString().padStart(2, '0')}`}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Lokasi IN:</strong>
                                  <span className="text-gray-800">{absen.lokasi_mulai}</span>
                                  <button 
                                    onClick={() => openGoogleMaps(absen.latitude_mulai, absen.longitude_mulai)} 
                                    className="mt-2 text-blue-500 hover:underline"
                                  >
                                    Lihat di Google Maps
                                  </button>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Foto IN:</strong>
                                  {absen.foto_mulai ? (
                                    <a 
                                      href={absen.foto_mulai} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-500 hover:underline"
                                    >
                                      Lihat Foto
                                    </a>
                                  ) : (
                                    <span className="text-gray-800">Tidak ada foto</span>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Tanggal OUT:</strong>
                                  <span className="text-gray-800">{new Date(absen.jam_selesai).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Jam OUT:</strong>
                                  <span className="text-gray-800">
                                    {`${new Date(absen.jam_selesai).getHours().toString().padStart(2, '0')}:${new Date(absen.jam_selesai).getMinutes().toString().padStart(2, '0')}`}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Lokasi OUT:</strong>
                                  <span className="text-gray-800">{absen.lokasi_selesai}</span>
                                  <button 
                                    onClick={() => openGoogleMaps(absen.latitude_selesai, absen.longitude_selesai)} 
                                    className="mt-2 text-blue-500 hover:underline"
                                  >
                                    Lihat di Google Maps
                                  </button>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-gray-700">Foto OUT:</strong>
                                  {absen.foto_selesai ? (
                                    <a 
                                      href={absen.foto_selesai} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-500 hover:underline"
                                    >
                                      Lihat Foto
                                    </a>
                                  ) : (
                                    <span className="text-gray-800">Tidak ada foto</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-3 text-center">Tidak ada data yang ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="bg-gray-800 p-4 text-white text-center">
        <p>&copy; 2024 Your Company. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default DataAbsensi;
