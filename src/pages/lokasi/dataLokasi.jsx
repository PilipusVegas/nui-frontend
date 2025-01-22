import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
  faArrowRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const itemsPerPageDesktop = 10;
  const itemsPerPageMobile = 5;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [lokasiData, setLokasiData] = useState([]);
  const [formState, setFormState] = useState({ nama: "", koordinat: "" });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPageDesktop, setCurrentPageDesktop] = useState(1);
  const [currentPageMobile, setCurrentPageMobile] = useState(1);

  const handleBackClick = () => navigate("/home");

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

  const filteredLokasiData = lokasiData.filter((lokasi) =>
    lokasi.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = ({ target: { name, value } }) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const endpoint = isEdit ? `${apiUrl}/lokasi/update/${editId}` : `${apiUrl}/lokasi/create`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (response.ok) {
        Swal.fire("Success!", `Data berhasil ${isEdit ? "diupdate" : "ditambahkan"}!`, "success");
        fetchLokasiData();
        closeModal();
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} location:`, error);
    }
  };

  const handleEdit = (lokasi) => {
    setIsEdit(true);
    setEditId(lokasi.id);
    setFormState({ nama: lokasi.nama, koordinat: lokasi.koordinat });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Anda yakin ingin menghapus?",
      text: "Data ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      iconColor: "#FF0000",
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

  const closeModal = () => {
    setIsModalOpen(false);
    setFormState({ nama: "", koordinat: "" });
    setIsEdit(false);
    setEditId(null);
  };

  const renderHeader = () => (
    <thead>
      <tr className="bg-green-500 text-white">
        <th className="px-4 py-1 border-b text-sm font-semibold">No</th>
        <th className="px-4 py-1 border-b text-sm font-semibold">Lokasi</th>
        <th className="px-4 py-1 border-b text-sm font-semibold">Koordinat</th>
        <th className="px-4 py-1 border-b text-sm font-semibold">Aksi</th>
      </tr>
    </thead>
  );

  const renderBody = (currentItems) => {
    return currentItems.map((lokasi, index) => (
      <tr key={lokasi.id} className="hover:bg-gray-200 transition-colors duration-150">
        <td className="px-4 py-1 border-b text-sm text-center">{index + 1}</td>
        <td className="px-4 py-1 border-b text-sm">{lokasi.nama}</td>
        <td className="px-4 py-1 border-b text-sm">{lokasi.koordinat}</td>
        <td className="px-4 py-1 border-b text-sm text-center">
          <button
            onClick={() => handleEdit(lokasi)}
            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-150"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDelete(lokasi.id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-150"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    ));
  };

  const renderBodyMobile = (currentItems) => {
    return currentItems.map((lokasi) => (
      <div key={lokasi.id} className="bg-white rounded-lg mb-2 p-4 border border-gray-200">
        <h3 className="text-md font-medium text-gray-800">{lokasi.nama}</h3>
        <p className="text-sm text-gray-500">Koordinat: {lokasi.koordinat}</p>
        <div className="mt-4 flex space-x-2 justify-end">
          <button
            onClick={() => handleEdit(lokasi)}
            className="bg-yellow-200 text-yellow-700 text-xs px-3 py-1 rounded-md hover:bg-yellow-300 transition duration-150"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(lokasi.id)}
            className="bg-red-200 text-red-700 text-xs px-3 py-1 rounded-md hover:bg-red-300 transition duration-150"
          >
            Hapus
          </button>
        </div>
      </div>
    ));
  };

  const renderModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center px-6">
      <div className="bg-white p-6 rounded-lg w-full sm:w-96">
        <h3 className="text-xl font-bold mb-4">{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</h3>
        <input
          type="text"
          name="nama"
          placeholder="Nama Lokasi"
          value={formState.nama}
          onChange={handleInputChange}
          className="border px-4 py-2 w-full mb-2"
        />
        <input
          type="text"
          name="koordinat"
          placeholder="Koordinat"
          value={formState.koordinat}
          onChange={handleInputChange}
          className="border px-4 py-2 w-full mb-2"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white ${
              isEdit ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
            } transition-colors duration-150 rounded`}
          >
            {isEdit ? "Update" : "Tambah"}
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 rounded ml-2"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );

