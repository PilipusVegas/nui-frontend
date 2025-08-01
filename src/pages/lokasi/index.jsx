import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faArrowLeft, faArrowRight, faSearch, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [lokasiData, setLokasiData] = useState([]);
  const [currentPageDesktop, setCurrentPageDesktop] = useState(1);
  const [currentPageMobile, setCurrentPageMobile] = useState(1);
  const itemsPerPageDesktop = 20;
  const itemsPerPageMobile = 10;

  useEffect(() => {
    fetchLokasiData();
  }, []);

  const fetchLokasiData = async () => {
    try {
      const response = await fetchWithJwt(`${apiUrl}/lokasi/`);
      const data = await response.json();
      setLokasiData(data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Anda yakin ingin menghapus?",
      text: "Data ini akan dihapus secara permanen!",
      icon: "warning",
      iconColor: "#FF0000",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        const response = await fetchWithJwt(`${apiUrl}/lokasi/delete/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          Swal.fire("Deleted!", "Data berhasil dihapus!", "success");
          fetchLokasiData();
        }
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const filteredLokasiData = lokasiData.filter((lokasi) =>
    lokasi.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItemsDesktop = filteredLokasiData.slice(
    (currentPageDesktop - 1) * itemsPerPageDesktop,
    currentPageDesktop * itemsPerPageDesktop
  );
  const currentItemsMobile = filteredLokasiData.slice(
    (currentPageMobile - 1) * itemsPerPageMobile,
    currentPageMobile * itemsPerPageMobile
  );

  useEffect(() => {
    setCurrentPageDesktop(1);
    setCurrentPageMobile(1);
  }, [searchTerm]);

  const renderHeader = () => (
    <thead>
      <tr className="bg-green-500 text-white">
        <th className="px-4 py-2 border-b text-sm font-semibold">No</th>
        <th className="px-4 py-2 border-b text-sm font-semibold">Lokasi</th>
        <th className="px-4 py-2 border-b text-sm font-semibold">Koordinat</th>
        <th className="px-4 py-2 border-b text-sm font-semibold">Menu</th>
      </tr>
    </thead>
  );

  const renderBody = (items) =>
    items.map((lokasi, index) => (
      <tr key={lokasi.id} className="hover:bg-gray-200 transition-colors duration-150">
        <td className="px-4 py-0.5 border-b text-xs text-center">
          {(currentPageDesktop - 1) * itemsPerPageDesktop + index + 1}
        </td>
        <td className="px-4 py-0.5 border-b text-xs font-semibold uppercase">{lokasi.nama}</td>
        <td className="px-4 py-0.5 border-b text-xs">{lokasi.koordinat}</td>
        <td className="px-4 py-0.5 border-b text-xs text-center">
          <div className="flex justify-center space-x-2">
            <button onClick={() => navigate(`/lokasi-presensi/edit/${lokasi.id}`)} className="flex items-center space-x-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
              <FontAwesomeIcon icon={faEdit} />
              <span>Edit</span>
            </button>
            {/* <button onClick={() => handleDelete(lokasi.id)} className="flex items-center space-x-1 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              <FontAwesomeIcon icon={faTrash} />
              <span>Hapus</span>
            </button> */}
          </div>
        </td>
      </tr>
    ));

    const renderBodyMobile = (items) =>
    items.map((lokasi) => (
      <div key={lokasi.id} className="bg-white border border-gray-200 rounded-xl shadow-sm mb-3 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {lokasi.nama}
          </h3>
        </div>
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500" />
          <span className="truncate">{lokasi.koordinat}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={() => navigate(`/lokasi-presensi/edit/${lokasi.id}`)} className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded px-3 py-1 text-xs shadow-sm">
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </button>
          <button onClick={() => handleDelete(lokasi.id)} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 text-xs shadow-sm">
            <FontAwesomeIcon icon={faTrash} />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    ));
  

  return (
    <div className="flex flex-col bg-white">
      <div className="flex items-center justify-between mb-6 flex-wrap">
        <div className="flex items-center space-x-2 w-full sm:w-auto mb-4 sm:mb-0">
          <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 p-3 rounded-full shadow-lg" onClick={() => navigate("/home")} />
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Kelola Lokasi Presensi</h1>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Cari Lokasi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-green-100 text-sm" />
            <FontAwesomeIcon icon={faSearch} className="absolute top-2.5 right-3 text-gray-500" />
          </div>
          <button onClick={() => navigate("/lokasi-presensi/tambah")} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} />
            <span className="inline sm:hidden">Tambah</span>
            <span className="hidden sm:inline">Tambah Lokasi</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden hidden md:block">
        <table className="table-auto w-full border-collapse text-sm">
          {renderHeader()}
          <tbody>
            {filteredLokasiData.length > 0 ? renderBody(currentItemsDesktop) : (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">Tidak ada data ditemukan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">{renderBodyMobile(currentItemsMobile)}</div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        {/* Tombol kiri */}
        <button onClick={() => setCurrentPageDesktop((prev) => Math.max(prev - 1, 1))} disabled={currentPageDesktop === 1}
          className={`rounded-full p-2 px-3 transition-all duration-200 ${
            currentPageDesktop === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Info Halaman */}
        <span className="text-sm text-gray-700 font-medium tracking-wide border border-gray-200 px-6 py-2 rounded-full">
          Halaman <span className="font-semibold">{currentPageDesktop}</span> / {Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)}
        </span>

        {/* Tombol kanan */}
        <button onClick={() => setCurrentPageDesktop((prev) => Math.min(prev + 1, Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)))}
          disabled={
            currentPageDesktop === Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)
          }
          className={`rounded-full p-2 px-3 transition-all duration-200 ${
            currentPageDesktop === Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

    </div>
  );
};

export default DataLokasi;
