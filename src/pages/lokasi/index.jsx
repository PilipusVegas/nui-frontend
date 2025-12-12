import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faArrowLeft, faArrowRight, faSearch, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, Pagination, SearchBar, ErrorState, SectionHeader } from "../../components/";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [lokasiData, setLokasiData] = useState([]);
  const [currentPageDesktop, setCurrentPageDesktop] = useState(1);
  const [currentPageMobile, setCurrentPageMobile] = useState(1);
  const itemsPerPageDesktop = 10;
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

  return (
    <div className="flex flex-col bg-white">

      <SectionHeader
        title="Kelola Lokasi Presensi"
        subtitle={`Kelola ${lokasiData.length} lokasi presensi karyawan lapangan.`}
        onBack={() => navigate("/home")}
        actions={
          <button
            onClick={() => navigate("/lokasi-presensi/tambah")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="inline sm:hidden">Tambah</span>
            <span className="hidden sm:inline">Tambah Lokasi</span>
          </button>
        }
      />


      {/* SEARCH BAR */}
      <div className="mb-4 w-full">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input type="text" placeholder="Cari Lokasi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-300 text-sm" />
        </div>
      </div>

      {/* TABLE DESKTOP */}
      <div className="rounded-lg shadow-md overflow-hidden hidden md:block">
        <table className="table-auto w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="px-4 py-2 border-b text-sm font-semibold">No</th>
              <th className="px-4 py-2 border-b text-sm font-semibold">Lokasi</th>
              <th className="px-4 py-2 border-b text-sm font-semibold">Koordinat</th>
              <th className="px-4 py-2 border-b text-sm font-semibold">Timezone</th>
              <th className="px-4 py-2 border-b text-sm font-semibold">Menu</th>
            </tr>
          </thead>

          <tbody>
            {filteredLokasiData.length > 0 ? (
              currentItemsDesktop.map((lokasi, index) => (
                <tr
                  key={lokasi.id}
                  className="hover:bg-gray-200 transition-colors duration-150"
                >
                  <td className="px-4 py-1 border-b text-xs text-center">
                    {(currentPageDesktop - 1) * itemsPerPageDesktop + index + 1}
                  </td>
                  <td className="px-4 py-1 border-b text-xs font-semibold uppercase">
                    {lokasi.nama}
                  </td>
                  <td className="px-4 py-1 border-b text-xs">{lokasi.koordinat}</td>
                  <td className="px-4 py-1 border-b text-xs text-center">
                    {lokasi.timezone}
                  </td>
                  <td className="px-4 py-1 border-b text-xs text-center">
                    <button onClick={() => navigate(`/lokasi-presensi/edit/${lokasi.id}`)} className="flex items-center space-x-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                      <FontAwesomeIcon icon={faEdit} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden">
        {currentItemsMobile.map((lokasi) => (
          <div
            key={lokasi.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm mb-3 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {lokasi.nama}
              </h3>

              <div className="flex items-center text-sm text-gray-600 gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500" />
                <span className="truncate">{lokasi.koordinat}</span>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex divide-x divide-gray-200">
              <div
                onClick={() => handleDelete(lokasi.id)}
                className="w-1/2 flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 text-sm font-medium cursor-pointer transition"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Hapus</span>
              </div>

              <div
                onClick={() => navigate(`/lokasi-presensi/edit/${lokasi.id}`)}
                className="w-1/2 flex items-center justify-center gap-2 py-2 text-yellow-600 hover:bg-yellow-50 text-sm font-medium cursor-pointer transition"
              >
                <FontAwesomeIcon icon={faEdit} />
                <span>Edit</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() =>
            setCurrentPageDesktop((prev) => Math.max(prev - 1, 1))
          }
          disabled={currentPageDesktop === 1}
          className={`rounded-full p-2 px-3 transition ${currentPageDesktop === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-500 text-white hover:bg-green-600"
            }`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <span className="text-sm text-gray-700 font-medium tracking-wide border border-gray-200 px-6 py-2 rounded-full">
          Halaman <span className="font-semibold">{currentPageDesktop}</span> /
          {Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)}
        </span>

        <button
          onClick={() =>
            setCurrentPageDesktop((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)
              )
            )
          }
          disabled={
            currentPageDesktop ===
            Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)
          }
          className={`rounded-full p-2 px-3 transition ${currentPageDesktop ===
            Math.ceil(filteredLokasiData.length / itemsPerPageDesktop)
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
