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

            <div className="space-y-4 mt-4">

                {loading && (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data penugasan..." />
                    </div>
                )}

                {!loading && error && <ErrorState message={error} onRetry={fetchTugas} />}

                {!loading && !error && currentTugas.length === 0 && (
                    <EmptyState message="Belum ada data penugasan." />
                )}

                {!loading && !error && currentTugas.map((item, index) => {
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
                        <div key={item.id} className="bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 md:gap-3">
                            {/* ===================== HEADER ===================== */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3">

                                {/* Nomor + Nama */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className="px-2 py-[3px] rounded-lg bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold min-w-[28px] text-center">
                                        {indexOfFirstItem + index + 1}
                                    </span>

                                    <h2 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
                                        {item.nama}
                                    </h2>
                                </div>

                                {/* STATUS & PROGRESS */}
                                <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-4">
                                    <div className="w-full flex justify-around md:justify-center md:w-auto gap-5 md:gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-blue-700 font-semibold">Pending</p>
                                            <p className="font-bold text-blue-800">{pendingCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-green-700 font-semibold">Setuju</p>
                                            <p className="font-bold text-green-800">{disetujuiCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-red-700 font-semibold">Tolak</p>
                                            <p className="font-bold text-red-800">{ditolakCount}</p>
                                        </div>
                                        {item.category === "urgent" && (
                                            <div className="text-center">
                                                <p className="text-xs text-amber-700 font-semibold">Tunda</p>
                                                <p className="font-bold text-amber-800">{ditundaCount}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PROGRESS */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-[11px] text-gray-600 font-medium">Progress</span>
                                        <div className="relative h-9 w-9 mt-1">
                                            <svg className="h-9 w-9">
                                                <circle cx="18" cy="18" r="13" stroke="#d1d5db" strokeWidth="3" fill="none" />
                                                <circle cx="18" cy="18" r="13" stroke="#ea580c"  strokeWidth="3" fill="none" strokeDasharray={2 * Math.PI * 13} strokeDashoffset={(2 * Math.PI * 13) * (1 - progressPersen / 100)} strokeLinecap="round"/>
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-800">
                                                {progressPersen}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ===================== INFO GRID ===================== */}
                            <div className="w-full py-1 md:py-0.5">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-3 text-slate-900">

                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-500">Mulai Penugasan</span>
                                        <span className="text-sm font-semibold">{formatDate(item.start_date)}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-500">Tenggat Waktu</span>
                                        <span className="text-sm font-semibold">{formatDate(item.deadline_at)}</span>
                                        <span className={`text-[10px] font-semibold ${warnaStatus}`}>{waktuStatus}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-500">Total Penugasan</span>
                                        <span className="text-sm font-semibold">{totalPekerja} Tugas</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-500">Kategori Penugasan</span>
                                        <span className={`px-1.5 py-[2px] text-[10px] rounded font-semibold border capitalize w-fit ${item.category === "urgent"
                                                ? "bg-red-100 text-red-700 border-red-300"
                                                : "bg-emerald-100 text-emerald-700 border-emerald-300"
                                            }`}>
                                            {item.category}
                                        </span>
                                    </div>

                                    <div className="hidden lg:flex flex-col"></div>
                                    <div className="hidden lg:flex flex-col"></div>
                                </div>
                            </div>

                            {/* ===================== ACTION BUTTON ===================== */}
                            <div className="flex justify-end gap-2 flex-wrap mt-1 md:mt-0">
                                <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 font-semibold shadow-sm">
                                    <FontAwesomeIcon icon={faEye} />
                                    <span>Lihat</span>
                                </button>

                                <button onClick={() => navigate(`/penugasan/edit/${item.id}`)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500 text-white text-xs hover:bg-amber-600 font-semibold shadow-sm">
                                    <FontAwesomeIcon icon={faPen} />
                                    <span>Edit</span>
                                </button>

                                <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-600 text-white text-xs hover:bg-red-700 font-semibold shadow-sm">
                                    <FontAwesomeIcon icon={faTrash} />
                                    <span>Hapus</span>
                                </button>
                            </div>
                        </div>
                    );

                })}

                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-4">
                        <Pagination currentPage={currentPage} totalItems={filteredTugas.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
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
