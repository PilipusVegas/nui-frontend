import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTrash, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Pagination } from "../../components/";
import Swal from "sweetalert2";
import TambahKendaraanKaryawan from "./Tambah";
import EditKendaraanKaryawan from "./Edit";

const KendaraanKaryawan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const itemsPerPage = 10;

    /* ======================
     * Helpers
     * ====================== */
    const formatRupiah = (value) =>
        `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

    /* ======================
     * Fetch Data
     * ====================== */
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/vehicles/users`);
            const json = await res.json();
            setData(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            setData([]);
        }
    };

    const handleDelete = async (item) => {
        const confirm = await Swal.fire({
            title: "Hapus Kendaraan Karyawan?",
            html: `
            <div style="text-align:left;font-size:13px">
                <b>Karyawan:</b> ${item.nama_user}<br/>
                <b>Kendaraan:</b> ${item.nama_kendaraan}
            </div>
        `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
        });
        if (!confirm.isConfirmed) return;
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/vehicles/users/${item.id_user_kendaraan}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error();
            Swal.fire(
                "Berhasil",
                "Relasi kendaraan karyawan berhasil dihapus",
                "success"
            );
            fetchData();
        } catch (err) {
            Swal.fire(
                "Gagal",
                "Gagal menghapus data kendaraan karyawan",
                "error"
            );
        }
    };

    /* ======================
     * Filter & Pagination
     * ====================== */
    const filteredData = data.filter((item) =>
        `${item.nama_user} ${item.nip_user} ${item.nama_kendaraan}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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
            <SectionHeader title="Kendaraan Karyawan" subtitle="Daftar kendaraan yang digunakan oleh karyawan untuk operasional dan kunjungan."
                onBack={() => navigate("/home")}
                actions={
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Tambah
                    </button>
                }
            />

            {/* SEARCH */}
            <div className="mb-4">
                <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Cari nama karyawan, NIP, atau kendaraan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
                </div>
            </div>

            {/* ================= TABLE DESKTOP ================= */}
            <div className="hidden md:block rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-green-500 text-white">
                            <th className="px-3 py-3 text-center">No</th>
                            <th className="px-3 py-3">Karyawan</th>
                            <th className="px-3 py-3">Kendaraan</th>
                            <th className="px-3 py-3 text-center">Tahun</th>
                            <th className="px-3 py-3 text-center">Konsumsi</th>
                            <th className="px-3 py-3">BBM</th>
                            <th className="px-3 py-3 text-right">Harga BBM</th>
                            <th className="px-3 py-3 text-center">Menu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length ? (
                            currentItems.map((item, index) => (
                                <tr key={`${item.id_user}-${item.id_kendaraan}`} className="hover:bg-gray-100">
                                    <td className="px-3 py-2 text-center">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="font-semibold">{item.nama_user}</div>
                                        <div className="text-xs text-gray-700">{item.role}</div>
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-center">
                                        {item.nama_kendaraan}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.tahun_kendaraan}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.konsumsi_bb} km/l
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.nama_bb}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {formatRupiah(item.harga_bb)}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelected(item);
                                                    setIsEditOpen(true);
                                                }}
                                                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="text-center py-6 text-gray-500"
                                >
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="md:hidden space-y-2">
                {currentItems.length ? (
                    currentItems.map((item) => (
                        <div
                            key={`${item.id_user}-${item.id_kendaraan}`}
                            className="p-4 border rounded-lg shadow-sm bg-white"
                        >
                            <div className="font-semibold">
                                {item.nama_user}
                            </div>
                            <div className="text-xs text-gray-500">
                                {item.nip_user} · {item.role}
                            </div>
                            <div className="text-xs text-gray-400 mb-2">
                                {item.perusahaan}
                            </div>

                            <div className="text-sm">
                                {item.nama_kendaraan} ({item.tahun_kendaraan})
                            </div>
                            <div className="text-xs text-gray-500">
                                {item.nama_bb} · {item.konsumsi_bb} km/l
                            </div>

                            <button
                                onClick={() => {
                                    setSelected(item);
                                    setIsEditOpen(true);
                                }}
                                className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md"
                            >
                                Edit Kendaraan
                            </button>

                            <button
                                onClick={() => handleDelete(item)}
                                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md"
                            >
                                Hapus Kendaraan
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-gray-500 py-6">
                        Tidak ada data
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            <TambahKendaraanKaryawan isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} apiUrl={apiUrl} onSuccess={fetchData} />

            <EditKendaraanKaryawan
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelected(null);
                }}
                apiUrl={apiUrl}
                idUserKendaraan={selected?.id_user_kendaraan} // ✅ FIX
                onSuccess={fetchData}
            />

        </div>
    );
};

export default KendaraanKaryawan;