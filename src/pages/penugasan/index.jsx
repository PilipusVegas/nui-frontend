import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faPlus, faClockRotateLeft, faEye, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
import Swal from "sweetalert2";

const Penugasan = () => {
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [tugas, setTugas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTugas = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/tugas`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setTugas(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Gagal memuat data tugas:", err);
            setError("Gagal memuat data tugas. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTugas();
    }, []);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Konfirmasi Penghapusan",
            text: "Yakin ingin menghapus penugasan ini? jika terhapus, penugasan tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, { method: "DELETE" });

            if (!res.ok) throw new Error(`Status ${res.status}`);

            await res.json();
            toast.success("Penugasan berhasil dihapus.");
            fetchTugas();
        } catch (err) {
            console.error("Gagal menghapus penugasan:", err);
            toast.error("Gagal menghapus penugasan. Silakan coba lagi.");
        }
    };

    // === Filter Search ===
    const filteredTugas = tugas.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    // === Pagination ===
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTugas = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // === Format Date ===
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };

    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Daftar Penugasan" subtitle={`Menampilkan ${tugas.length} data penugasan yang tercatat dalam sistem.`} onBack={() => navigate("/")}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate("/penugasan/tambah")} className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                            <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                            <span className="hidden md:inline ml-2">Tambah</span>
                        </button>
                        <button onClick={() => navigate("/penugasan/riwayat")} className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="text-sm sm:text-base" />
                            <span className="hidden md:inline ml-2">Riwayat</span>
                        </button>
                    </div>
                }
            />

            <div className="my-3">
                <SearchBar className="max-w-lg sm:max-w-full" placeholder="Cari nama tugas..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
            </div>

            {/* === TABLE DESKTOP === */}
            <div className="hidden md:block">
                <div className="mt-3 overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-md">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <thead className="bg-green-500 text-white font-semibold">
                            <tr>
                                <th className="px-5 py-3 text-center w-16">No.</th>
                                <th className="px-5 py-3 text-center">Kategori</th>
                                <th className="px-5 py-3">Nama Penugasan</th>
                                <th className="px-5 py-3 text-center">Batas Waktu</th>
                                <th className="px-5 py-3 text-center">Status Pengumpulan</th>
                                <th className="px-5 py-3 text-center">Keterangan</th>

                                <th className="px-5 py-3 text-center w-50">Menu</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center">
                                        <LoadingSpinner size="lg" text="Memuat data penugasan..." />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center">
                                        <ErrorState message={error} onRetry={fetchTugas} />
                                    </td>
                                </tr>
                            ) : currentTugas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center">
                                        <EmptyState message="Belum ada data penugasan." />
                                    </td>
                                </tr>
                            ) : (
                                currentTugas.map((item, index) => {
                                    const totalPekerja = item.details?.length || 0;
                                    const selesai = item.details?.filter((d) => {
                                        if (d.finished_at && d.status === 0) return true;
                                        if (d.finished_at && d.status === 1) return true;
                                        return false;
                                    }).length || 0;

                                    const progressPersen = totalPekerja > 0 ? Math.round((selesai / totalPekerja) * 100) : 0;

                                    const now = new Date();
                                    const deadline = new Date(item.deadline_at);
                                    const diffHari = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                                    const waktuStatus = diffHari > 0 ? `Tersisa ${diffHari} hari` : diffHari === 0 ? "Hari terakhir" : `Terlambat ${Math.abs(diffHari)} hari`;
                                    const pendingCount = item.details?.filter((d) => d.finished_at && d.status === 0)?.length || 0;
                                    const disetujuiCount = item.details?.filter((d) => d.finished_at && d.status === 1)?.length || 0;
                                    const ditolakCount = item.details?.filter((d) => d.finished_at && d.status === 2)?.length || 0;
                                    const ditundaCount = item.details?.filter((d) => d.is_paused === 1 && item.category === "urgent")?.length || 0;

                                    return (
                                        <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="px-1 py-2 text-center font-medium text-gray-700">
                                                {indexOfFirstItem + index + 1}
                                            </td>

                                            <td className="px-1 py-2 text-center font-medium text-gray-700">
                                                <span
                                                    className={`inline-block px-1 text-xs font-semibold rounded-md capitalize border min-w-[70px] ${item.category === "urgent"
                                                        ? "bg-red-100 text-red-700 border-red-300"
                                                        : "bg-green-100 text-green-700 border-green-300"
                                                        }`}
                                                >
                                                    {item.category}
                                                </span>
                                            </td>

                                            <td className="px-3 py-2 max-w-[250px]">
                                                <span className="block truncate text-gray-800 font-medium capitalize" title={item.nama}>
                                                    {item.nama}
                                                </span>
                                                <div className="text-xs text-gray-500">Dimulai : {formatDate(item.start_date)}</div>
                                            </td>

                                            <td className="px-5 py-2 text-center">
                                                <div className="flex flex-col items-center leading-tight">
                                                    <span className="text-xs font-medium text-gray-700">{formatDate(item.deadline_at)}</span>
                                                    <span
                                                        className={`text-xs mt-0.5 ${diffHari < 0
                                                            ? "text-red-600 font-semibold"
                                                            : diffHari === 0
                                                                ? "text-amber-600 font-semibold"
                                                                : "text-green-600 font-semibold"
                                                            }`}
                                                    >
                                                        {waktuStatus}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="relative w-[140px] h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                                                        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out ${progressPersen === 100 ? "bg-green-600" : progressPersen >= 50 ? "bg-green-400" : progressPersen > 0 ? "bg-amber-400" : "bg-gray-300"}`} style={{ width: `${progressPersen}%` }}></div>
                                                        <span
                                                            className={`absolute inset-0 flex items-center justify-center text-[11px] font-semibold ${progressPersen === 100 ? "text-white" : "text-gray-800"
                                                                }`}
                                                        >
                                                            {progressPersen === 100 ? "Selesai" : `${progressPersen}%`}
                                                        </span>
                                                    </div>

                                                    <div className="text-[11px] text-gray-700 font-medium mt-1">
                                                        {selesai}/{totalPekerja} Sudah Mengumpulkan
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2 text-xs text-center">
                                                <div className="grid grid-cols-2 gap-1 text-[12px] tracking-wide">
                                                    <div className="flex items-center justify-center gap-1 bg-blue-50 text-blue-700 rounded py-0.5 font-medium">
                                                        <span className="w-2 h-2 bg-blue-500 "></span>
                                                        Pending: <span className="font-semibold">{pendingCount}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1 bg-green-50 text-green-700 rounded py-0.5 font-medium">
                                                        <span className="w-2 h-2 bg-green-500 "></span>
                                                        Disetujui: <span className="font-semibold">{disetujuiCount}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1 bg-red-50 text-red-700 rounded py-0.5 font-medium">
                                                        <span className="w-2 h-2 bg-red-500 "></span>
                                                        Ditolak: <span className="font-semibold">{ditolakCount}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1 bg-amber-50 text-amber-700 rounded py-0.5 font-medium">
                                                        <span className="w-2 h-2 bg-amber-500 "></span>
                                                        Ditunda: <span className="font-semibold">{ditundaCount}</span>
                                                    </div>
                                                </div>
                                            </td>


                                            <td className="px-5 py-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className="px-3 py-2 rounded bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition">
                                                        <FontAwesomeIcon icon={faEye} className="mr-1" /> Detail
                                                    </button>
                                                    <button onClick={() => navigate(`/penugasan/edit/${item.id}`)} className="px-3 py-2 rounded bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition">
                                                        <FontAwesomeIcon icon={faPen} className="mr-1" /> Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="px-3 py-2 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition">
                                                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-2">
                        <Pagination currentPage={currentPage} totalItems={filteredTugas.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* === CARD MOBILE (Penugasan Sedang Berjalan) === */}
            <div className="md:hidden space-y-4">
                {loading && (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data penugasan..." />
                    </div>
                )}
                {!loading && error && <ErrorState message={error} onRetry={fetchTugas} />}
                {!loading && !error && currentTugas.length === 0 && (
                    <EmptyState message="Belum ada data penugasan aktif." />
                )}

                {!loading &&
                    !error &&
                    currentTugas.map((item) => {
                        const totalPekerja = item.details?.length || 0;
                        const selesai = item.details?.filter((d) => d.finished_at !== null).length || 0;
                        const progressPersen = totalPekerja > 0 ? Math.round((selesai / totalPekerja) * 100) : 0;
                        const now = new Date();
                        const deadline = new Date(item.deadline_at);
                        const diffHari = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                        const waktuStatus = diffHari > 0 ? `Berakhir dalam ${diffHari} hari` : diffHari === 0 ? "Batas waktu hari ini" : `Terlambat ${Math.abs(diffHari)} hari`;

                        return (
                            <div key={item.id} className="relative bg-white border border-gray-100 rounded-2xl shadow-sm p-4 transition hover:shadow-md">
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md capitalize border shadow-sm ${item.category === "urgent" ? "bg-red-100 text-red-700 border-red-300" : "bg-green-100 text-green-700 border-green-300"}`}>
                                        {item.category}
                                    </span>
                                </div>

                                <div className="pr-14">
                                    <h2 className="text-[13px] font-semibold text-gray-800 leading-snug truncate">
                                        {item.nama}
                                    </h2>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        Mulai:{" "}
                                        <span className="font-medium text-gray-700">
                                            {formatDate(item.start_date)}
                                        </span>
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        Deadline:{" "}
                                        <span className="font-medium text-gray-700">
                                            {formatDate(item.deadline_at)}
                                        </span>
                                    </p>
                                    <p className={`text-[11px] mt-0.5 font-medium ${diffHari < 0 ? "text-red-600" : diffHari === 0 ? "text-amber-600" : "text-green-600"}`}>
                                        {waktuStatus}
                                    </p>
                                </div>

                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] text-gray-700 font-medium">
                                            Progres Pengerjaan
                                        </p>
                                        <span className="text-[11px] text-gray-600">
                                            {selesai}/{totalPekerja} karyawan
                                        </span>
                                    </div>
                                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out ${progressPersen === 100 ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${progressPersen}%` }}></div>
                                        <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-semibold ${progressPersen === 100 ? "text-white" : "text-gray-800"}`}>
                                            {progressPersen === 100 ? "Selesai" : `${progressPersen}%`}
                                        </span>
                                    </div>
                                </div>

                                {/* === Tombol Aksi === */}
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className="px-3 py-1.5 rounded-md bg-green-500 text-white text-[11px] font-medium hover:bg-green-600 transition">
                                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                                        Lihat Detail
                                    </button>
                                    <button onClick={() => navigate(`/penugasan/edit/${item.id}`)} className="px-3 py-1.5 rounded-md bg-amber-500 text-white text-[11px] font-medium hover:bg-amber-600 transition">
                                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                {/* Pagination Mobile */}
                {filteredTugas.length > itemsPerPage && (
                    <Pagination currentPage={currentPage} totalItems={filteredTugas.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                )}
            </div>



            <Modal isOpen={false} onClose={() => { }} title="Detail Penugasan" note="Informasi fitur menu  penugasan lengkap akan ditampilkan di sini.">
                <div></div>
            </Modal>
        </div>
    );
};

export default Penugasan;