// Pagination Logic
const totalPagesDesktop = Math.ceil(filteredLokasiData.length / itemsPerPageDesktop);
const totalPagesMobile = Math.ceil(filteredLokasiData.length / itemsPerPageMobile);

// Menghitung halaman saat ini dengan data yang sudah difilter
const currentItemsDesktop = filteredLokasiData.slice(
  (currentPageDesktop - 1) * itemsPerPageDesktop,
  currentPageDesktop * itemsPerPageDesktop
);
const currentItemsMobile = filteredLokasiData.slice(
  (currentPageMobile - 1) * itemsPerPageMobile,
  currentPageMobile * itemsPerPageMobile
);

// Reset halaman ketika search term berubah
useEffect(() => {
  setCurrentPageDesktop(1);
  setCurrentPageMobile(1);
}, [searchTerm]);


  return (
    <div className="max-h-screen flex flex-col px-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap">
        <div className="flex items-center space-x-2 w-full sm:w-auto mb-4 sm:mb-0">
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2 sm:p-3 shadow-lg"
            onClick={handleBackClick}
            title="Back to Home"
          />
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pb-1">Data Lokasi Gerai</h1>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="Cari Lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-1 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute top-2 right-2 text-gray-500" />
          </div>

          {/* Add Location Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-4 py-1 mb-2 rounded flex items-center justify-center hover:bg-green-600 transition-colors duration-150"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline ml-2">Tambah Lokasi</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden hidden md:block">
        <table className="table-auto w-full border-collapse rounded-lg">
          {renderHeader()}
          <tbody>
            {filteredLokasiData.length > 0 ? (
              renderBody(currentItemsDesktop) // Render dengan data halaman yang terpilih
            ) : (
              <tr>
                <td colSpan={4} className="text-center px-4 py-1">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">{renderBodyMobile(currentItemsMobile)}</div>

      {/* Pagination untuk mobile */}
      <div className="flex justify-center text-center space-x-2 mt-4 md:hidden">
        <button
          onClick={() => setCurrentPageMobile((prev) => Math.max(prev - 1, 1))}
          disabled={currentPageMobile === 1}
          className={`px-5 rounded-full font-medium transition-all duration-200 ${
            currentPageMobile === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Nomor Halaman */}
        <span className="px-4 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm">
          {currentPageMobile} / {totalPagesMobile}
        </span>

        <button
          onClick={() => setCurrentPageMobile((prev) => Math.min(prev + 1, totalPagesMobile))}
          disabled={currentPageMobile === totalPagesMobile}
          className={`px-5 rounded-full font-xl transition-all duration-200 ${
            currentPageMobile === totalPagesMobile
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      {/* Pagination untuk desktop */}
      <div className="flex justify-center text-center space-x-2 mt-4 md:block hidden">
        <button
          onClick={() => setCurrentPageDesktop((prev) => Math.max(prev - 1, 1))}
          disabled={currentPageDesktop === 1}
          className={`px-5 rounded-full font-medium transition-all duration-200 ${
            currentPageDesktop === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Nomor Halaman */}
        <span className="px-4 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm">
          {currentPageDesktop} / {totalPagesDesktop}
        </span>

        <button
          onClick={() => setCurrentPageDesktop((prev) => Math.min(prev + 1, totalPagesDesktop))}
          disabled={currentPageDesktop === totalPagesDesktop}
          className={`px-5 rounded-full font-xl transition-all duration-200 ${
            currentPageDesktop === totalPagesDesktop
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && renderModal()}
    </div>
  );
};

export default DataLokasi;
