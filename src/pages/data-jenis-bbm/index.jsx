import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Pagination } from "../../components/";
import TambahBBM from "./Tambah";
import EditBBM from "./Edit";

// Mapping kategori
const KATEGORI_LABEL = {
    1: "Bensin",
    2: "Listrik",
};

// Mapping satuan (defensive: number | string | null)
const SATUAN_LABEL = {
    1: "Liter",
    2: "kWh",
    liter: "Liter",
    kwh: "kWh",
    KWH: "kWh",
};
const DataJenisBBM = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [fuelData, setFuelData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedBBM, setSelectedBBM] = useState(null);

    const itemsPerPage = 10;

    /* Helpers */
    const formatRupiah = (value) => {
        const number = Number(value);
        if (isNaN(number)) return "-";
        return `Rp ${number.toLocaleString("id-ID")}`;
    };

    const getKategoriLabel = (value) =>
        KATEGORI_LABEL[value] ?? "-";

    const getSatuanLabel = (value) =>
        SATUAN_LABEL[value] ?? "-";


    /* Fetch Data */
    useEffect(() => {
        fetchFuelData();
    }, []);

    const fetchFuelData = async () => {
        try {
            const response = await fetchWithJwt(`${apiUrl}/fuels`);
            const result = await response.json();
            setFuelData(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error fetching fuel data:", error);
            setFuelData([]);
        }
    };

    /* Delete */
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Hapus Data BBM?",
            text: "Data ini akan dihapus secara permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetchWithJwt(`${apiUrl}/fuels/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                Swal.fire("Berhasil", "Data BBM berhasil dihapus", "success");
                fetchFuelData();
            } else {
                Swal.fire("Gagal", "Gagal menghapus data BBM", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Terjadi kesalahan sistem", "error");
        }
    };

    /* Filter & Pagination */
    const filteredData = fuelData.filter((item) =>
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

    return (
        <div className="flex flex-col bg-white">
            <SectionHeader title="Data Jenis BBM" subtitle="Halaman ini digunakan untuk perhitungan fitur kunjungan dan kebutuhan operasional." onBack={() => navigate("/home")}
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
                    <input type="text" placeholder="Cari Jenis BBM..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
                </div>
            </div>

            {/* TABLE DESKTOP */}
            <div className="rounded-lg shadow-md overflow-hidden hidden md:block">
                <table className="table-auto w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-green-500 text-white">
                            <th className="px-4 py-2 border-b text-sm font-semibold text-center">
                                No
                            </th>
                            <th className="px-4 py-2 border-b text-sm font-semibold">
                                Nama BBM
                            </th>
                            <th className="px-4 py-2 border-b text-sm font-semibold text-center">
                                Kategori
                            </th>
                            <th className="px-4 py-2 border-b text-sm font-semibold text-right">
                                Harga / Satuan
                            </th>
                            <th className="px-4 py-2 border-b text-sm font-semibold text-center">
                                Menu
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-200 transition-colors duration-150">
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        {startIndex + index + 1}
                                    </td>

                                    <td className="px-4 py-2 border-b text-xs font-semibold uppercase">
                                        {item.nama || "-"}
                                    </td>

                                    {/* KATEGORI (LABEL, BUKAN ANGKA) */}
                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        {getKategoriLabel(item.kategori)}
                                    </td>

                                    {/* HARGA + SATUAN */}
                                    <td className="px-4 py-2 border-b text-xs text-right font-medium">
                                        {formatRupiah(item.harga ?? item.harga_pl)}
                                        <span className="text-gray-500">
                                            {" "} / {getSatuanLabel(item.satuan)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 border-b text-xs text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBBM(item);
                                                    setIsEditOpen(true);
                                                }}
                                                className="flex items-center gap-1 text-xs bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                <span>Edit</span>
                                            </button>

                                            <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition">
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
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

            {/* MOBILE LIST (BUTTON STYLE) */}
            <div className="md:hidden space-y-2">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-100 transition">
                            {/* LEFT INFO */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-gray-800 truncate">
                                    {item.nama || "-"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {getKategoriLabel(item.kategori)} ·{" "}
                                    {formatRupiah(item.harga ?? item.harga_pl)} / {getSatuanLabel(item.satuan)}
                                </span>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-2 ml-3">
                                <button onClick={() => { setSelectedBBM(item); setIsEditOpen(true); }} className="p-1 px-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition" title="Edit">
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>

                                <button onClick={() => handleDelete(item.id)} className="p-1 px-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition" title="Hapus">
                                    <FontAwesomeIcon icon={faTrash} />
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

            {/* MODAL TAMBAH */}
            <TambahBBM isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} apiUrl={apiUrl} onSuccess={fetchFuelData} />
            <EditBBM isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedBBM(null); }} apiUrl={apiUrl} data={selectedBBM}
                onSuccess={fetchFuelData}
            />
        </div>
    );
};

export default DataJenisBBM;