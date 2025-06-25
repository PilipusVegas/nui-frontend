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
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const itemsPerPageDesktop = 15;
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
    const endpoint = isEdit
      ? `${apiUrl}/lokasi/update/${editId}`
      : `${apiUrl}/lokasi/create`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (response.ok) {
        Swal.fire(
          "Success!",
          `Data berhasil ${isEdit ? "diupdate" : "ditambahkan"}!`,
          "success"
        );
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
        <th className="px-4 py-1 border-b text-sm font-semibold">Menu</th>
      </tr>
    </thead>
  );

  const renderBody = (currentItems) => {
    return currentItems.map((lokasi, index) => (
      <tr
        key={lokasi.id}
        className="hover:bg-gray-200 transition-colors duration-150"
      >
        <td className="px-4 py-1 border-b text-sm text-center">{index + 1}</td>
        <td className="px-4 py-1 border-b text-sm">{lokasi.nama}</td>
        <td className="px-4 py-1 border-b text-sm">{lokasi.koordinat}</td>
        <td className="px-4 py-1 border-b text-sm text-center">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleEdit(lokasi)}
              className="flex items-center space-x-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors duration-150"
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(lokasi.id)}
              className="flex items-center space-x-1 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-150"
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Hapus</span>
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const renderBodyMobile = (currentItems) => {
    return currentItems.map((lokasi) => (
      <div className="bg-gradient-to-br from-f to-gray-50 rounded-xl shadow-lg mb-6 p-4 border border-gray-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
        {/* Header Card */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{lokasi.nama}</h3>
          <span className="text-xs font-medium bg-green-300 text-gray-600 px-3 py-1 rounded-full"></span>
        </div>

        {/* Koordinat dengan Map Icon */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-3 bg-gray-100 rounded-md px-3 py-2 shadow-inner">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-green-500 text-lg"
            />
            <span
              className="font-medium break-words w-full"
              style={{ wordBreak: "break-word" }}
            >
              {lokasi.koordinat}
            </span>
          </div>
        </div>

        {/* Informasi Tambahan */}
        {/* <div className="mb-4 text-gray-500 text-sm">
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" />
            <span>
              Dibuat pada:{" "}
              <span className="font-medium">
                {new Date(lokasi.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>
          </p>
        </div> */}

        {/* Tombol Menu */}
        <div className="flex justify-end space-x-3 items-center pt-3 border-t border-gray-200">
          {/* Tombol Edit */}
          <button
            onClick={() => handleEdit(lokasi)}
            className="flex items-center gap-2 bg-yellow-500 text-yellow-100 text-sm font-medium px-4 py-2 rounded-md shadow hover:bg-yellow-200 hover:shadow-lg transition duration-200"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>

          {/* Tombol Delete */}
          <button
            onClick={() => handleDelete(lokasi.id)}
            className="flex items-center gap-2 bg-red-500 text-red-100 text-sm font-medium px-4 py-2 rounded-md shadow hover:bg-red-200 hover:shadow-lg transition duration-200"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    ));
  };

  const renderModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center px-6">
      <div className="bg-white p-6 rounded-lg w-full sm:w-96">
        <h3 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Lokasi" : "Tambah Lokasi"}
        </h3>
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
              isEdit
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
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
  const totalPagesDesktop = Math.ceil(
    filteredLokasiData.length / itemsPerPageDesktop
  );
  const totalPagesMobile = Math.ceil(
    filteredLokasiData.length / itemsPerPageMobile
  );

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
    <div className="min-h-screen flex flex-col px-6 pt-6 bg-white">
      {/* Header */}
      <div className=" flex items-center justify-between mb-6 flex-wrap">
        <div className="flex items-center space-x-2 w-full sm:w-auto mb-4 sm:mb-0">
          <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2 sm:p-3 shadow-lg" onClick={handleBackClick} title="Back to Home"/>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pb-1">
            Kelola Lokasi Presensi
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Cari Lokasi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-100 text-sm"/>
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute top-2 text-xl right-3 text-gray-500"
            />
          </div>

          {/* Add Location Button */}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-200">
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Tambah Lokasi</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden hidden md:block">
        <table className="table-auto w-full border-collapse rounded-lg text-sm">
          {renderHeader()}
          <tbody>
            {filteredLokasiData.length > 0 ? (
              renderBody(currentItemsDesktop)
            ) : (
              <tr>
                <td colSpan={4} className="text-center px-4 py-2 text-gray-500">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">{renderBodyMobile(currentItemsMobile)}</div>

      {/* Pagination untuk mobile */}
      <div className="flex justify-center text-center space-x-2 pb-10 mt-2 md:hidden">
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
          onClick={() =>
            setCurrentPageMobile((prev) => Math.min(prev + 1, totalPagesMobile))
          }
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
      <div className="flex justify-center text-center space-x-2 pb-10 pt-2 mt-4 md:block hidden">
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
          onClick={() =>
            setCurrentPageDesktop((prev) =>
              Math.min(prev + 1, totalPagesDesktop)
            )
          }
          disabled={currentPageDesktop === totalPagesDesktop}
          className={`px-5  rounded-full font-xl transition-all duration-200 ${
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
