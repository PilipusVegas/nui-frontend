import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Modal = ({ isOpen, onClose, taskDetails }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-6/12 max-w-xl translate-y-[5%] mt-8 ml-32 h-64 overflow-auto relative">
        <h2 className="text-lg font-bold mb-4 text-center">DETAIL TUGAS</h2>
        <p>{taskDetails}</p>
        <button onClick={onClose} className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md">TUTUP</button>
      </div>
    </div>
  );
};

const DataLembur = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lemburData, setLemburData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleBackClick = () => navigate("/home");

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask("");
  };

  const handleOpenModal = (tugas) => {
    setSelectedTask(tugas);
    setIsModalOpen(true);
  };

  const filteredLembur = lemburData.filter((lembur) => {
    const matchesSearch = lembur.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const lemburDate = new Date(lembur.tanggal);
    const matchesDate = selectedMonth ? lemburDate.getMonth() + 1 === Number(selectedMonth) : true;
    return matchesSearch && matchesDate;
  });  

  const handleDownload = () => {
    const headers = [["NO", "NAMA", "TANGGAL", "LOKASI", "TUGAS", "JAM MULAI", "JAM SELESAI", "STATUS"]];
    const filteredData = filteredLembur.map(({ id, nama, tanggal, lokasi, deskripsi, jam_mulai, jam_selesai, status }, index) => ([
      index + 1,
      nama,
      new Date(tanggal).toLocaleDateString("en-GB"),
      lokasi,
      deskripsi,
      jam_mulai.slice(0, 5),
      jam_selesai.slice(0, 5),
      status === 1 ? "Disetujui" : status === 2 ? "Tidak Disetujui" : "Belum Disetujui",
    ]));
    const worksheet = XLSX.utils.aoa_to_sheet(headers.concat(filteredData));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lembur");
    XLSX.writeFile(workbook, `Data_Lembur_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    const fetchLemburData = async () => {
      try {
        const response = await fetch(`${apiUrl}/overtime/`);
        const result = await response.json();
        if (Array.isArray(result)) {
          setLemburData(result);
        } else {
          setErrorMessage("Unexpected response format.");
        }
      } catch (error) {
        setErrorMessage("Kesalahan saat mengambil data lembur.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLemburData();
  }, [apiUrl]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
            <h1 className="text-4xl font-bold text-gray-800 pb-1">DATA LEMBUR</h1>
          </div>
          {selectedMonth && filteredLembur.length > 0 && (
            <button onClick={handleDownload} className="bg-blue-500 text-white p-2 rounded-md">DOWNLOAD DATA LEMBUR</button>
          )}
        </div>
        <div className="flex mb-4 items-center space-x-4">
          <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan..." onChange={(e) => setSearchQuery(e.target.value)} className="border p-2 rounded-md w-full flex-grow" />
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border p-2 rounded-md flex-shrink-0 ml-4">
            <option value="">Pilih Bulan</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="mb-8">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Lokasi</th>
                  <th className="py-3 px-4 text-left">Tugas</th>
                  <th className="py-3 px-4 text-left">Jam Mulai</th>
                  <th className="py-3 px-4 text-left">Jam Selesai</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredLembur.length > 0 ? (
                  filteredLembur.map((lembur, index) => (
                    <tr key={lembur.id} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 px-4 text-left">{index + 1}.</td>
                      <td className="py-3 px-4 text-left">{lembur.nama}</td>
                      <td className="py-3 px-4 text-left">{new Date(lembur.tanggal).toLocaleDateString("en-GB")}</td>
                      <td className="py-3 px-4 text-left">{lembur.lokasi}</td>
                      <td className="py-3 px-4 text-left">
                        <button onClick={() => handleOpenModal(lembur.deskripsi)} className="text-blue-500 underline">DETAIL</button>
                      </td>
                      <td className="py-3 px-4 text-left">{lembur.jam_mulai.slice(0, 5)}</td>
                      <td className="py-3 px-4 text-left">{lembur.jam_selesai.slice(0, 5)}</td>
                      <td className="py-3 px-4 text-left">
                        <span className={`font-bold ${lembur.status === 1 ? "text-green-600" : lembur.status === 2 ? "text-red-600" : "text-orange-600"}`}>
                          {lembur.status === 1 ? "Disetujui Leader" : lembur.status === 2 ? "Tidak Disetujui Leader" : "Belum Disetujui Leader"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-3 px-4 text-center">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} taskDetails={selectedTask} />
    </div>
  );
};

export default DataLembur;
