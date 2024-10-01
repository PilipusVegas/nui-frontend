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
  const [selectedImage, setSelectedImage] = useState(null);

  const handleBackClick = () => navigate("/home");
  const handleCloseModal = () => { setSelectedImage(null) };
  const handleImageClick = (imageUrl) => { setSelectedImage(imageUrl) };

  const filteredAbsen = absenData.filter((absen) => {
    return absen.nama ? absen.nama.toLowerCase().includes(searchQuery.toLowerCase()) : false;
  });

  const downloadData = () => {
    const csvData = [
      ["No.", "Nama", "Deskripsi", "Tanggal (IN)", "Jam (IN)", "Lokasi (IN)", "Tanggal (OUT)", "Jam (OUT)", "Lokasi (OUT)", "Foto (IN)", "Foto (OUT)"],
      ...filteredAbsen.map((absen, index) => [
        index + 1,
        absen.nama,
        absen.deskripsi,
        new Date(absen.jam_mulai).toLocaleDateString("id-ID"),
        new Date(absen.jam_mulai).toLocaleTimeString("id-ID"),
        absen.lokasi_mulai,
        new Date(absen.jam_selesai).toLocaleDateString("id-ID"),
        new Date(absen.jam_selesai).toLocaleTimeString("id-ID"),
        absen.lokasi_selesai,
        absen.foto_mulai ? absen.foto_mulai : "Tidak ada foto",
        absen.foto_selesai ? absen.foto_selesai : "Tidak ada foto"
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_absensi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const openGoogleMaps = (lat, lon) => {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg" />
            <h1 className="text-4xl font-bold text-gray-800 pb-1">DATA ABSENSI</h1>
          </div>
          <button onClick={downloadData} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-150">Download Data</button>
        </div>
        <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan ..." className="border p-2 mb-4 w-full rounded-md" onChange={(e) => setSearchQuery(e.target.value)} />
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
                  <th className="py-3 pl-6 text-left">Nama</th>
                  <th className="py-3 pl-6 text-left">Deskripsi</th>
                  <th className="py-3 pl-6 text-left">Tanggal (IN)</th>
                  <th className="py-3 pl-6 text-left">Jam (IN)</th>
                  <th className="py-3 pl-6 text-left">Lokasi (IN)</th>
                  <th className="py-3 pl-6 text-left">Tanggal (OUT)</th>
                  <th className="py-3 pl-6 text-left">Jam (OUT)</th>
                  <th className="py-3 pl-6 text-left">Lokasi (OUT)</th>
                  <th className="py-3 pl-6 text-left">Foto (IN)</th>
                  <th className="py-3 pl-6 text-left">Foto (OUT)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredAbsen.length > 0 ? (
                  filteredAbsen.map((absen, index) => (
                    <tr key={absen.id_absen} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 pl-6 text-left">{index + 1}</td>
                      <td className="py-3 pl-6 text-left">{absen.nama}</td>
                      <td className="py-3 pl-6 text-left">{absen.deskripsi}</td>
                      <td className="py-3 pl-6 text-left">{new Date(absen.jam_mulai).toLocaleDateString("id-ID")}</td>
                      <td className="py-3 pl-6 text-left">{new Date(absen.jam_mulai).toLocaleTimeString("id-ID")}</td>
                      <td className="py-3 pl-6 text-left">
                        <button onClick={() => openGoogleMaps(absen.lat_in, absen.lon_in)} className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 transition duration-150">Lihat Lokasi</button>
                      </td>
                      <td className="py-3 pl-6 text-left">{new Date(absen.jam_selesai).toLocaleDateString("id-ID")}</td>
                      <td className="py-3 pl-6 text-left">{new Date(absen.jam_selesai).toLocaleTimeString("id-ID")}</td>
                      <td className="py-3 pl-6 text-left">
                        <button onClick={() => openGoogleMaps(absen.lat_out, absen.lon_out)} className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 transition duration-150">Lihat Lokasi</button>
                      </td>
                      <td className="py-3 pl-6 text-left">
                        {absen.foto_mulai ? (
                          <button onClick={() => handleImageClick(absen.foto_mulai)} className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 transition duration-150">Lihat Foto</button>
                        ) : (
                          "Tidak ada foto"
                        )}
                      </td>
                      <td className="py-3 pl-6 text-left">
                        {absen.foto_selesai ? (
                          <button onClick={() => handleImageClick(absen.foto_selesai)} className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 transition duration-150">Lihat Foto</button>
                        ) : (
                          "Tidak ada foto"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="py-3 text-center">Tidak ada data absen ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6">
              <button onClick={handleCloseModal} className="text-red-500 mb-4">Tutup</button>
              <img src={selectedImage} alt="Foto" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAbsensi;
