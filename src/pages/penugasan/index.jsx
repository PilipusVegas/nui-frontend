import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faPlus, faEye, faTrash, faPen, faClipboardList, faPause, faChartLine, faListCheck, faFire, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar, SummaryCard, } from "../../components";
import Swal from "sweetalert2";

const Penugasan = () => {
    const itemsPerPage = 3;
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

    const filteredTugas = tugas.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTugas = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };

    // === SUMMARY COUNT TAMBAHAN ===
    const totalButuhApproval = tugas.reduce((acc, t) => {
        const count = t.details?.filter(d => d.finished_at && d.status === 0).length || 0;
        return acc + count;
    }, 0);
    const totalPaused = tugas.reduce((acc, t) => {
        const count = t.details?.filter(d => d.is_paused === 1).length || 0;
        return acc + count;
    }, 0);
    const averageProgress = (() => {
        if (tugas.length === 0) return 0;
        const list = tugas.map(t => {
            const total = t.details?.length || 0;
            const selesai = t.details?.filter(d => d.finished_at)?.length || 0;
            return total > 0 ? (selesai / total) * 100 : 0;
        });
        const avg = list.reduce((a, b) => a + b, 0) / list.length;
        return Math.round(avg);
    })();
    const jumlahPenugasan = tugas.length;
    const kategoriUrgent = tugas.filter(t => t.category === "urgent").length;
    const kategoriDaily = tugas.filter(t => t.category === "daily").length;


    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Daftar Penugasan" subtitle={`Menampilkan ${tugas.length} data penugasan yang tercatat dalam sistem.`} onBack={() => navigate("/")}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate("/penugasan/tambah")} className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                            <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                            <span className="hidden md:inline ml-2">Tugas</span>
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
                <SummaryCard icon={faClipboardList} title="Butuh Approval" value={totalButuhApproval} />
                <SummaryCard icon={faPause} title="Tugas Di-Pause" value={totalPaused} />
                <SummaryCard icon={faChartLine} title="Rata-Rata Progress" value={`${averageProgress}%`} />
                <SummaryCard icon={faListCheck} title="Jumlah Penugasan" value={jumlahPenugasan} />
                <SummaryCard icon={faFire} title="Kategori Urgent" value={kategoriUrgent} />
                <SummaryCard icon={faCalendar} title="Kategori Daily" value={kategoriDaily} />
            </div>

            <div className="my-3">
                <SearchBar className="max-w-lg sm:max-w-full" placeholder="Cari nama tugas..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
            </div>

            <div className="space-y-3 mt-4">
                {loading && (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data penugasan..." />
                    </div>
                )}

                {!loading && error && <ErrorState message={error} onRetry={fetchTugas} />}

                {!loading && !error && currentTugas.length === 0 && (
                    <EmptyState message="Belum ada data penugasan." />
                )}

                {!loading &&
                    !error &&
                    currentTugas.map((item, index) => {
                        const totalPekerja = item.details?.length || 0;
                        const selesai = item.details?.filter(d => d.finished_at && [0, 1].includes(d.status))?.length || 0;
                        const progressPersen = totalPekerja > 0 ? Math.round((selesai / totalPekerja) * 100) : 0;

                        const pendingCount = item.details?.filter(d => d.finished_at && d.status === 0)?.length || 0;
                        const disetujuiCount = item.details?.filter(d => d.status === 1)?.length || 0;
                        const ditolakCount = item.details?.filter(d => d.status === 2)?.length || 0;
                        const ditundaCount = item.details?.filter(d => d.is_paused === 1)?.length || 0;

                        const now = new Date();
                        const deadline = new Date(item.deadline_at);
                        const diffHari = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                        const waktuStatus = diffHari > 0 ? `Tersisa ${diffHari} hari` : diffHari === 0 ? "Hari terakhir" : `Terlambat ${Math.abs(diffHari)} hari`;
                        const warnaStatus = diffHari > 0 ? "text-green-600" : diffHari === 0 ? "text-amber-600" : "text-red-600";

                        return (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col gap-4">

                                {/* ===================== ROW 1 — HEADER + COUNTERS ===================== */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="flex-shrink-0 px-2 py-[3px] rounded-md bg-green-100 text-green-600 border border-green-200 text-xs font-semibold">
                                            {indexOfFirstItem + index + 1}
                                        </span>
                                        <h2 className="text-sm sm:text-md font-semibold text-gray-900 leading-tight min-w-0 flex-1 line-clamp-2">
                                            {item.nama}
                                        </h2>
                                    </div>

                                    {/* RIGHT: STATUS COUNTERS */}
                                    <div className="grid grid-cols-4 gap-3 text-[11px] sm:text-[12px] flex-shrink-0">
                                        <div className="text-center">
                                            <p className="text-blue-600 font-semibold leading-tight">Pending</p>
                                            <p className="font-bold text-blue-800">{pendingCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-green-600 font-semibold leading-tight">Setuju</p>
                                            <p className="font-bold text-green-800">{disetujuiCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-red-600 font-semibold leading-tight">Tolak</p>
                                            <p className="font-bold text-red-800">{ditolakCount}</p>
                                        </div>
                                        {item.category === "urgent" ? (
                                            <div className="text-center">
                                                <p className="text-amber-600 font-semibold leading-tight">Tunda</p>
                                                <p className="font-bold text-amber-800">{ditundaCount}</p>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1 text-gray-700">
                                        <div className="flex flex-col items-center gap-[2px]">
                                            <span className="text-[11px] text-gray-500 leading-none">Mulai</span>
                                            <span className="text-[13px] font-medium leading-tight">{formatDate(item.start_date)}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-[2px]">
                                            <span className="text-[11px] text-gray-500 leading-none">Tenggat</span>
                                            <span className="text-[13px] font-medium leading-tight">{formatDate(item.deadline_at)}</span>
                                            <span className={`text-[10px] font-semibold leading-tight ${warnaStatus}`}>
                                                ({waktuStatus})
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center gap-[3px]">
                                            <span className="text-[11px] text-gray-500 leading-none">Penugasan</span>
                                            <span className="text-sm font-semibold leading-tight">{totalPekerja} Tugas</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-[6px]">
                                            <span className="text-[11px] text-gray-500 leading-none">Kategori</span>
                                            <span className={`px-2 py-[1px] text-[10px] rounded border font-semibold capitalize leading-tight ${item.category === "urgent" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}`}>
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center gap-[2px]">
                                            <span className="text-[11px] text-gray-500 leading-none">Progress</span>

                                            <div className="relative h-9 w-9">
                                                <svg className="h-9 w-9">
                                                    <circle cx="18" cy="18" r="14" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                                    <circle
                                                        cx="18"
                                                        cy="18"
                                                        r="14"
                                                        stroke="#f59e0b"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={2 * Math.PI * 14}
                                                        strokeDashoffset={(2 * Math.PI * 14) * (1 - progressPersen / 100)}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>

                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                                                    {progressPersen}%
                                                </span>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="flex justify-end gap-2 flex-wrap w-full lg:w-max">
                                        <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700">
                                            <FontAwesomeIcon icon={faEye} />
                                            <span>Lihat</span>
                                        </button>

                                        <button onClick={() => navigate(`/penugasan/edit/${item.id}`)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500 text-white text-xs hover:bg-amber-600">
                                            <FontAwesomeIcon icon={faPen} />
                                            <span>Edit</span>
                                        </button>

                                        <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-600 text-white text-xs hover:bg-red-700">
                                            <FontAwesomeIcon icon={faTrash} />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                {/* PAGINATION */}
                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredTugas.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>




            <Modal isOpen={false} onClose={() => { }} title="Detail Penugasan" note="Informasi fitur menu  penugasan lengkap akan ditampilkan di sini.">
                <div></div>
            </Modal>
        </div >
    );
};

export default Penugasan;
