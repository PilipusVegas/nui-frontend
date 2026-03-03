import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Pagination } from "../../components/";
import TambahKendaraan from "./Tambah";
import EditKendaraan from "./Edit";
import ShowKendaraan from "./Show";

/* Mapping Kategori Kendaraan */
const KATEGORI_KENDARAAN = {
    1: "Motor",
    2: "Mobil",
};

const DataKendaraan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [vehicleData, setVehicleData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isShowOpen, setIsShowOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const itemsPerPage = 10;

    /* Helpers */
    const formatRupiah = (value) => {
        const number = Number(value);
        if (isNaN(number)) return "-";
        return `Rp ${number.toLocaleString("id-ID")}`;
    };

    const getKategoriLabel = (value) =>
        KATEGORI_KENDARAAN[value] ?? "-";

    /* ======================
     * Fetch Data
     * ====================== */
    useEffect(() => {
        fetchVehicleData();
    }, []);

    const fetchVehicleData = async () => {
        try {
            const response = await fetchWithJwt(`${apiUrl}/vehicles`);
            const result = await response.json();
            setVehicleData(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            setVehicleData([]);
        }
    };

    /* ======================
     * Delete
     * ====================== */
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Hapus Data Kendaraan?",
            text: "Data kendaraan akan dihapus secara permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetchWithJwt(
                `${apiUrl}/vehicles/${id}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                Swal.fire("Berhasil", "Data kendaraan berhasil dihapus", "success");
                fetchVehicleData();
            } else {
                Swal.fire("Gagal", "Gagal menghapus data kendaraan", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Terjadi kesalahan sistem", "error");
        }
    };

    /* ======================
     * Filter & Pagination
     * ====================== */
    const filteredData = vehicleData.filter((item) =>
        item?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    /* ======================
     * Render
     * ====================== */
    return (
        <div className="flex flex-col bg-white">
            <SectionHeader title="Data Kendaraan" subtitle="Data kendaraan digunakan untuk perhitungan konsumsi BBM dan fitur kunjungan." onBack={() => navigate("/home")}
                actions={
                    <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition active:scale-95">
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Tambah</span>
                    </button>
                }
            />

            {/* SEARCH */}
            <div className="mb-4">
                <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Cari Kendaraan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
                </div>
            </div>

            {/* ================= TABLE DESKTOP ================= */}
            <div className="rounded-lg shadow-md overflow-hidden hidden md:block">
                <table className="table-auto w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-green-500 text-white">
                            <th className="px-4 py-2 border-b text-center">No</th>
                            <th className="px-4 py-2 border-b">Nama Kendaraan</th>
                            <th className="px-4 py-2 border-b text-center">Kategori</th>
                            <th className="px-4 py-2 border-b text-center">Tahun</th>
                            <th className="px-4 py-2 border-b text-center">Konsumsi</th>
                            <th className="px-4 py-2 border-b">BBM</th>
                            <th className="px-4 py-2 border-b text-right">Harga BBM</th>
                            <th className="px-4 py-2 border-b text-center">Menu</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-200 transition">
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs font-semibold uppercase">
                                        {item.nama}
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        {getKategoriLabel(item.kategori)}
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        {item.tahun}
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        {item.konsumsi_bb} km/l
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs">
                                        {item.nama_bb}
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs text-right font-medium">
                                        {formatRupiah(item.harga_bb)}
                                    </td>
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* Detail */}
                                            <button
                                                onClick={() => {
                                                    setSelectedVehicle(item);
                                                    setIsShowOpen(true);
                                                }}
                                                className="
                                                    flex items-center gap-1.5
                                                    px-3 py-2
                                                    rounded-md
                                                    bg-blue-600 text-white
                                                    hover:bg-blue-700
                                                    transition
                                                "
                                            >
                                                <FontAwesomeIcon icon={faEye} className="text-[11px]" />
                                                <span>Detail</span>
                                            </button>

                                            {/* Edit */}
                                            <button
                                                onClick={() => {
                                                    setSelectedVehicle(item);
                                                    setIsEditOpen(true);
                                                }}
                                                className="
                                                    flex items-center gap-1.5
                                                    px-3 py-2
                                                    rounded-md
                                                    bg-yellow-500 text-white
                                                    hover:bg-yellow-600
                                                    transition
                                                "
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="text-[11px]" />
                                                <span>Edit</span>
                                            </button>

                                            {/* Hapus */}
                                            <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">
                                                <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-4 text-gray-500">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= MOBILE LIST ================= */}
            <div className="md:hidden space-y-3">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                            {/* HEADER */}
                            <div>
                                <div className="text-sm font-semibold truncate">
                                    {item.nama}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {getKategoriLabel(item.kategori)} • {item.tahun}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {item.nama_bb} • {item.konsumsi_bb} km/l
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedVehicle(item);
                                        setIsShowOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                    Detail
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedVehicle(item);
                                        setIsEditOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                        Tidak ada data ditemukan
                    </div>
                )}
            </div>

            <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />

            {/* ================= MODALS ================= */}
            <TambahKendaraan isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} apiUrl={apiUrl} onSuccess={fetchVehicleData} />
            <EditKendaraan isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedVehicle(null); }} apiUrl={apiUrl} data={selectedVehicle} onSuccess={fetchVehicleData} />
            <ShowKendaraan isOpen={isShowOpen} onClose={() => { setIsShowOpen(false); setSelectedVehicle(null); }} data={selectedVehicle} />
        </div>
    );
};

export default DataKendaraan;