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

  const filteredAbsen = absenData.filter((absen) => {
    return absen.nama ? absen.nama.toLowerCase().includes(searchQuery.toLowerCase()) : false;
  });

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
        console.log("Data yang diterima dari API:", result);
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
          <button onClick={downloadData} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-150">Download Data</button>
        </div>
        <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan ..." onChange={(e) => setSearchQuery(e.target.value)} className="border p-2 mb-4 w-full rounded-md shadow-sm focus:outline-none focus:border-blue-400 transition duration-150"/>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
              <thead className="bg-green-700 text-white uppercase text-sm leading-normal">
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
                          <button onClick={() => toggleRowExpansion(absen.id_absen)} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition duration-150">
                            {expandedRows[absen.id_absen] ? "TUTUP" : "DETAIL"}
                          </button>
                        </td>
                      </tr>
                      {expandedRows[absen.id_absen] && (
                        <tr className="border-b border-gray-200 bg-gray-50">
                        <td colSpan="5" className="px-4 py-3">
                          <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-300">

                            <div className="grid grid-cols-4 gap-6">
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Tugas:</strong>
                                <span className="text-gray-800">{absen.deskripsi}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Tanggal IN:</strong>
                                <span className="text-gray-800">{new Date(absen.jam_mulai).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Jam IN:</strong>
                                <span className="text-gray-800">
                                  {`${new Date(absen.jam_mulai).getHours().toString().padStart(2, '0')}:${new Date(absen.jam_mulai).getMinutes().toString().padStart(2, '0')}`}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Lokasi IN:</strong>
                                <span className="text-gray-800">
                                  <button className="text-blue-500 underline" onClick={() => openGoogleMaps(absen.lat_mulai, absen.lon_mulai)}>Lihat Peta</button>
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Foto IN:</strong>
                                <span className="text-gray-800 flex items-center">
                                  {absen.foto_mulai ? (
                                    <button className="text-blue-500 underline" onClick={() => window.open(absen.foto_mulai, "_blank")}>Lihat Foto IN</button>
                                  ) : (
                                    <span>Tidak ada foto</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Tanggal OUT:</strong>
                                <span className="text-gray-800">{new Date(absen.jam_selesai).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Jam OUT:</strong>
                                <span className="text-gray-800">
                                  {`${new Date(absen.jam_selesai).getHours().toString().padStart(2, '0')}:${new Date(absen.jam_selesai).getMinutes().toString().padStart(2, '0')}`}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Lokasi OUT:</strong>
                                <span className="text-gray-800">
                                  <button className="text-blue-500 underline" onClick={() => openGoogleMaps(absen.lat_selesai, absen.lon_selesai)}>Lihat Peta</button>
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-gray-600">Foto OUT:</strong>
                                <span className="text-gray-800 flex items-center">
                                  {absen.foto_selesai ? (
                                    <button className="text-blue-500 underline" onClick={() => window.open(absen.foto_selesai, "_blank")}>Lihat Foto OUT</button>
                                  ) : (
                                    <span>Tidak ada foto</span>
                                  )}
                                </span>
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
                    <td colSpan="4" className="py-3 text-center">Tidak ada data absen ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <button onClick={handleCloseModal} className="bg-red-600 text-white py-1 px-3 rounded absolute top-0 right-0 mt-2 mr-2">Tutup</button>
              <img src={selectedImage} alt="Foto Absensi" className="max-w-full h-auto"/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAbsensi;
