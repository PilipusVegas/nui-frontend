import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faMapMarkerAlt, faBuilding, faStore, faHouse, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, Pagination, SearchBar, ErrorState, SectionHeader, Modal } from "../../components";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [lokasiData, setLokasiData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeKategori, setActiveKategori] = useState("ALL");
  const [openKategoriModal, setOpenKategoriModal] = useState(false);


  /* ================= FETCH DATA ================= */
  const fetchLokasiData = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetchWithJwt(`${apiUrl}/lokasi/`);
      const result = await response.json();
      setLokasiData(result.data || []);
    } catch (err) {
      console.error("Error fetching lokasi:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLokasiData();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Anda yakin ingin menghapus?",
      text: "Data ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetchWithJwt(
        `${apiUrl}/lokasi/delete/${id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        Swal.fire("Berhasil", "Data berhasil dihapus", "success");
        fetchLokasiData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ================= FILTER & PAGINATION ================= */
  const filteredData = lokasiData
    .filter((item) =>
      activeKategori === "ALL"
        ? true
        : item.kategori === activeKategori
    )
    .filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeKategori]);

  const tabs = [
    { label: "Semua", value: "ALL" },
    { label: "Kantor", value: 1 },
    { label: "Gerai", value: 2 },
    { label: "Rumah", value: 3 },
  ];

  const MAX_VISIBLE_TABS = 5;
  const visibleTabs = tabs.slice(0, MAX_VISIBLE_TABS);
  const overflowTabs = tabs.slice(MAX_VISIBLE_TABS);
  const [openMoreTab, setOpenMoreTab] = useState(false);

  const renderTab = (tab) => {
    const isActive = activeKategori === tab.value;

    return (
      <button key={tab.value} onClick={() => setActiveKategori(tab.value)}
        className={`shrink-0 px-3 py-1.5 text-xs sm:text-sm rounded-lg border font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-green-300
        ${isActive ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"}
      `}
      >
        {tab.label}
      </button>
    );
  };

  const openGoogleMaps = (koordinat) => {
    if (!koordinat) return;

    // asumsi format: "lat,lng"
    const url = `https://www.google.com/maps?q=${encodeURIComponent(koordinat)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ================= RENDER ================= */
  return (
    <>
      <div className="flex flex-col bg-white">

        <SectionHeader title="Data Lokasi" subtitle={`Total ${filteredData.length} lokasi terdaftar`} onBack={() => navigate("/home")}
          actions={
            <button onClick={() => setOpenKategoriModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition">
              <FontAwesomeIcon icon={faPlus} />
              Tambah
            </button>
          }
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="order-2 md:order-1 md:flex-1">
            {/* MOBILE — scroll horizontal */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar md:hidden">
              {tabs.map(renderTab)}
            </div>

            {/* DESKTOP — tabs + dropdown */}
            <div className="hidden md:flex gap-2 items-center relative">

              {/* tab utama */}
              {visibleTabs.map(renderTab)}

              {/* dropdown Lainnya */}
              {overflowTabs.length > 0 && (
                <div className="relative">
                  <button onClick={() => setOpenMoreTab((prev) => !prev)} className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-100">
                    Lainnya ▾
                  </button>

                  {openMoreTab && (
                    <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-md min-w-[160px] z-20">
                      {overflowTabs.map((tab) => (
                        <button key={tab.value} onClick={() => { setActiveKategori(tab.value); setOpenMoreTab(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SEARCH — kanan di desktop, atas di mobile */}
          <div className="order-1 md:order-2 w-full md:w-72">
            <SearchBar placeholder="Cari Lokasi..." onSearch={(val) => setSearchTerm(val)} />
          </div>
        </div>

        {/* LOADING */}
        {loading && <LoadingSpinner />}

        {/* ERROR */}
        {!loading && error && (
          <ErrorState onRetry={fetchLokasiData} />
        )}

        {/* EMPTY */}
        {!loading && !error && filteredData.length === 0 && (
          <EmptyState title="Data Lokasi Kosong" description="Belum ada data lokasi atau hasil pencarian tidak ditemukan." actionText="Tambah Lokasi" onAction={() => navigate("/data-lokasi/tambah")} />
        )}

        {/* ================= TABLE DESKTOP ================= */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="hidden md:block rounded-lg shadow-md overflow-hidden">
            <table className="table-auto w-full text-sm border-collapse">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">Nama Lokasi</th>
                  <th className="px-4 py-2">Koordinat</th>
                  <th className="px-4 py-2">Timezone</th>
                  <th className="px-4 py-2">Menu</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-150 border-b border-gray-200">
                    <td className="px-4 py-2 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 font-semibold uppercase">
                      {item.nama}
                    </td>
                    <td className="px-4 py-2">{item.koordinat}</td>
                    <td className="px-4 py-2 text-center">
                      {item.timezone}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button onClick={() => openGoogleMaps(item.koordinat)} className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" title="Lihat lokasi di Google Maps">
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Maps
                      </button>
                      <button onClick={() => navigate(`/data-lokasi/edit/${item.id}`)} className="px-3 py-2 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                        <FontAwesomeIcon icon={faTrash} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        

        {/* ================= MOBILE CARD ================= */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="md:hidden space-y-3">
            {paginatedData.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                    {item.nama}
                  </h3>

                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 mt-0.5" />
                    <span className="break-all">{item.koordinat}</span>
                  </div>
                </div>

                <div className="px-4 pb-3 flex justify-end gap-2">
                  <button onClick={() => openGoogleMaps(item.koordinat)} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                    Maps
                  </button>
                  <button onClick={() => navigate(`/data-lokasi/edit/${item.id}`)} className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition">
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition">
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && filteredData.length > 0 && (
          <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        )}
      </div>

      <Modal isOpen={openKategoriModal} onClose={() => setOpenKategoriModal(false)} title="Pilih Jenis Lokasi" note="Setiap jenis lokasi memiliki fungsi yang berbeda" size="md">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Kantor", value: 1, icon: faBuilding, desc: "Digunakan untuk absensi dan kunjungan kerja", },
            { label: "Gerai", value: 2, icon: faStore, desc: "Digunakan untuk absensi dan kunjungan kerja", },
            { label: "Rumah", value: 3, icon: faHouse, desc: "Digunakan untuk mulai dan selesai kunjungan", },
          ].map((item) => (
            <button key={item.value}
              onClick={() => {
                setOpenKategoriModal(false);
                navigate("/data-lokasi/tambah", {
                  state: { kategori: item.value },
                });
              }}
              className="
          group w-full rounded-xl border border-gray-200
          flex flex-col items-center justify-center text-center
          min-h-[120px] sm:min-h-[180px]
          p-3 sm:p-4
          transition-all duration-200
          hover:border-green-500 hover:bg-green-50
          focus:outline-none focus:ring-2 focus:ring-green-300
        "
            >
              {/* ICON */}
              <div className="mb-2 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600 transition">
                <FontAwesomeIcon icon={item.icon} className="text-sm sm:text-lg" />
              </div>

              {/* LABEL */}
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                {item.label}
              </h3>

              {/* DESC */}
              <p className="mt-1 text-[9px] sm:text-[11px] text-gray-700 leading-snug">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </Modal>

    </>
  );
};

export default DataLokasi;