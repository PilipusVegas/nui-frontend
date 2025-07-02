import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faArrowLeft, faArrowRight, faSearch, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [lokasiData, setLokasiData] = useState([]);
  const [currentPageDesktop, setCurrentPageDesktop] = useState(1);
  const [currentPageMobile, setCurrentPageMobile] = useState(1);
  const itemsPerPageDesktop = 15;
  const itemsPerPageMobile = 5;

  useEffect(() => {
    fetchLokasiData();
  }, []);

  const fetchLokasiData = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi/`);
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
        const response = await fetch(`${apiUrl}/lokasi/delete/${id}`, {
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
        <th className="px-4 py-1 border-b text-sm font-semibold">No</th>
        <th className="px-4 py-1 border-b text-sm font-semibold">Lokasi</th>
        <th className="px-4 py-1 border-b text-sm font-semibold">Koordinat</th>
        <th className="px-4 py-1 border-b text-sm font-semibold">Menu</th>
      </tr>
    </thead>
  );

  const renderBody = (items) =>
    items.map((lokasi, index) => (
      <tr key={lokasi.id} className="hover:bg-gray-200 transition-colors duration-150">
        <td className="px-4 py-0.5 border-b text-xs text-center">{index + 1}</td>
        <td className="px-4 py-0.5 border-b text-xs font-semibold uppercase">{lokasi.nama}</td>
        <td className="px-4 py-0.5 border-b text-xs">{lokasi.koordinat}</td>
        <td className="px-4 py-0.5 border-b text-xs text-center">
          <div className="flex justify-center space-x-2">
            <button onClick={() => navigate(`/lokasi-presensi/edit/${lokasi.id}`)} className="flex items-center space-x-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
              <FontAwesomeIcon icon={faEdit} />
              <span>Edit</span>
            </button>
            <button onClick={() => handleDelete(lokasi.id)} className="flex items-center space-x-1 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              <FontAwesomeIcon icon={faTrash} />
              <span>Hapus</span>
            </button>
          </div>
        </td>
      </tr>
    ));

  const renderBodyMobile = (items) =>
    items.map((lokasi) => (
      <div key={lokasi.id} className="bg-white border border-gray-200 rounded-xl shadow-md mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">{lokasi.nama}</h3>
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 mr-2" />
          <span>{lokasi.koordinat}</span>
        </div>
        <div className="flex justify-end space-x-3 pt-2 border-t">
          <button onClick={() => navigate(`/lokasi-presensi/edit/${lokasi.id}`)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button onClick={() => handleDelete(lokasi.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen flex flex-col px-6 pt-6 bg-white">
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
            <span>Tambah Lokasi</span>
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
      <div className="flex justify-center mt-4 gap-2 pb-10">
        <button onClick={() => setCurrentPageDesktop((prev) => Math.max(prev - 1, 1))} disabled={currentPageDesktop === 1} className={`px-5 rounded-full ${currentPageDesktop === 1 ? "bg-gray-300 text-gray-500" : "bg-green-500 text-white hover:bg-green-700"}`}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <span className="px-6 py-0.5 border rounded-full text-gray-700 text-sm">
          {currentPageDesktop} / {Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)}
        </span>
        <button onClick={() => setCurrentPageDesktop((prev) => Math.min(prev + 1, Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)))} disabled={currentPageDesktop === Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)} className={`px-5 rounded-full ${currentPageDesktop === Math.ceil(filteredLokasiData.length / itemsPerPageDesktop) ? "bg-gray-300 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"}`}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default DataLokasi;
